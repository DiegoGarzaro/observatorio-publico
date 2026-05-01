from __future__ import annotations

from sqlalchemy import case, func, select, update
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

    async def list_with_metrics(
        self,
        *,
        name: str | None = None,
        party: str | None = None,
        uf: str | None = None,
        role: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[dict], int]:
        """Return paginated politicians enriched with aggregate metrics.

        Performs four queries: a paginated select for politicians and three
        scoped aggregates (expenses, propositions, votes) restricted to the
        page's IDs. Avoids the N+1 pattern of running per-politician
        repository calls inside a loop.

        Args:
            name (str | None): Partial name filter (case-insensitive).
            party (str | None): Party abbreviation filter.
            uf (str | None): State abbreviation filter.
            role (str | None): Role filter (e.g. deputado_federal, senador).
            page (int): Page number (1-based).
            page_size (int): Number of results per page.

        Returns:
            tuple[list[dict], int]: List of dicts with politician fields plus
                total_expenses, proposition_count, total_votes and
                presence_rate; followed by the total matching count.
        """
        from app.models.expense import Expense
        from app.models.proposition import Proposition
        from app.models.vote import Vote

        politicians, total = await self.list(
            name=name,
            party=party,
            uf=uf,
            role=role,
            page=page,
            page_size=page_size,
        )

        if not politicians:
            return [], total

        ids = [p.id for p in politicians]

        expense_result = await self._session.execute(
            select(
                Expense.politician_id,
                func.coalesce(func.sum(Expense.value), 0).label("total"),
            )
            .where(Expense.politician_id.in_(ids))
            .group_by(Expense.politician_id)
        )
        expenses_by_id = {row.politician_id: row.total for row in expense_result}

        proposition_result = await self._session.execute(
            select(Proposition.author_id, func.count().label("count"))
            .where(Proposition.author_id.in_(ids))
            .group_by(Proposition.author_id)
        )
        propositions_by_id = {row.author_id: row.count for row in proposition_result}

        vote_result = await self._session.execute(
            select(
                Vote.politician_id,
                func.count().label("total"),
                func.coalesce(
                    func.sum(
                        case(
                            (Vote.direction.in_(("Ausente", "Artigo 17")), 1),
                            else_=0,
                        )
                    ),
                    0,
                ).label("absent"),
            )
            .where(Vote.politician_id.in_(ids))
            .group_by(Vote.politician_id)
        )
        votes_by_id = {
            row.politician_id: (row.total, row.absent) for row in vote_result
        }

        rows: list[dict] = []
        for p in politicians:
            total_v, absent_v = votes_by_id.get(p.id, (0, 0))
            presence_rate = (
                round((total_v - absent_v) / total_v * 100, 1) if total_v > 0 else 0.0
            )
            rows.append(
                {
                    "id": p.id,
                    "name": p.name,
                    "role": p.role,
                    "source": p.source,
                    "party": p.party.abbreviation if p.party else None,
                    "uf": p.uf,
                    "municipality": p.municipality,
                    "photo_url": p.photo_url,
                    "legislature": p.legislature,
                    "total_expenses": expenses_by_id.get(p.id, 0),
                    "proposition_count": propositions_by_id.get(p.id, 0),
                    "total_votes": total_v,
                    "presence_rate": presence_rate,
                }
            )

        return rows, total

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
