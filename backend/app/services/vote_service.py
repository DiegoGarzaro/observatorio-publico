from app.exceptions import PoliticianNotFoundError
from app.repositories.politician_repository import PoliticianRepository
from app.repositories.vote_repository import VoteRepository
from app.schemas.vote import PaginatedVotes, PresenceStats, VoteResponse


class VoteService:
    """Business logic for vote queries."""

    def __init__(
        self,
        vote_repository: VoteRepository,
        politician_repository: PoliticianRepository,
    ) -> None:
        self._votes = vote_repository
        self._politicians = politician_repository

    async def list_by_politician(
        self,
        politician_id: int,
        *,
        year: int | None = None,
        direction: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> PaginatedVotes:
        """Return paginated votes cast by a politician.

        Args:
            politician_id (int): Internal politician ID.
            year (int | None): Filter by session year.
            direction (str | None): Filter by vote direction.
            page (int): Page number.
            page_size (int): Items per page.

        Returns:
            PaginatedVotes: Paginated result.

        Raises:
            PoliticianNotFoundError: If the politician does not exist.
        """
        if not await self._politicians.get_by_id(politician_id):
            raise PoliticianNotFoundError(politician_id)

        votes, total = await self._votes.list_by_politician(
            politician_id,
            year=year,
            direction=direction,
            page=page,
            page_size=page_size,
        )
        return PaginatedVotes(
            items=[VoteResponse.model_validate(v) for v in votes],
            total=total,
            page=page,
            page_size=page_size,
        )

    async def get_presence_stats(
        self, politician_id: int, *, year: int | None = None
    ) -> PresenceStats:
        """Return presence rate and vote breakdown for a politician.

        Args:
            politician_id (int): Internal politician ID.
            year (int | None): Filter by year.

        Returns:
            PresenceStats: Aggregated presence data.

        Raises:
            PoliticianNotFoundError: If the politician does not exist.
        """
        if not await self._politicians.get_by_id(politician_id):
            raise PoliticianNotFoundError(politician_id)

        data = await self._votes.get_presence_rate(politician_id, year=year)
        return PresenceStats(**data)
