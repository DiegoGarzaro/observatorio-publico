from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.repositories.politician_repository import PoliticianRepository
from app.repositories.vote_repository import VoteRepository
from app.schemas.vote import PaginatedVotes, PresenceStats
from app.services.vote_service import VoteService

router = APIRouter(prefix="/politicians", tags=["votes"])


def _service(session: AsyncSession = Depends(get_session)) -> VoteService:
    return VoteService(VoteRepository(session), PoliticianRepository(session))


@router.get(
    "/{politician_id}/votes",
    response_model=PaginatedVotes,
    summary="List votes cast by a politician",
)
async def list_votes(
    politician_id: int,
    year: int | None = Query(None),
    direction: str | None = Query(None, description="Vote direction (Sim, Não, Abstenção…)"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    service: VoteService = Depends(_service),
) -> PaginatedVotes:
    return await service.list_by_politician(
        politician_id,
        year=year,
        direction=direction,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/{politician_id}/votes/presence",
    response_model=PresenceStats,
    summary="Get presence rate and vote breakdown",
)
async def get_presence_stats(
    politician_id: int,
    year: int | None = Query(None),
    service: VoteService = Depends(_service),
) -> PresenceStats:
    return await service.get_presence_stats(politician_id, year=year)
