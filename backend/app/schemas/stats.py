from decimal import Decimal

from pydantic import BaseModel

from app.schemas.expense import CategoryTotal, MonthTotal


class GlobalExpenseSummary(BaseModel):
    """Aggregated CEAP expense summary across all politicians.

    Attributes:
        total (Decimal): Grand total in BRL.
        politician_count (int): Number of politicians with expenses in the period.
        by_month (list[MonthTotal]): Monthly breakdown.
        by_category (list[CategoryTotal]): Category breakdown.
    """

    total: Decimal
    politician_count: int
    by_month: list[MonthTotal]
    by_category: list[CategoryTotal]
