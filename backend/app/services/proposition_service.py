from app.exceptions import PoliticianNotFoundError
from app.repositories.politician_repository import PoliticianRepository
from app.repositories.proposition_repository import PropositionRepository
from app.schemas.proposition import PaginatedPropositions, PropositionResponse


class PropositionService:
    """Business logic for proposition queries."""

    def __init__(
        self,
        proposition_repository: PropositionRepository,
        politician_repository: PoliticianRepository,
    ) -> None:
        self._propositions = proposition_repository
        self._politicians = politician_repository

    async def list_by_politician(
        self,
        politician_id: int,
        *,
        prop_type: str | None = None,
        year: int | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> PaginatedPropositions:
        """Return paginated propositions authored by a politician.

        Args:
            politician_id (int): Internal politician ID.
            prop_type (str | None): Filter by proposition type.
            year (int | None): Filter by year.
            page (int): Page number.
            page_size (int): Items per page.

        Returns:
            PaginatedPropositions: Paginated result.

        Raises:
            PoliticianNotFoundError: If the politician does not exist.
        """
        if not await self._politicians.get_by_id(politician_id):
            raise PoliticianNotFoundError(politician_id)

        propositions, total = await self._propositions.list_by_author(
            politician_id,
            prop_type=prop_type,
            year=year,
            page=page,
            page_size=page_size,
        )
        return PaginatedPropositions(
            items=[PropositionResponse.model_validate(p) for p in propositions],
            total=total,
            page=page,
            page_size=page_size,
        )
