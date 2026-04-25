from app.exceptions import PoliticianNotFoundError
from app.repositories.expense_repository import ExpenseRepository
from app.repositories.politician_repository import PoliticianRepository
from app.repositories.proposition_repository import PropositionRepository
from app.repositories.vote_repository import VoteRepository
from app.schemas.compare import CompareResponse, PoliticianCompareItem


class CompareService:
    """Aggregates comparative statistics across multiple politicians."""

    def __init__(
        self,
        politician_repo: PoliticianRepository,
        expense_repo: ExpenseRepository,
        proposition_repo: PropositionRepository,
        vote_repo: VoteRepository,
    ) -> None:
        self._politicians = politician_repo
        self._expenses = expense_repo
        self._propositions = proposition_repo
        self._votes = vote_repo

    async def compare(self, politician_ids: list[int]) -> CompareResponse:
        """Return comparative statistics for a list of politicians.

        Args:
            politician_ids (list[int]): Up to 4 internal politician IDs.

        Returns:
            CompareResponse: One entry per politician with aggregated stats.

        Raises:
            PoliticianNotFoundError: If any requested ID does not exist.
        """
        items: list[PoliticianCompareItem] = []

        for pid in politician_ids:
            politician = await self._politicians.get_by_id(pid)
            if politician is None:
                raise PoliticianNotFoundError(pid)

            expense_summary = await self._expenses.get_summary(pid)
            proposition_count = await self._propositions.count_by_author(pid)
            presence_stats = await self._votes.get_presence_rate(pid)

            items.append(
                PoliticianCompareItem(
                    id=politician.id,
                    name=politician.name,
                    party=politician.party.abbreviation if politician.party else None,
                    uf=politician.uf,
                    photo_url=politician.photo_url,
                    total_expenses=expense_summary["total"],
                    proposition_count=proposition_count,
                    presence_rate=presence_stats["presence_rate"],
                    total_votes=presence_stats["total"],
                )
            )

        return CompareResponse(items=items)
