from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class CardExpenseItem(BaseModel):
    """Single card transaction, as returned in list endpoints.

    Attributes:
        id (int): Internal ID.
        transaction_date (date | None): Date the purchase was made.
        holder_name (str | None): Name of the card holder.
        holder_role (str | None): Job title of the card holder.
        supplier_name (str | None): Vendor name.
        supplier_cnpj (str | None): Vendor CNPJ.
        organ_name (str): Full organ name.
        management_unit_name (str | None): Sub-unit name.
        value (Decimal): Transaction value in BRL.
        installments (int): Number of installments.
    """

    id: int
    transaction_date: date | None
    holder_name: str | None
    holder_role: str | None
    supplier_name: str | None
    supplier_cnpj: str | None
    organ_name: str
    management_unit_name: str | None
    value: Decimal
    installments: int

    model_config = ConfigDict(from_attributes=True)


class CardExpenseSupplierTotal(BaseModel):
    """Aggregated total per supplier.

    Attributes:
        supplier_name (str | None): Vendor name.
        supplier_cnpj (str | None): Vendor CNPJ.
        total (Decimal): Sum of all transactions to this vendor.
        count (int): Number of transactions.
    """

    supplier_name: str | None
    supplier_cnpj: str | None
    total: Decimal
    count: int


class CardExpenseMonthTotal(BaseModel):
    """Aggregated total per month.

    Attributes:
        year (int): Transaction year.
        month (int): Transaction month (1–12).
        total (Decimal): Sum of all transactions in the month.
        count (int): Number of transactions.
    """

    year: int
    month: int
    total: Decimal
    count: int


class PaginatedCardExpenses(BaseModel):
    """Paginated list of card expenses.

    Attributes:
        items (list[CardExpenseItem]): Records on the current page.
        total (int): Total number of records matching the filters.
        page (int): Current page number (1-based).
        page_size (int): Maximum records per page.
    """

    items: list[CardExpenseItem]
    total: int
    page: int
    page_size: int


class CardExpenseSummary(BaseModel):
    """Summary of card expenses for a given organ and period.

    Attributes:
        total (Decimal): Grand total across all transactions.
        count (int): Total number of transactions.
        by_month (list[CardExpenseMonthTotal]): Monthly breakdown.
        top_suppliers (list[CardExpenseSupplierTotal]): Top 10 vendors by total received.
    """

    total: Decimal
    count: int
    by_month: list[CardExpenseMonthTotal]
    top_suppliers: list[CardExpenseSupplierTotal]
