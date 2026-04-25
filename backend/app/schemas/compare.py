from decimal import Decimal

from pydantic import BaseModel


class PoliticianCompareItem(BaseModel):
    """Comparative statistics for a single politician.

    Attributes:
        id (int): Internal politician ID.
        name (str): Full name.
        party (str | None): Party abbreviation.
        uf (str | None): State abbreviation.
        photo_url (str | None): Official photo URL.
        total_expenses (Decimal): Grand total of CEAP expenses.
        proposition_count (int): Total propositions authored.
        presence_rate (float): Presence rate as a percentage (0–100).
        total_votes (int): Total votes recorded.
    """

    id: int
    name: str
    party: str | None = None
    uf: str | None = None
    photo_url: str | None = None
    total_expenses: Decimal
    proposition_count: int
    presence_rate: float
    total_votes: int


class CompareResponse(BaseModel):
    """Comparative data for a group of politicians.

    Attributes:
        items (list[PoliticianCompareItem]): One entry per requested politician.
    """

    items: list[PoliticianCompareItem]
