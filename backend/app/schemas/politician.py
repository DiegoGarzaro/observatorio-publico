from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class PoliticianListItem(BaseModel):
    """Minimal politician data for list views.

    Attributes:
        id (int): Internal ID.
        name (str): Full name.
        role (str): Role type (e.g. deputado_federal, senador).
        source (str): Source API identifier (e.g. camara, senado, tse).
        party (str | None): Party abbreviation.
        uf (str | None): State abbreviation.
        municipality (str | None): Municipality name (vereadores and prefeitos).
        photo_url (str | None): Official photo URL.
        legislature (int | None): Legislature number or term start year.
    """

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    role: str = "deputado_federal"
    source: str = "camara"
    party: str | None = None
    uf: str | None = None
    municipality: str | None = None
    photo_url: str | None = None
    legislature: int | None = None

    @classmethod
    def from_orm_with_party(cls, politician) -> "PoliticianListItem":
        """Build schema resolving the party abbreviation from the relationship.

        Args:
            politician: Politician ORM instance with party loaded.

        Returns:
            PoliticianListItem: Populated schema.
        """
        return cls(
            id=politician.id,
            name=politician.name,
            role=politician.role,
            source=politician.source,
            party=politician.party.abbreviation if politician.party else None,
            uf=politician.uf,
            municipality=politician.municipality,
            photo_url=politician.photo_url,
            legislature=politician.legislature,
        )


class PoliticianResponse(PoliticianListItem):
    """Full politician profile.

    Attributes:
        email (str | None): Official email.
        phone (str | None): Official phone.
        mandate_end (int | None): Year the mandate ended (None if current).
    """

    email: str | None = None
    phone: str | None = None
    mandate_end: int | None = None


class PaginatedPoliticians(BaseModel):
    """Paginated list of politicians.

    Attributes:
        items (list[PoliticianListItem]): Page items.
        total (int): Total matching records.
        page (int): Current page.
        page_size (int): Items per page.
    """

    items: list[PoliticianListItem]
    total: int
    page: int
    page_size: int


class PoliticianWithMetrics(PoliticianListItem):
    """Politician list item enriched with mandate-period aggregate metrics.

    Attributes:
        total_expenses (Decimal): Grand total of CEAP expenses.
        proposition_count (int): Total propositions authored.
        presence_rate (float): Presence rate as a percentage (0–100).
        total_votes (int): Total votes recorded.
    """

    total_expenses: Decimal = Decimal("0")
    proposition_count: int = 0
    presence_rate: float = 0.0
    total_votes: int = 0


class PaginatedPoliticiansWithMetrics(BaseModel):
    """Paginated list of politicians enriched with metrics.

    Attributes:
        items (list[PoliticianWithMetrics]): Page items.
        total (int): Total matching records.
        page (int): Current page.
        page_size (int): Items per page.
    """

    items: list[PoliticianWithMetrics]
    total: int
    page: int
    page_size: int
