from app.exceptions import PoliticianNotFoundError
from app.repositories.expense_repository import ExpenseRepository
from app.repositories.politician_repository import PoliticianRepository
from app.schemas.expense import ExpenseSummary, PaginatedExpenses


class ExpenseService:
    """Business logic for expense queries."""

    def __init__(
        self,
        expense_repository: ExpenseRepository,
        politician_repository: PoliticianRepository,
    ) -> None:
        self._expenses = expense_repository
        self._politicians = politician_repository

    async def _assert_politician_exists(self, politician_id: int) -> None:
        """Raise if politician does not exist.

        Args:
            politician_id (int): Internal politician ID.

        Raises:
            PoliticianNotFoundError: If not found.
        """
        politician = await self._politicians.get_by_id(politician_id)
        if politician is None:
            raise PoliticianNotFoundError(politician_id)

    async def list_expenses(
        self,
        politician_id: int,
        *,
        year: int | None = None,
        month: int | None = None,
        category: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> PaginatedExpenses:
        """Return paginated expenses for a politician.

        Args:
            politician_id (int): Internal politician ID.
            year (int | None): Filter by year.
            month (int | None): Filter by month.
            category (str | None): Filter by category.
            page (int): Page number.
            page_size (int): Items per page.

        Returns:
            PaginatedExpenses: Paginated result.

        Raises:
            PoliticianNotFoundError: If the politician does not exist.
        """
        await self._assert_politician_exists(politician_id)
        expenses, total = await self._expenses.list_by_politician(
            politician_id,
            year=year,
            month=month,
            category=category,
            page=page,
            page_size=page_size,
        )
        return PaginatedExpenses(
            items=expenses,  # type: ignore[arg-type]
            total=total,
            page=page,
            page_size=page_size,
        )

    async def get_summary(
        self, politician_id: int, *, year: int | None = None
    ) -> ExpenseSummary:
        """Return aggregated expense summary for a politician.

        Args:
            politician_id (int): Internal politician ID.
            year (int | None): Filter by year.

        Returns:
            ExpenseSummary: Totals by category and month.

        Raises:
            PoliticianNotFoundError: If the politician does not exist.
        """
        await self._assert_politician_exists(politician_id)
        data = await self._expenses.get_summary(politician_id, year=year)
        return ExpenseSummary(**data)
