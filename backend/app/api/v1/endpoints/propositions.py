from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.repositories.politician_repository import PoliticianRepository
from app.repositories.proposition_repository import PropositionRepository
from app.schemas.proposition import PaginatedPropositions
from app.services.proposition_service import PropositionService

router = APIRouter(prefix="/politicians", tags=["propositions"])


def _service(session: AsyncSession = Depends(get_session)) -> PropositionService:
    return PropositionService(PropositionRepository(session), PoliticianRepository(session))


@router.get(
    "/{politician_id}/propositions",
    response_model=PaginatedPropositions,
    summary="List propositions authored by a politician",
)
async def list_propositions(
    politician_id: int,
    prop_type: str | None = Query(None, description="Proposition type (PL, PEC, MPV…)"),
    year: int | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    service: PropositionService = Depends(_service),
) -> PaginatedPropositions:
    return await service.list_by_politician(
        politician_id,
        prop_type=prop_type,
        year=year,
        page=page,
        page_size=page_size,
    )
