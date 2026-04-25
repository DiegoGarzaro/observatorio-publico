from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.repositories.expense_repository import ExpenseRepository
from app.schemas.stats import GlobalExpenseSummary
from app.services.stats_service import StatsService

router = APIRouter(prefix="/stats", tags=["stats"])


def _stats_service(session: AsyncSession = Depends(get_session)) -> StatsService:
    return StatsService(ExpenseRepository(session))


@router.get(
    "/expenses-overview",
    response_model=GlobalExpenseSummary,
    summary="Global CEAP expense overview",
    description=(
        "Returns total CEAP parliamentary allowance spending aggregated across all deputies, "
        "broken down by month and category. Optionally filtered by year."
    ),
)
async def get_expenses_overview(
    year: int | None = Query(None, description="Filter by year"),
    service: StatsService = Depends(_stats_service),
) -> GlobalExpenseSummary:
    """Return aggregated CEAP expense overview across all politicians.

    Args:
        year (int | None): Filter by year.
        service (StatsService): Injected service.

    Returns:
        GlobalExpenseSummary: Grand total, politician count and monthly/category breakdowns.
    """
    return await service.get_global_expense_summary(year=year)
