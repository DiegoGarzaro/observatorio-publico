from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.repositories.party_repository import PartyRepository
from app.schemas.party import PartyResponse

router = APIRouter(prefix="/parties", tags=["parties"])


@router.get("", response_model=list[PartyResponse], summary="List all parties")
async def list_parties(
    session: AsyncSession = Depends(get_session),
) -> list[PartyResponse]:
    repository = PartyRepository(session)
    parties = await repository.list_all()
    return [PartyResponse.model_validate(p) for p in parties]
