from sqlalchemy import func, select, update
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.politician import Politician


class PoliticianRepository:
    """Data access layer for Politician records."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, politician_id: int) -> Politician | None:
        """Return a politician by internal ID, with party eager-loaded.

        Args:
            politician_id (int): Internal primary key.

        Returns:
            Politician | None: Matching politician or None.
        """
        result = await self._session.execute(
            select(Politician)
            .options(selectinload(Politician.party))
            .where(Politician.id == politician_id)
        )
        return result.scalar_one_or_none()

    async def list(
        self,
        *,
        name: str | None = None,
        party: str | None = None,
        uf: str | None = None,
        municipality: str | None = None,
        legislature: int | None = None,
        role: str | None = None,
        source: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[Politician], int]:
        """Return a paginated list of politicians with optional filters.

        Args:
            name (str | None): Partial name filter (case-insensitive).
            party (str | None): Party abbreviation filter.
            uf (str | None): State abbreviation filter.
            municipality (str | None): Partial municipality name filter (case-insensitive).
            legislature (int | None): Legislature number filter.
            role (str | None): Role filter (e.g. deputado_federal, senador).
            source (str | None): Source API filter (e.g. camara, senado).
            page (int): Page number (1-based).
            page_size (int): Number of results per page.

        Returns:
            tuple[list[Politician], int]: Page of politicians and total count.
        """
        from app.models.party import Party

        base_query = (
            select(Politician)
            .options(selectinload(Politician.party))
            .join(Politician.party, isouter=True)
        )

        if name:
            base_query = base_query.where(Politician.name.ilike(f"%{name}%"))
        if party:
            base_query = base_query.where(Party.abbreviation == party)
        if uf:
            base_query = base_query.where(Politician.uf == uf)
        if municipality:
            base_query = base_query.where(Politician.municipality.ilike(f"%{municipality}%"))
        if legislature:
            base_query = base_query.where(Politician.legislature == legislature)
        if role:
            base_query = base_query.where(Politician.role == role)
        if source:
            base_query = base_query.where(Politician.source == source)

        count_result = await self._session.execute(
            select(func.count()).select_from(base_query.subquery())
        )
        total = count_result.scalar_one()

        result = await self._session.execute(
            base_query.order_by(Politician.name).offset((page - 1) * page_size).limit(page_size)
        )
        return list(result.scalars()), total

    async def update_by_external_id(
        self, external_id: int, data: dict, *, source: str = "camara"
    ) -> None:
        """Update fields of an existing politician by external_id and source.

        No-op if no politician with the given external_id + source exists.
        Use this for enrichment jobs that should never create new records.

        Args:
            external_id (int): Source API ID.
            data (dict): Fields to update (only non-None values are applied).
            source (str): Source identifier to scope the update. Defaults to 'camara'.
        """
        filtered = {k: v for k, v in data.items() if v is not None}
        if not filtered:
            return

        stmt = (
            update(Politician)
            .where(Politician.external_id == external_id, Politician.source == source)
            .values(**filtered)
        )
        await self._session.execute(stmt)
        await self._session.flush()

    async def upsert(self, external_id: int, data: dict) -> Politician:
        """Insert or update a politician by (external_id, source).

        The source must be included in `data`; defaults to 'camara' if absent.

        Args:
            external_id (int): Source API ID.
            data (dict): Fields to insert/update (should include 'source').

        Returns:
            Politician: The upserted politician record.
        """
        stmt = (
            insert(Politician)
            .values(external_id=external_id, **data)
            .on_conflict_do_update(
                constraint="uq_politicians_external_id_source",
                set_={k: v for k, v in data.items() if k != "source"},
            )
            .returning(Politician)
        )
        result = await self._session.execute(stmt)
        await self._session.flush()
        return result.scalar_one()
