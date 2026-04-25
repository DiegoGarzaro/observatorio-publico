from __future__ import annotations

from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.amendment import Amendment
from app.schemas.amendment import AmendmentAuthorTotal, AmendmentFunctionTotal, AmendmentTypeTotal


class AmendmentRepository:
    """Data access layer for Amendment records.

    Attributes:
        _session (AsyncSession): Active SQLAlchemy async session.
    """

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list(
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
    ) -> tuple[list[Amendment], int]:
        """Return a paginated list of amendments with optional filters.

        Args:
            year (int | None): Filter by exact reference year.
            year_from (int | None): Filter by year >= value (inclusive).
            year_to (int | None): Filter by year <= value (inclusive).
            amendment_type (str | None): Filter by type.
            politician_id (int | None): Filter by linked politician.
            author_name (str | None): Filter by author name (partial, case-insensitive).
            function_name (str | None): Filter by budget function.
            is_pix (bool | None): Filter Emenda Pix.
            page (int): 1-based page number.
            page_size (int): Records per page.

        Returns:
            tuple[list[Amendment], int]: Records and total count.
        """
        base = select(Amendment)
        if year:
            base = base.where(Amendment.year == year)
        if year_from:
            base = base.where(Amendment.year >= year_from)
        if year_to:
            base = base.where(Amendment.year <= year_to)
        if amendment_type:
            base = base.where(Amendment.amendment_type == amendment_type)
        if politician_id is not None:
            base = base.where(Amendment.politician_id == politician_id)
        if author_name:
            base = base.where(Amendment.author_name.ilike(f"%{author_name}%"))
        if function_name:
            base = base.where(Amendment.function_name == function_name)
        if is_pix is not None:
            base = base.where(Amendment.is_pix == is_pix)

        count_stmt = select(func.count()).select_from(base.subquery())
        total: int = (await self._session.execute(count_stmt)).scalar_one()

        stmt = (
            base.order_by(Amendment.committed_value.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        rows = (await self._session.execute(stmt)).scalars().all()
        return list(rows), total

    async def totals(
        self,
        *,
        year: int | None = None,
        year_from: int | None = None,
        year_to: int | None = None,
        politician_id: int | None = None,
    ) -> tuple[Decimal, Decimal, int]:
        """Return grand total committed, paid and count.

        Args:
            year (int | None): Filter by exact year.
            year_from (int | None): Filter by year >= value (inclusive).
            year_to (int | None): Filter by year <= value (inclusive).
            politician_id (int | None): Filter by linked politician.

        Returns:
            tuple[Decimal, Decimal, int]: (committed, paid, count).
        """
        stmt = select(
            func.sum(Amendment.committed_value),
            func.sum(Amendment.paid_value),
            func.count(),
        )
        if year:
            stmt = stmt.where(Amendment.year == year)
        if year_from:
            stmt = stmt.where(Amendment.year >= year_from)
        if year_to:
            stmt = stmt.where(Amendment.year <= year_to)
        if politician_id is not None:
            stmt = stmt.where(Amendment.politician_id == politician_id)
        row = (await self._session.execute(stmt)).one()
        return (
            row[0] or Decimal("0"),
            row[1] or Decimal("0"),
            row[2] or 0,
        )

    async def pix_totals(
        self,
        *,
        year: int | None = None,
        year_from: int | None = None,
        year_to: int | None = None,
        politician_id: int | None = None,
    ) -> tuple[Decimal, int]:
        """Return total committed and count for Emenda Pix amendments.

        Args:
            year (int | None): Filter by exact year.
            year_from (int | None): Filter by year >= value (inclusive).
            year_to (int | None): Filter by year <= value (inclusive).
            politician_id (int | None): Filter by linked politician.

        Returns:
            tuple[Decimal, int]: (committed, count).
        """
        stmt = select(
            func.sum(Amendment.committed_value),
            func.count(),
        ).where(Amendment.is_pix.is_(True))
        if year:
            stmt = stmt.where(Amendment.year == year)
        if year_from:
            stmt = stmt.where(Amendment.year >= year_from)
        if year_to:
            stmt = stmt.where(Amendment.year <= year_to)
        if politician_id is not None:
            stmt = stmt.where(Amendment.politician_id == politician_id)
        row = (await self._session.execute(stmt)).one()
        return row[0] or Decimal("0"), row[1] or 0

    async def by_type(
        self,
        *,
        year: int | None = None,
        year_from: int | None = None,
        year_to: int | None = None,
        politician_id: int | None = None,
    ) -> list[AmendmentTypeTotal]:
        """Return totals grouped by amendment type.

        Args:
            year (int | None): Filter by exact year.
            year_from (int | None): Filter by year >= value (inclusive).
            year_to (int | None): Filter by year <= value (inclusive).
            politician_id (int | None): Filter by linked politician.

        Returns:
            list[AmendmentTypeTotal]: Breakdown by type, ordered by committed desc.
        """
        stmt = select(
            Amendment.amendment_type,
            Amendment.is_pix,
            func.sum(Amendment.committed_value).label("committed"),
            func.sum(Amendment.paid_value).label("paid"),
            func.count().label("cnt"),
        ).group_by(Amendment.amendment_type, Amendment.is_pix).order_by(
            func.sum(Amendment.committed_value).desc()
        )
        if year:
            stmt = stmt.where(Amendment.year == year)
        if year_from:
            stmt = stmt.where(Amendment.year >= year_from)
        if year_to:
            stmt = stmt.where(Amendment.year <= year_to)
        if politician_id is not None:
            stmt = stmt.where(Amendment.politician_id == politician_id)
        rows = (await self._session.execute(stmt)).all()
        return [
            AmendmentTypeTotal(
                amendment_type=r[0],
                is_pix=r[1],
                committed_value=r[2] or Decimal("0"),
                paid_value=r[3] or Decimal("0"),
                count=r[4],
            )
            for r in rows
        ]

    async def by_function(
        self,
        *,
        year: int | None = None,
        year_from: int | None = None,
        year_to: int | None = None,
        politician_id: int | None = None,
    ) -> list[AmendmentFunctionTotal]:
        """Return totals grouped by budget function.

        Args:
            year (int | None): Filter by exact year.
            year_from (int | None): Filter by year >= value (inclusive).
            year_to (int | None): Filter by year <= value (inclusive).
            politician_id (int | None): Filter by linked politician.

        Returns:
            list[AmendmentFunctionTotal]: Breakdown by function, ordered by committed desc.
        """
        stmt = select(
            Amendment.function_name,
            func.sum(Amendment.committed_value).label("committed"),
            func.sum(Amendment.paid_value).label("paid"),
            func.count().label("cnt"),
        ).group_by(Amendment.function_name).order_by(
            func.sum(Amendment.committed_value).desc()
        )
        if year:
            stmt = stmt.where(Amendment.year == year)
        if year_from:
            stmt = stmt.where(Amendment.year >= year_from)
        if year_to:
            stmt = stmt.where(Amendment.year <= year_to)
        if politician_id is not None:
            stmt = stmt.where(Amendment.politician_id == politician_id)
        rows = (await self._session.execute(stmt)).all()
        return [
            AmendmentFunctionTotal(
                function_name=r[0],
                committed_value=r[1] or Decimal("0"),
                paid_value=r[2] or Decimal("0"),
                count=r[3],
            )
            for r in rows
        ]

    async def top_authors(
        self, *, year: int | None = None, limit: int = 20
    ) -> list[AmendmentAuthorTotal]:
        """Return top authors by total committed value.

        Args:
            year (int | None): Filter by year.
            limit (int): Maximum number of authors to return. Defaults to 20.

        Returns:
            list[AmendmentAuthorTotal]: Authors sorted by committed desc.
        """
        stmt = select(
            Amendment.author_name,
            Amendment.politician_id,
            func.sum(Amendment.committed_value).label("committed"),
            func.sum(Amendment.paid_value).label("paid"),
            func.count().label("cnt"),
        ).group_by(Amendment.author_name, Amendment.politician_id).order_by(
            func.sum(Amendment.committed_value).desc()
        ).limit(limit)
        if year:
            stmt = stmt.where(Amendment.year == year)
        rows = (await self._session.execute(stmt)).all()
        return [
            AmendmentAuthorTotal(
                author_name=r[0],
                politician_id=r[1],
                committed_value=r[2] or Decimal("0"),
                paid_value=r[3] or Decimal("0"),
                count=r[4],
            )
            for r in rows
        ]
