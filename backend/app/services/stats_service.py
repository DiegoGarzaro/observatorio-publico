from app.repositories.expense_repository import ExpenseRepository
from app.schemas.stats import GlobalExpenseSummary


class StatsService:
    """Business logic for aggregate statistics."""

    def __init__(self, expense_repository: ExpenseRepository) -> None:
        self._expenses = expense_repository

    async def get_global_expense_summary(self, *, year: int | None = None) -> GlobalExpenseSummary:
        """Return aggregated CEAP expense summary across all politicians.

        Args:
            year (int | None): Filter by year. Returns all years if None.

        Returns:
            GlobalExpenseSummary: Grand total, politician count, monthly and category breakdowns.
        """
        data = await self._expenses.get_global_summary(year=year)
        return GlobalExpenseSummary(**data)
