from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.party import Party


class PartyRepository:
    """Data access layer for Party records."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_all(self) -> list[Party]:
        """Return all parties ordered by abbreviation.

        Returns:
            list[Party]: All party records.
        """
        result = await self._session.execute(select(Party).order_by(Party.abbreviation))
        return list(result.scalars())

    async def get_by_abbreviation(self, abbreviation: str) -> Party | None:
        """Return a party by its abbreviation.

        Args:
            abbreviation (str): Party acronym (e.g. PT).

        Returns:
            Party | None: Matching party or None.
        """
        result = await self._session.execute(
            select(Party).where(Party.abbreviation == abbreviation)
        )
        return result.scalar_one_or_none()

    async def upsert(self, abbreviation: str, name: str) -> Party:
        """Insert or update a party by abbreviation.

        Args:
            abbreviation (str): Party acronym.
            name (str): Full party name.

        Returns:
            Party: The upserted party record.
        """
        stmt = (
            insert(Party)
            .values(abbreviation=abbreviation, name=name)
            .on_conflict_do_update(
                index_elements=["abbreviation"],
                set_={"name": name},
            )
            .returning(Party)
        )
        result = await self._session.execute(stmt)
        await self._session.flush()
        return result.scalar_one()
