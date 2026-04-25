from pydantic import BaseModel, ConfigDict


class PropositionResponse(BaseModel):
    """Single proposition record.

    Attributes:
        id (int): Internal ID.
        external_id (int): Câmara API ID.
        prop_type (str): Proposition type (PL, PEC, MPV…).
        number (int): Number within the year.
        year (int): Submission year.
        title (str | None): Short summary.
        status (str | None): Current processing status.
    """

    model_config = ConfigDict(from_attributes=True)

    id: int
    external_id: int
    prop_type: str
    number: int
    year: int
    title: str | None = None
    status: str | None = None


class PaginatedPropositions(BaseModel):
    """Paginated list of propositions.

    Attributes:
        items (list[PropositionResponse]): Page items.
        total (int): Total matching records.
        page (int): Current page.
        page_size (int): Items per page.
    """

    items: list[PropositionResponse]
    total: int
    page: int
    page_size: int
