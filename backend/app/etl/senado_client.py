import csv
import io
import logging
import unicodedata
from typing import Any

import httpx

logger = logging.getLogger(__name__)

_BASE_URL = "https://legis.senado.leg.br/dadosabertos"
_CEAPS_URL = "https://www.senado.gov.br/transparencia/LAI/verba/despesa_ceaps_{year}.csv"
_HEADERS = {"Accept": "application/json"}
_TIMEOUT = httpx.Timeout(30.0)
_CSV_TIMEOUT = httpx.Timeout(120.0)


def normalize_name(name: str) -> str:
    """Normalize a name for fuzzy matching: uppercase, ASCII-only, collapsed spaces.

    Args:
        name (str): Raw name string.

    Returns:
        str: Normalized name.
    """
    nfkd = unicodedata.normalize("NFD", name)
    ascii_name = nfkd.encode("ascii", "ignore").decode("ascii")
    return " ".join(ascii_name.upper().split())


class SenadoClient:
    """Async HTTP client for the Senado Federal open API.

    Base URL: https://legis.senado.leg.br/dadosabertos
    No authentication required.
    """

    def __init__(self) -> None:
        self._client = httpx.AsyncClient(
            base_url=_BASE_URL,
            headers=_HEADERS,
            timeout=_TIMEOUT,
        )

    async def __aenter__(self) -> "SenadoClient":
        return self

    async def __aexit__(self, *_: Any) -> None:
        await self._client.aclose()

    async def _get(self, path: str) -> dict:
        """Perform a GET request and return parsed JSON.

        Args:
            path (str): API path (e.g. '/senador/lista/atual.json').

        Returns:
            dict: Parsed JSON response.

        Raises:
            httpx.HTTPStatusError: On non-2xx responses.
        """
        response = await self._client.get(path)
        response.raise_for_status()
        return response.json()

    async def get_senators(self) -> list[dict]:
        """Return all senators currently in office.

        Returns:
            list[dict]: Raw senator records from 'Parlamentar' array.
        """
        data = await self._get("/senador/lista/atual.json")
        parlamentares = (
            data
            .get("ListaParlamentarEmExercicio", {})
            .get("Parlamentares", {})
            .get("Parlamentar", [])
        )
        # The API may return a single dict when there's only one result
        if isinstance(parlamentares, dict):
            return [parlamentares]
        return parlamentares

    async def get_senator_detail(self, senator_id: int) -> dict:
        """Return full detail for a single senator.

        Args:
            senator_id (int): Senado API senator ID (CodigoParlamentar).

        Returns:
            dict: Senator detail from 'Parlamentar' key.
        """
        data = await self._get(f"/senador/{senator_id}.json")
        return (
            data
            .get("DetalheParlamentar", {})
            .get("Parlamentar", {})
        )

    async def get_ceaps_csv(self, year: int) -> list[dict]:
        """Download and parse the CEAPS expense CSV for a given year.

        Uses a one-off httpx client because the CSV is hosted on a different
        domain from the REST API base URL.

        Args:
            year (int): Reference year (e.g. 2024).

        Returns:
            list[dict]: Parsed rows as dictionaries, using CSV header keys.
        """
        url = _CEAPS_URL.format(year=year)
        async with httpx.AsyncClient(timeout=_CSV_TIMEOUT) as client:
            response = await client.get(url, follow_redirects=True)
            response.raise_for_status()

        # The CSV uses Latin-1 encoding and semicolon delimiters.
        # The first line is a metadata row (e.g. "ULTIMA ATUALIZACAO;..."),
        # and the second line contains the actual column headers — skip line 1.
        text = response.content.decode("latin-1")
        lines = text.splitlines(keepends=True)
        body = "".join(lines[1:]) if len(lines) > 1 else text
        reader = csv.DictReader(io.StringIO(body), delimiter=";")
        return [dict(row) for row in reader]

    async def get_senator_votes(self, senator_id: int, year: int | None = None) -> list[dict]:
        """Return voting records for a single senator.

        Args:
            senator_id (int): Senado API senator ID (CodigoParlamentar).
            year (int | None): Filter by year. If None, returns all available.

        Returns:
            list[dict]: Raw vote records from the API.
        """
        path = f"/senador/{senator_id}/votacoes.json"
        if year:
            path += f"?ano={year}"

        try:
            data = await self._get(path)
        except Exception:
            return []

        votacoes_raw = (
            data
            .get("VotacaoParlamentar", {})
            .get("Parlamentar", {})
            .get("Votacoes", {})
            .get("Votacao", [])
        )
        if isinstance(votacoes_raw, dict):
            return [votacoes_raw]
        return votacoes_raw if isinstance(votacoes_raw, list) else []
