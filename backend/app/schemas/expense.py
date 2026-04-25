from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ExpenseResponse(BaseModel):
    """Individual expense record.

    Attributes:
        id (int): Internal ID.
        year (int): Reference year.
        month (int): Reference month.
        category (str): Expense category.
        description (str | None): Expense description.
        supplier_name (str | None): Supplier name.
        supplier_document (str | None): Supplier CNPJ or CPF.
        value (Decimal): Net value in BRL.
        doc_url (str | None): Supporting document URL.
    """

    model_config = ConfigDict(from_attributes=True)

    id: int
    year: int
    month: int
    category: str
    description: str | None = None
    supplier_name: str | None = None
    supplier_document: str | None = None
    value: Decimal
    doc_url: str | None = None


class PaginatedExpenses(BaseModel):
    """Paginated list of expenses.

    Attributes:
        items (list[ExpenseResponse]): Page items.
        total (int): Total matching records.
        page (int): Current page.
        page_size (int): Items per page.
    """

    items: list[ExpenseResponse]
    total: int
    page: int
    page_size: int


class CategoryTotal(BaseModel):
    """Expense total for a single category.

    Attributes:
        category (str): Category name.
        total (Decimal): Total amount.
    """

    category: str
    total: Decimal


class MonthTotal(BaseModel):
    """Expense total for a single month.

    Attributes:
        year (int): Year.
        month (int): Month number.
        total (Decimal): Total amount.
    """

    year: int
    month: int
    total: Decimal


class ExpenseSummary(BaseModel):
    """Aggregated expense summary for chart rendering.

    Attributes:
        total (Decimal): Grand total.
        by_category (list[CategoryTotal]): Breakdown by category.
        by_month (list[MonthTotal]): Breakdown by month.
    """

    total: Decimal
    by_category: list[CategoryTotal]
    by_month: list[MonthTotal]
