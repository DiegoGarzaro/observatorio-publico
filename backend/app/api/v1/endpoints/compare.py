from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.exceptions import PoliticianNotFoundError
from app.repositories.expense_repository import ExpenseRepository
from app.repositories.politician_repository import PoliticianRepository
from app.repositories.proposition_repository import PropositionRepository
from app.repositories.vote_repository import VoteRepository
from app.schemas.compare import CompareResponse
from app.services.compare_service import CompareService

router = APIRouter(prefix="/compare", tags=["compare"])


def _compare_service(session: AsyncSession = Depends(get_session)) -> CompareService:
    return CompareService(
        politician_repo=PoliticianRepository(session),
        expense_repo=ExpenseRepository(session),
        proposition_repo=PropositionRepository(session),
        vote_repo=VoteRepository(session),
    )


@router.get("", response_model=CompareResponse, summary="Compare politicians side by side")
async def compare_politicians(
    ids: str = Query(..., description="Comma-separated list of up to 4 politician IDs"),
    service: CompareService = Depends(_compare_service),
) -> CompareResponse:
    """Return comparative statistics for up to 4 politicians.

    Args:
        ids (str): Comma-separated politician IDs (e.g. '1,2,3').
        service (CompareService): Injected compare service.

    Returns:
        CompareResponse: Aggregated stats for each requested politician.

    Raises:
        HTTPException 400: If fewer than 2 or more than 4 IDs are provided.
        HTTPException 404: If any politician ID does not exist.
    """
    try:
        politician_ids = [int(i.strip()) for i in ids.split(",") if i.strip()]
    except ValueError:
        raise HTTPException(status_code=400, detail="ids must be comma-separated integers") from None

    if len(politician_ids) < 2 or len(politician_ids) > 4:
        raise HTTPException(
            status_code=400,
            detail=f"Provide between 2 and 4 politician IDs, got {len(politician_ids)}",
        )

    try:
        return await service.compare(politician_ids)
    except PoliticianNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
