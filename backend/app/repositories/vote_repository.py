from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.vote import Vote

# asyncpg supports at most 32 767 parameters per query.
# Vote now has 8 bound columns, so safe chunk = floor(32_767 / 8) = 4_095.
# Use 4_000 for a round margin.
_UPSERT_CHUNK = 4_000


class VoteRepository:
    """Data access layer for Vote records."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_by_politician(
        self,
        politician_id: int,
        *,
        year: int | None = None,
        direction: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[Vote], int]:
        """Return paginated votes cast by a politician.

        Args:
            politician_id (int): Internal politician ID.
            year (int | None): Filter by session year.
            direction (str | None): Filter by vote direction (Sim, Não, etc.).
            page (int): Page number (1-based).
            page_size (int): Results per page.

        Returns:
            tuple[list[Vote], int]: Page of votes and total count.
        """
        from sqlalchemy import extract

        base_query = select(Vote).where(Vote.politician_id == politician_id)

        if year:
            base_query = base_query.where(extract("year", Vote.session_date) == year)
        if direction:
            base_query = base_query.where(Vote.direction == direction)

        count_result = await self._session.execute(
            select(func.count()).select_from(base_query.subquery())
        )
        total = count_result.scalar_one()

        result = await self._session.execute(
            base_query
            .options(selectinload(Vote.proposition))
            .order_by(Vote.session_date.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        return list(result.scalars()), total

    async def get_presence_rate(self, politician_id: int, *, year: int | None = None) -> dict:
        """Calculate presence and vote direction breakdown for a politician.

        Args:
            politician_id (int): Internal politician ID.
            year (int | None): Filter by year.

        Returns:
            dict: Keys 'total', 'present', 'absence_rate', 'by_direction'.
        """
        from sqlalchemy import extract

        base_filter = [Vote.politician_id == politician_id]
        if year:
            base_filter.append(extract("year", Vote.session_date) == year)

        total_result = await self._session.execute(
            select(func.count()).where(*base_filter)
        )
        total = total_result.scalar_one()

        by_direction_result = await self._session.execute(
            select(Vote.direction, func.count().label("count"))
            .where(*base_filter)
            .group_by(Vote.direction)
            .order_by(func.count().desc())
        )
        by_direction = [
            {"direction": row.direction, "count": row.count}
            for row in by_direction_result
        ]

        absent = sum(r["count"] for r in by_direction if r["direction"] in ("Ausente", "Artigo 17"))
        presence_rate = round((1 - absent / total) * 100, 1) if total > 0 else 0.0

        return {
            "total": total,
            "presence_rate": presence_rate,
            "by_direction": by_direction,
        }

    async def upsert_bulk(self, records: list[dict]) -> int:
        """Insert or ignore a batch of vote records.

        Splits the input into chunks of at most _UPSERT_CHUNK rows to stay
        within asyncpg's 32 767-parameter limit.

        Uses (external_votacao_id, politician_id) as deduplication key.

        Args:
            records (list[dict]): List of vote field dictionaries.

        Returns:
            int: Number of records processed.
        """
        if not records:
            return 0

        for i in range(0, len(records), _UPSERT_CHUNK):
            chunk = records[i : i + _UPSERT_CHUNK]
            stmt = insert(Vote).values(chunk)
            stmt = stmt.on_conflict_do_update(
                index_elements=["external_votacao_id", "politician_id"],
                set_={
                    "direction": stmt.excluded.direction,
                    "description": stmt.excluded.description,
                    "proposition_ref": stmt.excluded.proposition_ref,
                    "proposition_id": stmt.excluded.proposition_id,
                },
            )
            await self._session.execute(stmt)

        await self._session.flush()
        return len(records)
