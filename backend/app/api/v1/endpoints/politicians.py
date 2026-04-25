from collections.abc import AsyncGenerator

import redis.asyncio as aioredis
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.cache import get_redis_client
from app.database import get_session
from app.etl.senado_client import SenadoClient
from app.repositories.expense_repository import ExpenseRepository
from app.repositories.politician_repository import PoliticianRepository
from app.schemas.expense import ExpenseSummary, PaginatedExpenses
from app.schemas.news import NewsResponse
from app.schemas.politician import PaginatedPoliticians, PoliticianResponse
from app.schemas.senator import SenatorDetailResponse
from app.services.expense_service import ExpenseService
from app.services.news_service import NewsService
from app.services.politician_service import PoliticianService
from app.services.senator_service import SenatorService

router = APIRouter(prefix="/politicians", tags=["politicians"])


def _politician_service(session: AsyncSession = Depends(get_session)) -> PoliticianService:
    return PoliticianService(PoliticianRepository(session))


def _news_service(redis: aioredis.Redis = Depends(get_redis_client)) -> NewsService:
    return NewsService(redis)


def _expense_service(session: AsyncSession = Depends(get_session)) -> ExpenseService:
    return ExpenseService(ExpenseRepository(session), PoliticianRepository(session))


async def _senado_client() -> AsyncGenerator[SenadoClient, None]:
    async with SenadoClient() as client:
        yield client


def _senator_service(
    session: AsyncSession = Depends(get_session),
    client: SenadoClient = Depends(_senado_client),
) -> SenatorService:
    return SenatorService(PoliticianRepository(session), client)


@router.get("", response_model=PaginatedPoliticians, summary="List politicians")
async def list_politicians(
    name: str | None = Query(None, description="Partial name search"),
    party: str | None = Query(None, description="Party abbreviation (e.g. PT)"),
    uf: str | None = Query(None, description="State abbreviation (e.g. SP)"),
    municipality: str | None = Query(None, description="Partial municipality name (e.g. São Paulo)"),
    legislature: int | None = Query(None, description="Legislature number"),
    role: str | None = Query(None, description="Role type (deputado_federal, senador)"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    service: PoliticianService = Depends(_politician_service),
) -> PaginatedPoliticians:
    return await service.list(
        name=name,
        party=party,
        uf=uf,
        municipality=municipality,
        legislature=legislature,
        role=role,
        page=page,
        page_size=page_size,
    )


@router.get("/{politician_id}", response_model=PoliticianResponse, summary="Get politician profile")
async def get_politician(
    politician_id: int,
    service: PoliticianService = Depends(_politician_service),
) -> PoliticianResponse:
    return await service.get_profile(politician_id)


@router.get(
    "/{politician_id}/senator-detail",
    response_model=SenatorDetailResponse,
    summary="Get extended senator profile from Senado API",
)
async def get_senator_detail(
    politician_id: int,
    service: SenatorService = Depends(_senator_service),
) -> SenatorDetailResponse:
    return await service.get_detail(politician_id)


@router.get(
    "/{politician_id}/expenses",
    response_model=PaginatedExpenses,
    summary="List politician expenses",
)
async def list_expenses(
    politician_id: int,
    year: int | None = Query(None),
    month: int | None = Query(None, ge=1, le=12),
    category: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    service: ExpenseService = Depends(_expense_service),
) -> PaginatedExpenses:
    return await service.list_expenses(
        politician_id,
        year=year,
        month=month,
        category=category,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/{politician_id}/expenses/summary",
    response_model=ExpenseSummary,
    summary="Get expense summary for charts",
)
async def get_expense_summary(
    politician_id: int,
    year: int | None = Query(None),
    service: ExpenseService = Depends(_expense_service),
) -> ExpenseSummary:
    return await service.get_summary(politician_id, year=year)


@router.get(
    "/{politician_id}/news",
    response_model=NewsResponse,
    summary="Get recent news articles for a politician",
    description=(
        "Returns up to 5 recent news articles sourced from Google News RSS. "
        "Results are cached in Redis for 6 hours. "
        "Cache is pre-warmed daily by the ETL runner."
    ),
)
async def get_politician_news(
    politician_id: int,
    politician_service: PoliticianService = Depends(_politician_service),
    news_service: NewsService = Depends(_news_service),
) -> NewsResponse:
    """Return recent news for a politician, served from Redis cache when available.

    Args:
        politician_id (int): Internal politician ID.
        politician_service (PoliticianService): Used to resolve the politician name.
        news_service (NewsService): Fetches and caches news articles.

    Returns:
        NewsResponse: Up to 5 articles with title, URL, source and date.

    Raises:
        HTTPException: 404 if the politician does not exist.
    """
    politician = await politician_service.get_profile(politician_id)
    if politician is None:
        raise HTTPException(status_code=404, detail="Politician not found")

    items, cached, cached_at = await news_service.get_news(
        politician_id=politician_id,
        politician_name=politician.name,
    )
    return NewsResponse(items=items, politician_name=politician.name, cached=cached, cached_at=cached_at)
