from app.repositories.amendment_repository import AmendmentRepository
from app.schemas.amendment import AmendmentItem, AmendmentSummary, PaginatedAmendments

_PIX_TYPES: frozenset[str] = frozenset({
    "Emenda Pix",
    "Emenda de Relator",   # historical — declared unconstitutional 2022
    "Emenda RP 9",
})


class AmendmentService:
    """Business logic layer for parliamentary amendments.

    Attributes:
        _repo (AmendmentRepository): Data access layer.
    """

    def __init__(self, repo: AmendmentRepository) -> None:
        self._repo = repo

    async def list_amendments(
        self,
        *,
        year: int | None = None,
        year_from: int | None = None,
        year_to: int | None = None,
        amendment_type: str | None = None,
        politician_id: int | None = None,
        author_name: str | None = None,
        function_name: str | None = None,
        is_pix: bool | None = None,
        page: int = 1,
        page_size: int = 50,
    ) -> PaginatedAmendments:
        """Return a paginated list of amendments matching the given filters.

        Args:
            year (int | None): Filter by exact reference year.
            year_from (int | None): Filter by year >= value (inclusive).
            year_to (int | None): Filter by year <= value (inclusive).
            amendment_type (str | None): Filter by type.
            politician_id (int | None): Filter by linked politician.
            author_name (str | None): Partial, case-insensitive author name search.
            function_name (str | None): Filter by budget function.
            is_pix (bool | None): Filter Emenda Pix amendments.
            page (int): 1-based page number.
            page_size (int): Records per page.

        Returns:
            PaginatedAmendments: Paginated amendment items.
        """
        rows, total = await self._repo.list(
            year=year,
            year_from=year_from,
            year_to=year_to,
            amendment_type=amendment_type,
            politician_id=politician_id,
            author_name=author_name,
            function_name=function_name,
            is_pix=is_pix,
            page=page,
            page_size=page_size,
        )
        return PaginatedAmendments(
            items=[AmendmentItem.model_validate(r) for r in rows],
            total=total,
            page=page,
            page_size=page_size,
        )

    async def get_summary(
        self,
        *,
        year: int | None = None,
        year_from: int | None = None,
        year_to: int | None = None,
        politician_id: int | None = None,
    ) -> AmendmentSummary:
        """Return aggregated summary of amendments, optionally scoped to a politician.

        Args:
            year (int | None): Filter by exact year.
            year_from (int | None): Filter by year >= value (inclusive).
            year_to (int | None): Filter by year <= value (inclusive).
            politician_id (int | None): Scope to a specific politician's amendments.

        Returns:
            AmendmentSummary: Totals, Pix breakdown, by-type, by-function and top authors.
        """
        committed, paid, count = await self._repo.totals(year=year, year_from=year_from, year_to=year_to, politician_id=politician_id)
        pix_committed, pix_count = await self._repo.pix_totals(year=year, year_from=year_from, year_to=year_to, politician_id=politician_id)
        by_type = await self._repo.by_type(year=year, year_from=year_from, year_to=year_to, politician_id=politician_id)
        by_function = await self._repo.by_function(year=year, year_from=year_from, year_to=year_to, politician_id=politician_id)
        top_authors = await self._repo.top_authors(year=year)

        return AmendmentSummary(
            total_committed=committed,
            total_paid=paid,
            total_count=count,
            pix_committed=pix_committed,
            pix_count=pix_count,
            by_type=by_type,
            by_function=by_function,
            top_authors=top_authors,
        )
