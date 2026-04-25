from app.repositories.card_expense_repository import CardExpenseRepository
from app.schemas.card_expense import CardExpenseItem, CardExpenseSummary, PaginatedCardExpenses


class CardExpenseService:
    """Business logic layer for government credit card expenses.

    Attributes:
        _repo (CardExpenseRepository): Data access layer.
    """

    def __init__(self, repo: CardExpenseRepository) -> None:
        self._repo = repo

    async def list_expenses(
        self,
        organ_code: str,
        *,
        year: int | None = None,
        month: int | None = None,
        page: int = 1,
        page_size: int = 50,
    ) -> PaginatedCardExpenses:
        """Return a paginated list of card transactions for an organ.

        Args:
            organ_code (str): Government organ code (e.g. '20000' for Presidência).
            year (int | None): Filter by transaction year.
            month (int | None): Filter by transaction month (1–12).
            page (int): 1-based page number.
            page_size (int): Records per page.

        Returns:
            PaginatedCardExpenses: Paginated card expense items.
        """
        rows, total = await self._repo.list(
            organ_code=organ_code,
            year=year,
            month=month,
            page=page,
            page_size=page_size,
        )
        items = [CardExpenseItem.model_validate(r) for r in rows]
        return PaginatedCardExpenses(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
        )

    async def get_summary(
        self,
        organ_code: str,
        *,
        year: int | None = None,
    ) -> CardExpenseSummary:
        """Return aggregated summary of card expenses for an organ.

        Args:
            organ_code (str): Government organ code.
            year (int | None): Filter by year.

        Returns:
            CardExpenseSummary: Totals, monthly breakdown and top suppliers.
        """
        total = await self._repo.total(organ_code=organ_code, year=year)
        count = await self._repo.count(organ_code=organ_code, year=year)
        by_month = await self._repo.by_month(organ_code=organ_code, year=year)
        top_suppliers = await self._repo.top_suppliers(organ_code=organ_code, year=year)

        return CardExpenseSummary(
            total=total,
            count=count,
            by_month=by_month,
            top_suppliers=top_suppliers,
        )
