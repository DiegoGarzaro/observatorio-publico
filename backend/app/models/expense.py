from datetime import datetime
from decimal import Decimal

from sqlalchemy import ForeignKey, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Expense(Base):
    """CEAP (Cota para Exercício da Atividade Parlamentar) expense.

    Attributes:
        id: Internal primary key.
        external_id: Unique identifier from the Câmara API for deduplication.
        politician_id: Foreign key to Politician.
        year: Reference year.
        month: Reference month (1–12).
        category: Expense type as defined by CEAP rules.
        description: Free-text description of the expense.
        supplier_name: Supplier or provider name.
        supplier_document: Supplier CNPJ or CPF.
        value: Net expense value in BRL.
        doc_url: URL to the supporting document.
        created_at: Record creation timestamp.
    """

    __tablename__ = "expenses"

    id: Mapped[int] = mapped_column(primary_key=True)
    external_id: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    politician_id: Mapped[int] = mapped_column(ForeignKey("politicians.id"), index=True)
    year: Mapped[int] = mapped_column(Integer, index=True)
    month: Mapped[int] = mapped_column(Integer)
    category: Mapped[str] = mapped_column(String(255), index=True)
    description: Mapped[str | None] = mapped_column(String(500))
    supplier_name: Mapped[str | None] = mapped_column(String(255))
    supplier_document: Mapped[str | None] = mapped_column(String(20))
    value: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    doc_url: Mapped[str | None] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    politician: Mapped["Politician"] = relationship(back_populates="expenses")
