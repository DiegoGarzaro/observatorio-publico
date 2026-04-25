from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.expense import Expense


class ExpenseRepository:
    """Data access layer for Expense records."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_by_politician(
        self,
        politician_id: int,
        *,
        year: int | None = None,
        month: int | None = None,
        category: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[Expense], int]:
        """Return paginated expenses for a politician.

        Args:
            politician_id (int): Internal politician ID.
            year (int | None): Filter by year.
            month (int | None): Filter by month.
            category (str | None): Filter by expense category.
            page (int): Page number (1-based).
            page_size (int): Results per page.

        Returns:
            tuple[list[Expense], int]: Page of expenses and total count.
        """
        base_query = select(Expense).where(Expense.politician_id == politician_id)

        if year:
            base_query = base_query.where(Expense.year == year)
        if month:
            base_query = base_query.where(Expense.month == month)
        if category:
            base_query = base_query.where(Expense.category == category)

        count_result = await self._session.execute(
            select(func.count()).select_from(base_query.subquery())
        )
        total = count_result.scalar_one()

        result = await self._session.execute(
            base_query.order_by(Expense.year.desc(), Expense.month.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        return list(result.scalars()), total

    async def get_summary(self, politician_id: int, *, year: int | None = None) -> dict:
        """Return expense totals grouped by category and month.

        Args:
            politician_id (int): Internal politician ID.
            year (int | None): Filter by year. Defaults to all years.

        Returns:
            dict: Keys 'total', 'by_category', 'by_month'.
        """
        base_filter = [Expense.politician_id == politician_id]
        if year:
            base_filter.append(Expense.year == year)

        total_result = await self._session.execute(
            select(func.coalesce(func.sum(Expense.value), 0)).where(*base_filter)
        )
        total = total_result.scalar_one()

        by_category_result = await self._session.execute(
            select(Expense.category, func.sum(Expense.value).label("total"))
            .where(*base_filter)
            .group_by(Expense.category)
            .order_by(func.sum(Expense.value).desc())
        )
        by_category = [{"category": row.category, "total": row.total} for row in by_category_result]

        by_month_result = await self._session.execute(
            select(Expense.year, Expense.month, func.sum(Expense.value).label("total"))
            .where(*base_filter)
            .group_by(Expense.year, Expense.month)
            .order_by(Expense.year, Expense.month)
        )
        by_month = [
            {"year": row.year, "month": row.month, "total": row.total} for row in by_month_result
        ]

        return {"total": total, "by_category": by_category, "by_month": by_month}

    async def get_global_summary(self, *, year: int | None = None) -> dict:
        """Return expense totals for all politicians grouped by category and month.

        Args:
            year (int | None): Filter by year. Defaults to all years.

        Returns:
            dict: Keys 'total', 'politician_count', 'by_category', 'by_month'.
        """
        filters = []
        if year:
            filters.append(Expense.year == year)

        total_result = await self._session.execute(
            select(func.coalesce(func.sum(Expense.value), 0)).where(*filters)
        )
        total = total_result.scalar_one()

        politician_count_result = await self._session.execute(
            select(func.count(Expense.politician_id.distinct())).where(*filters)
        )
        politician_count = politician_count_result.scalar_one()

        by_category_result = await self._session.execute(
            select(Expense.category, func.sum(Expense.value).label("total"))
            .where(*filters)
            .group_by(Expense.category)
            .order_by(func.sum(Expense.value).desc())
        )
        by_category = [{"category": row.category, "total": row.total} for row in by_category_result]

        by_month_result = await self._session.execute(
            select(Expense.year, Expense.month, func.sum(Expense.value).label("total"))
            .where(*filters)
            .group_by(Expense.year, Expense.month)
            .order_by(Expense.year, Expense.month)
        )
        by_month = [
            {"year": row.year, "month": row.month, "total": row.total} for row in by_month_result
        ]

        return {
            "total": total,
            "politician_count": politician_count,
            "by_category": by_category,
            "by_month": by_month,
        }

    async def upsert_bulk(self, records: list[dict]) -> int:
        """Insert or ignore a batch of expense records.

        Args:
            records (list[dict]): List of expense field dictionaries.

        Returns:
            int: Number of records processed.
        """
        if not records:
            return 0

        stmt = (
            insert(Expense).values(records).on_conflict_do_nothing(index_elements=["external_id"])
        )
        await self._session.execute(stmt)
        await self._session.flush()
        return len(records)
