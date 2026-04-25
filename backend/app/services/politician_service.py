from app.exceptions import PoliticianNotFoundError
from app.repositories.politician_repository import PoliticianRepository
from app.schemas.politician import PaginatedPoliticians, PoliticianListItem, PoliticianResponse


class PoliticianService:
    """Business logic for politician queries."""

    def __init__(self, repository: PoliticianRepository) -> None:
        self._repository = repository

    async def list(
        self,
        *,
        name: str | None = None,
        party: str | None = None,
        uf: str | None = None,
        municipality: str | None = None,
        legislature: int | None = None,
        role: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> PaginatedPoliticians:
        """Return a paginated list of politicians with optional filters.

        Args:
            name (str | None): Partial name search.
            party (str | None): Party abbreviation.
            uf (str | None): State abbreviation.
            municipality (str | None): Partial municipality name search.
            legislature (int | None): Legislature number.
            role (str | None): Role type (e.g. deputado_federal, senador).
            page (int): Page number.
            page_size (int): Items per page.

        Returns:
            PaginatedPoliticians: Paginated result.
        """
        politicians, total = await self._repository.list(
            name=name,
            party=party,
            uf=uf,
            municipality=municipality,
            legislature=legislature,
            role=role,
            page=page,
            page_size=page_size,
        )
        return PaginatedPoliticians(
            items=[PoliticianListItem.from_orm_with_party(p) for p in politicians],
            total=total,
            page=page,
            page_size=page_size,
        )

    async def get_profile(self, politician_id: int) -> PoliticianResponse:
        """Return the full profile of a politician.

        Args:
            politician_id (int): Internal politician ID.

        Returns:
            PoliticianResponse: Full profile schema.

        Raises:
            PoliticianNotFoundError: If no politician matches the given ID.
        """
        politician = await self._repository.get_by_id(politician_id)
        if politician is None:
            raise PoliticianNotFoundError(politician_id)

        return PoliticianResponse(
            id=politician.id,
            name=politician.name,
            role=politician.role,
            source=politician.source,
            party=politician.party.abbreviation if politician.party else None,
            uf=politician.uf,
            municipality=politician.municipality,
            photo_url=politician.photo_url,
            legislature=politician.legislature,
            mandate_end=politician.mandate_end,
            email=politician.email,
            phone=politician.phone,
        )
