from sqlalchemy import func, select, update
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.proposition import Proposition

# asyncpg supports at most 32 767 parameters per query.
# Proposition has 7 bound columns, so safe chunk = floor(32_767 / 7) = 4_681.
# Use 4_000 for a round margin.
_UPSERT_CHUNK = 4_000


class PropositionRepository:
    """Data access layer for Proposition records."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_by_author(
        self,
        author_id: int,
        *,
        prop_type: str | None = None,
        year: int | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[Proposition], int]:
        """Return paginated propositions authored by a politician.

        Args:
            author_id (int): Internal politician ID.
            prop_type (str | None): Filter by proposition type (e.g. PL).
            year (int | None): Filter by year.
            page (int): Page number (1-based).
            page_size (int): Results per page.

        Returns:
            tuple[list[Proposition], int]: Page of propositions and total count.
        """
        base_query = select(Proposition).where(Proposition.author_id == author_id)

        if prop_type:
            base_query = base_query.where(Proposition.prop_type == prop_type)
        if year:
            base_query = base_query.where(Proposition.year == year)

        count_result = await self._session.execute(
            select(func.count()).select_from(base_query.subquery())
        )
        total = count_result.scalar_one()

        result = await self._session.execute(
            base_query.order_by(Proposition.year.desc(), Proposition.number.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        return list(result.scalars()), total

    async def count_by_author(self, author_id: int) -> int:
        """Return total propositions count for a politician.

        Args:
            author_id (int): Internal politician ID.

        Returns:
            int: Total proposition count.
        """
        result = await self._session.execute(
            select(func.count()).where(Proposition.author_id == author_id)
        )
        return result.scalar_one()

    async def get_ids_by_refs(
        self, refs: list[tuple[str, int, int]]
    ) -> dict[tuple[str, int, int], int]:
        """Return internal IDs for propositions matching (prop_type, number, year) tuples.

        Args:
            refs (list[tuple[str, int, int]]): List of (prop_type, number, year) tuples.

        Returns:
            dict[tuple[str, int, int], int]: Mapping from (prop_type, number, year) to internal ID.
        """
        if not refs:
            return {}

        from sqlalchemy import tuple_ as sa_tuple

        result = await self._session.execute(
            select(Proposition.prop_type, Proposition.number, Proposition.year, Proposition.id).where(
                sa_tuple(Proposition.prop_type, Proposition.number, Proposition.year).in_(refs)
            )
        )
        return {(row.prop_type, row.number, row.year): row.id for row in result}

    async def list_without_status(self, *, limit: int = 1000) -> list[Proposition]:
        """Return propositions that have no status yet.

        Args:
            limit (int): Max records to return per call.

        Returns:
            list[Proposition]: Propositions with null status.
        """
        result = await self._session.execute(
            select(Proposition)
            .where(Proposition.status.is_(None))
            .order_by(Proposition.year.desc())
            .limit(limit)
        )
        return list(result.scalars())

    async def update_status_bulk(self, updates: list[dict]) -> int:
        """Update status for a batch of propositions identified by external_id.

        Args:
            updates (list[dict]): Each dict must have 'external_id' and 'status'.

        Returns:
            int: Number of records updated.
        """
        if not updates:
            return 0

        for item in updates:
            await self._session.execute(
                update(Proposition)
                .where(Proposition.external_id == item["external_id"])
                .values(status=item["status"])
            )
        return len(updates)

    async def upsert_bulk(self, records: list[dict]) -> int:
        """Insert or update a batch of proposition records.

        Updates title and status on conflict so re-runs refresh
        mutable fields as propositions move through the legislative process.

        Deduplicates by external_id before executing — ON CONFLICT DO UPDATE
        rejects a batch that tries to update the same row twice in one statement.
        Splits into chunks of _UPSERT_CHUNK to stay within asyncpg's parameter limit.

        Args:
            records (list[dict]): List of proposition field dictionaries.

        Returns:
            int: Number of records processed.
        """
        if not records:
            return 0

        # Normalise external_id to str for dedup to avoid int/float type divergence.
        # The Câmara API occasionally returns the same proposition multiple
        # times in a single author's paginated response.
        deduped: dict[str, dict] = {}
        for r in records:
            deduped[str(r["external_id"])] = r
        unique = list(deduped.values())

        for i in range(0, len(unique), _UPSERT_CHUNK):
            chunk = unique[i : i + _UPSERT_CHUNK]
            stmt = insert(Proposition).values(chunk)
            stmt = stmt.on_conflict_do_update(
                index_elements=["external_id"],
                set_={
                    "title": stmt.excluded.title,
                    "status": stmt.excluded.status,
                },
            )
            await self._session.execute(stmt)

        await self._session.flush()
        return len(unique)
