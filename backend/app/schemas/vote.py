from datetime import date

from pydantic import BaseModel, ConfigDict

_SENADO_MATERIA_URL = "https://www25.senado.leg.br/web/atividade/materias/-/materia/{codigo}"
_CAMARA_PROP_URL = "https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao={id}"


class VoteResponse(BaseModel):
    """Single vote record.

    Attributes:
        id (int): Internal ID.
        external_votacao_id (str): Votação ID from Câmara or Senado.
        proposition_id (int | None): Internal proposition ID.
        proposition_ref (str | None): Short proposition label, e.g. "PL 4614/2024".
        proposition_title (str | None): Proposition ementa, if linked.
        proposition_external_id (int | None): Câmara proposition ID for deep links.
        proposition_url (str | None): Direct URL to the proposition page.
        direction (str): Vote direction (Sim, Não, Abstenção, etc.).
        session_date (date | None): Date the session took place.
        description (str | None): Voting result text from the session.
    """

    model_config = ConfigDict(from_attributes=True)

    id: int
    external_votacao_id: str
    proposition_id: int | None = None
    proposition_external_id: int | None = None
    proposition_ref: str | None = None
    proposition_title: str | None = None
    proposition_url: str | None = None
    direction: str
    session_date: date | None = None
    description: str | None = None

    @classmethod
    def model_validate(cls, obj: object, **kwargs: object) -> "VoteResponse":
        """Build VoteResponse, resolving proposition fields from the relationship.

        For Câmara votes, derives the URL from the linked Proposition record.
        For Senado votes (external_votacao_id starts with 'senado-'), extracts
        the matéria codigo encoded in the last segment of the ID.

        Args:
            obj (object): ORM Vote instance or dict.

        Returns:
            VoteResponse: Populated schema instance.
        """
        instance = super().model_validate(obj, **kwargs)

        if hasattr(obj, "proposition") and obj.proposition is not None:  # type: ignore[union-attr]
            instance.proposition_title = obj.proposition.title  # type: ignore[union-attr]
            instance.proposition_external_id = obj.proposition.external_id  # type: ignore[union-attr]
            instance.proposition_url = _CAMARA_PROP_URL.format(id=obj.proposition.external_id)  # type: ignore[union-attr]
        elif instance.external_votacao_id.startswith("senado-"):
            # Format: senado-{senator_external_id}-{session_id}-{materia_codigo}
            parts = instance.external_votacao_id.split("-")
            materia_codigo = parts[-1] if len(parts) >= 4 else ""
            if materia_codigo.isdigit():
                instance.proposition_url = _SENADO_MATERIA_URL.format(codigo=materia_codigo)

        return instance


class PaginatedVotes(BaseModel):
    """Paginated list of votes.

    Attributes:
        items (list[VoteResponse]): Page items.
        total (int): Total matching records.
        page (int): Current page.
        page_size (int): Items per page.
    """

    items: list[VoteResponse]
    total: int
    page: int
    page_size: int


class DirectionCount(BaseModel):
    """Vote count for a single direction.

    Attributes:
        direction (str): Vote direction label.
        count (int): Number of votes.
    """

    direction: str
    count: int


class PresenceStats(BaseModel):
    """Presence and vote distribution summary for a politician.

    Attributes:
        total (int): Total votes in the period.
        presence_rate (float): Percentage of sessions attended (0-100).
        by_direction (list[DirectionCount]): Breakdown by vote direction.
    """

    total: int
    presence_rate: float
    by_direction: list[DirectionCount]
