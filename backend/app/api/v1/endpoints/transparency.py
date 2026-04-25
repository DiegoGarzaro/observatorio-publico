from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.repositories.amendment_repository import AmendmentRepository
from app.repositories.card_expense_repository import CardExpenseRepository
from app.schemas.amendment import AmendmentSummary, PaginatedAmendments
from app.schemas.card_expense import CardExpenseSummary, PaginatedCardExpenses
from app.services.amendment_service import AmendmentService
from app.services.card_expense_service import CardExpenseService

router = APIRouter(prefix="/transparency", tags=["transparency"])

# SIAFI organ code for Presidência da República
PRESIDENCIA = "20101"


def _card_expense_service(session: AsyncSession = Depends(get_session)) -> CardExpenseService:
    return CardExpenseService(CardExpenseRepository(session))


def _amendment_service(session: AsyncSession = Depends(get_session)) -> AmendmentService:
    return AmendmentService(AmendmentRepository(session))


@router.get(
    "/card-expenses",
    response_model=PaginatedCardExpenses,
    summary="List government credit card transactions",
    description=(
        "Returns paginated credit card (CPGF) transactions from Portal da Transparência. "
        "Defaults to Presidência da República (organ_code=20000)."
    ),
)
async def list_card_expenses(
    organ_code: str = Query(
        PRESIDENCIA, pattern=r"^\d{1,10}$", description="Government organ code (digits only)"
    ),
    year: int | None = Query(None, ge=2000, le=2100),
    month: int | None = Query(None, ge=1, le=12),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    service: CardExpenseService = Depends(_card_expense_service),
) -> PaginatedCardExpenses:
    """Return paginated card transactions filtered by organ, year and month.

    Args:
        organ_code (str): Government organ code. Defaults to '20000' (Presidência).
        year (int | None): Filter by transaction year.
        month (int | None): Filter by transaction month (1–12).
        page (int): Page number (1-based).
        page_size (int): Records per page (max 200).
        service (CardExpenseService): Injected service.

    Returns:
        PaginatedCardExpenses: Paginated transaction records.
    """
    return await service.list_expenses(
        organ_code,
        year=year,
        month=month,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/card-expenses/summary",
    response_model=CardExpenseSummary,
    summary="Summarise credit card expenses by month and supplier",
    description=(
        "Returns grand total, monthly breakdown and top 10 suppliers "
        "for the given organ and optional year."
    ),
)
async def get_card_expense_summary(
    organ_code: str = Query(
        PRESIDENCIA, pattern=r"^\d{1,10}$", description="Government organ code (digits only)"
    ),
    year: int | None = Query(None, ge=2000, le=2100),
    service: CardExpenseService = Depends(_card_expense_service),
) -> CardExpenseSummary:
    """Return aggregated summary of card expenses.

    Args:
        organ_code (str): Government organ code.
        year (int | None): Filter by year.
        service (CardExpenseService): Injected service.

    Returns:
        CardExpenseSummary: Total, monthly breakdown and top suppliers.
    """
    return await service.get_summary(organ_code, year=year)


# ─── Amendments (Emendas Parlamentares) ───────────────────────────────────────


@router.get(
    "/amendments",
    response_model=PaginatedAmendments,
    summary="List parliamentary amendments",
    description=(
        "Returns paginated parliamentary amendments from Portal da Transparência. "
        "Covers individual, bancada, committee and 'Emenda Pix' types. "
        "Filter by is_pix=true to see amendments without beneficiary traceability."
    ),
)
async def list_amendments(
    year: int | None = Query(None),
    year_from: int | None = Query(None, description="Filter amendments from this year (inclusive)"),
    year_to: int | None = Query(None, description="Filter amendments up to this year (inclusive)"),
    amendment_type: str | None = Query(None),
    politician_id: int | None = Query(None),
    author_name: str | None = Query(None),
    function_name: str | None = Query(None),
    is_pix: bool | None = Query(
        None, description="Filter Emenda Pix (no beneficiary traceability)"
    ),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    service: AmendmentService = Depends(_amendment_service),
) -> PaginatedAmendments:
    """Return paginated amendments matching the given filters.

    Args:
        year (int | None): Filter by exact reference year.
        year_from (int | None): Filter amendments from this year (inclusive).
        year_to (int | None): Filter amendments up to this year (inclusive).
        amendment_type (str | None): Filter by type.
        politician_id (int | None): Filter by linked politician.
        author_name (str | None): Partial author name search.
        function_name (str | None): Filter by budget function.
        is_pix (bool | None): Filter Emenda Pix amendments.
        page (int): Page number.
        page_size (int): Records per page (max 200).
        service (AmendmentService): Injected service.

    Returns:
        PaginatedAmendments: Paginated amendment items.
    """
    return await service.list_amendments(
        year=year,
        year_from=year_from,
        year_to=year_to,
        amendment_type=amendment_type,
        politician_id=politician_id,
        author_name=author_name,
        function_name=function_name,
        is_pix=is_pix,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/amendments/summary",
    response_model=AmendmentSummary,
    summary="Summarise parliamentary amendments",
    description=(
        "Returns grand totals, Emenda Pix breakdown, by-type, by-function "
        "and top 20 authors by committed value."
    ),
)
async def get_amendment_summary(
    year: int | None = Query(None),
    year_from: int | None = Query(None, description="Filter amendments from this year (inclusive)"),
    year_to: int | None = Query(None, description="Filter amendments up to this year (inclusive)"),
    politician_id: int | None = Query(None, description="Scope summary to a specific politician"),
    service: AmendmentService = Depends(_amendment_service),
) -> AmendmentSummary:
    """Return aggregated summary of parliamentary amendments.

    Args:
        year (int | None): Filter by exact year.
        year_from (int | None): Filter amendments from this year (inclusive).
        year_to (int | None): Filter amendments up to this year (inclusive).
        politician_id (int | None): Scope to a specific politician's amendments.
        service (AmendmentService): Injected service.

    Returns:
        AmendmentSummary: Totals, Pix breakdown and breakdowns by type/function/author.
    """
    return await service.get_summary(
        year=year, year_from=year_from, year_to=year_to, politician_id=politician_id
    )
