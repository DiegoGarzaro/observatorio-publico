from decimal import Decimal

from pydantic import BaseModel, ConfigDict, field_serializer


class AmendmentItem(BaseModel):
    """Single parliamentary amendment, as returned in list endpoints.

    Attributes:
        id (int): Internal ID.
        external_code (str): Unique amendment code.
        year (int): Reference year.
        amendment_type (str | None): Type (e.g. 'Emenda Individual').
        author_name (str | None): Human-readable author name.
        politician_id (int | None): Linked politician ID, if resolved.
        locality (str | None): Target locality/UF.
        function_name (str | None): Budget function (e.g. 'Saúde').
        subfunction_name (str | None): Budget subfunction.
        committed_value (Decimal): Value reserved from the budget.
        liquidated_value (Decimal): Value confirmed as received.
        paid_value (Decimal): Value actually transferred.
        is_pix (bool): True for 'Emenda Pix' without beneficiary traceability.
    """

    id: int
    external_code: str
    year: int
    amendment_type: str | None
    author_name: str | None
    politician_id: int | None
    locality: str | None
    function_name: str | None
    subfunction_name: str | None
    committed_value: Decimal
    liquidated_value: Decimal
    paid_value: Decimal
    is_pix: bool

    model_config = ConfigDict(from_attributes=True)

    @field_serializer("committed_value", "liquidated_value", "paid_value")
    def serialize_decimal(self, value: Decimal) -> float:
        """Serialize Decimal as float so JSON consumers receive a number, not a string."""
        return float(value)


class PaginatedAmendments(BaseModel):
    """Paginated list of amendments.

    Attributes:
        items (list[AmendmentItem]): Records on the current page.
        total (int): Total number of records matching the filters.
        page (int): Current page number (1-based).
        page_size (int): Maximum records per page.
    """

    items: list[AmendmentItem]
    total: int
    page: int
    page_size: int


class AmendmentTypeTotal(BaseModel):
    """Total values per amendment type.

    Attributes:
        amendment_type (str | None): Type label.
        committed_value (Decimal): Sum of committed values.
        paid_value (Decimal): Sum of paid values.
        count (int): Number of amendments.
        is_pix (bool): True if this type is flagged as Emenda Pix.
    """

    amendment_type: str | None
    committed_value: Decimal
    paid_value: Decimal
    count: int
    is_pix: bool

    @field_serializer("committed_value", "paid_value")
    def serialize_decimal(self, value: Decimal) -> float:
        """Serialize Decimal as float so JSON consumers receive a number, not a string."""
        return float(value)


class AmendmentFunctionTotal(BaseModel):
    """Total values per budget function.

    Attributes:
        function_name (str | None): Budget function name.
        committed_value (Decimal): Sum of committed values.
        paid_value (Decimal): Sum of paid values.
        count (int): Number of amendments.
    """

    function_name: str | None
    committed_value: Decimal
    paid_value: Decimal
    count: int

    @field_serializer("committed_value", "paid_value")
    def serialize_decimal(self, value: Decimal) -> float:
        """Serialize Decimal as float so JSON consumers receive a number, not a string."""
        return float(value)


class AmendmentAuthorTotal(BaseModel):
    """Top authors by total committed amendment value.

    Attributes:
        author_name (str | None): Author name.
        politician_id (int | None): Linked politician ID if resolved.
        committed_value (Decimal): Total committed across all amendments.
        paid_value (Decimal): Total paid.
        count (int): Number of amendments.
    """

    author_name: str | None
    politician_id: int | None
    committed_value: Decimal
    paid_value: Decimal
    count: int

    @field_serializer("committed_value", "paid_value")
    def serialize_decimal(self, value: Decimal) -> float:
        """Serialize Decimal as float so JSON consumers receive a number, not a string."""
        return float(value)


class AmendmentSummary(BaseModel):
    """Aggregated summary of parliamentary amendments.

    Attributes:
        total_committed (Decimal): Grand total committed.
        total_paid (Decimal): Grand total paid.
        total_count (int): Total number of amendments.
        pix_committed (Decimal): Total committed via Emenda Pix (no traceability).
        pix_count (int): Number of Emenda Pix amendments.
        by_type (list[AmendmentTypeTotal]): Breakdown by amendment type.
        by_function (list[AmendmentFunctionTotal]): Breakdown by budget function.
        top_authors (list[AmendmentAuthorTotal]): Top 20 authors by committed value.
    """

    total_committed: Decimal
    total_paid: Decimal
    total_count: int
    pix_committed: Decimal
    pix_count: int
    by_type: list[AmendmentTypeTotal]
    by_function: list[AmendmentFunctionTotal]
    top_authors: list[AmendmentAuthorTotal]

    @field_serializer("total_committed", "total_paid", "pix_committed")
    def serialize_decimal(self, value: Decimal) -> float:
        """Serialize Decimal as float so JSON consumers receive a number, not a string."""
        return float(value)
