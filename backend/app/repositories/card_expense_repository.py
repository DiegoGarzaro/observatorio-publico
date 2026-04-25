from __future__ import annotations

from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.card_expense import CardExpense
from app.schemas.card_expense import CardExpenseMonthTotal, CardExpenseSupplierTotal


class CardExpenseRepository:
    """Data access layer for CardExpense records.

    Attributes:
        _session (AsyncSession): Active SQLAlchemy async session.
    """

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list(
        self,
        *,
        organ_code: str,
        year: int | None = None,
        month: int | None = None,
        page: int = 1,
        page_size: int = 50,
    ) -> tuple[list[CardExpense], int]:
        """Return a paginated list of transactions filtered by organ and period.

        Args:
            organ_code (str): Government organ code to filter by.
            year (int | None): Filter by transaction year.
            month (int | None): Filter by transaction month (1–12).
            page (int): 1-based page number.
            page_size (int): Number of records per page.

        Returns:
            tuple[list[CardExpense], int]: Records and total count.
        """
        base = select(CardExpense).where(CardExpense.organ_code == organ_code)
        if year:
            base = base.where(CardExpense.transaction_year == year)
        if month:
            base = base.where(CardExpense.transaction_month == month)

        count_stmt = select(func.count()).select_from(base.subquery())
        total: int = (await self._session.execute(count_stmt)).scalar_one()

        stmt = (
            base.order_by(CardExpense.transaction_date.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        rows = (await self._session.execute(stmt)).scalars().all()
        return list(rows), total

    async def total(self, *, organ_code: str, year: int | None = None) -> Decimal:
        """Return the grand total of transactions for an organ and optional year.

        Args:
            organ_code (str): Government organ code.
            year (int | None): Filter by year.

        Returns:
            Decimal: Sum of all transaction values.
        """
        stmt = select(func.sum(CardExpense.value)).where(CardExpense.organ_code == organ_code)
        if year:
            stmt = stmt.where(CardExpense.transaction_year == year)
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none() or Decimal("0")

    async def count(self, *, organ_code: str, year: int | None = None) -> int:
        """Return the number of transactions for an organ and optional year.

        Args:
            organ_code (str): Government organ code.
            year (int | None): Filter by year.

        Returns:
            int: Transaction count.
        """
        stmt = select(func.count()).where(CardExpense.organ_code == organ_code)
        if year:
            stmt = stmt.where(CardExpense.transaction_year == year)
        return (await self._session.execute(stmt)).scalar_one()

    async def by_month(
        self, *, organ_code: str, year: int | None = None
    ) -> list[CardExpenseMonthTotal]:
        """Return transaction totals grouped by month.

        Args:
            organ_code (str): Government organ code.
            year (int | None): Filter by year.

        Returns:
            list[CardExpenseMonthTotal]: Monthly totals ordered chronologically.
        """
        stmt = (
            select(
                CardExpense.transaction_year,
                CardExpense.transaction_month,
                func.sum(CardExpense.value).label("total"),
                func.count().label("count"),
            )
            .where(CardExpense.organ_code == organ_code)
            .group_by(CardExpense.transaction_year, CardExpense.transaction_month)
            .order_by(CardExpense.transaction_year, CardExpense.transaction_month)
        )
        if year:
            stmt = stmt.where(CardExpense.transaction_year == year)

        rows = (await self._session.execute(stmt)).all()
        return [
            CardExpenseMonthTotal(year=r[0], month=r[1], total=r[2], count=r[3])
            for r in rows
            if r[0] and r[1]
        ]

    async def top_suppliers(
        self, *, organ_code: str, year: int | None = None, limit: int = 10
    ) -> list[CardExpenseSupplierTotal]:
        """Return the top vendors by total received.

        Args:
            organ_code (str): Government organ code.
            year (int | None): Filter by year.
            limit (int): Maximum number of suppliers to return. Defaults to 10.

        Returns:
            list[CardExpenseSupplierTotal]: Suppliers sorted by total descending.
        """
        stmt = (
            select(
                CardExpense.supplier_name,
                CardExpense.supplier_cnpj,
                func.sum(CardExpense.value).label("total"),
                func.count().label("count"),
            )
            .where(CardExpense.organ_code == organ_code)
            .group_by(CardExpense.supplier_name, CardExpense.supplier_cnpj)
            .order_by(func.sum(CardExpense.value).desc())
            .limit(limit)
        )
        if year:
            stmt = stmt.where(CardExpense.transaction_year == year)

        rows = (await self._session.execute(stmt)).all()
        return [
            CardExpenseSupplierTotal(
                supplier_name=r[0],
                supplier_cnpj=r[1],
                total=r[2],
                count=r[3],
            )
            for r in rows
        ]
