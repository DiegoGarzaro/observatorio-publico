import logging

from app.etl.senado_client import SenadoClient
from app.exceptions import PoliticianNotFoundError
from app.repositories.politician_repository import PoliticianRepository
from app.schemas.senator import SenatorCommittee, SenatorDetailResponse, SenatorMandate

logger = logging.getLogger(__name__)

# Legislature 48 started in 1987; each legislature is 4 years.
_LEG_48_YEAR = 1987


def _legislature_to_year(legislature: int) -> int:
    """Convert a legislature number to its starting calendar year.

    Args:
        legislature (int): Legislature number (e.g. 57).

    Returns:
        int: Starting year (e.g. 2023 for legislature 57).
    """
    return _LEG_48_YEAR + (legislature - 48) * 4


def _as_list(value: object) -> list:
    """Normalize a value that may be a list, a single dict, or None.

    Args:
        value (object): Raw API value.

    Returns:
        list: Always a list, empty when value is None or empty string.
    """
    if not value:
        return []
    if isinstance(value, list):
        return value
    if isinstance(value, dict):
        return [value]
    return []


class SenatorService:
    """Fetches and parses extended senator detail from the Senado open API."""

    def __init__(self, repository: PoliticianRepository, client: SenadoClient) -> None:
        self._repository = repository
        self._client = client

    async def get_detail(self, politician_id: int) -> SenatorDetailResponse:
        """Return extended senator profile by fetching live data from the Senado API.

        Args:
            politician_id (int): Internal politician ID.

        Returns:
            SenatorDetailResponse: Parsed senator detail.

        Raises:
            PoliticianNotFoundError: If no politician matches the given ID.
        """
        politician = await self._repository.get_by_id(politician_id)
        if politician is None:
            raise PoliticianNotFoundError(politician_id)

        try:
            raw = await self._client.get_senator_detail(politician.external_id)
        except Exception as exc:
            logger.warning(
                "Senado API unavailable for senator %d (ext_id=%d): %s",
                politician_id,
                politician.external_id,
                exc,
            )
            return SenatorDetailResponse()

        return self._parse(raw)

    def _parse(self, raw: dict) -> SenatorDetailResponse:
        """Parse raw Senado API response into a structured schema.

        Args:
            raw (dict): DetalheParlamentar.Parlamentar object from the Senado API.

        Returns:
            SenatorDetailResponse: Populated response schema.
        """
        # ── Website ──────────────────────────────────────────────────────────
        site_raw = raw.get("SitiosParlamentar", {}) or {}
        site_value = site_raw.get("SitioParlamentar")
        # May be a string, a list, or a dict with a URL key
        if isinstance(site_value, str):
            website = site_value or None
        elif isinstance(site_value, list):
            website = next((s for s in site_value if isinstance(s, str) and s), None)
        else:
            website = None

        # ── Bio ───────────────────────────────────────────────────────────────
        bio = raw.get("DadosBasicosParlamentar", {}) or {}
        birth_date: str | None = bio.get("DataNascimento") or None
        gender: str | None = bio.get("SexoParlamentar") or None

        # ── Committees (active only) ──────────────────────────────────────────
        committees_raw = _as_list((raw.get("MembroComissoes") or {}).get("Comissao"))
        committees: list[SenatorCommittee] = []
        for c in committees_raw:
            if not isinstance(c, dict):
                continue
            # Skip expired memberships (DataFim present and non-empty)
            if c.get("DataFim"):
                continue
            committees.append(
                SenatorCommittee(
                    name=c.get("NomeComissao", ""),
                    abbreviation=c.get("SiglaComissao") or None,
                    role=c.get("DescricaoParticipacao") or None,
                )
            )

        # ── Mandate history ───────────────────────────────────────────────────
        mandates_raw = _as_list((raw.get("Mandatos") or {}).get("Mandato"))
        ident = raw.get("IdentificacaoParlamentar", {}) or {}
        current_party: str | None = ident.get("SiglaPartidoParlamentar") or None

        mandates: list[SenatorMandate] = []
        for m in mandates_raw:
            if not isinstance(m, dict):
                continue
            primeira = m.get("PrimeiraLegislaturaDoMandato") or {}
            leg_raw = primeira.get("NumeroLegislatura")
            if not leg_raw:
                continue
            try:
                leg = int(leg_raw)
            except (ValueError, TypeError):
                continue
            start_year = _legislature_to_year(leg)
            mandates.append(
                SenatorMandate(
                    legislature=leg,
                    uf=m.get("UfParlamentar") or None,
                    party=current_party,  # party at parse time; historical not available
                    start_year=start_year,
                    end_year=start_year + 7,  # senate terms span 8 years
                )
            )

        mandates.sort(key=lambda m: m.legislature)

        return SenatorDetailResponse(
            website=website,
            birth_date=birth_date,
            gender=gender,
            committees=committees,
            mandates=mandates,
        )
