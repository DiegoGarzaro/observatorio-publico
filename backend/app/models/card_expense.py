from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, ForeignKey, Index, Integer, Numeric, String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class CardExpense(Base):
    """Government credit card (CPGF) transaction from Portal da Transparência.

    Each row represents a single purchase made with the Cartão de Pagamento
    do Governo Federal. Source: api.portaldatransparencia.gov.br/api-de-dados/cartoes

    Attributes:
        id: Internal primary key.
        external_id: Unique identifier from the API for deduplication.
        politician_id: Optional FK to Politician (only set for president/VPs).
        organ_code: Government organ code (e.g. '20000' for Presidência).
        organ_name: Full organ name.
        management_unit_code: Sub-unit code within the organ.
        management_unit_name: Sub-unit name.
        holder_name: Name of the card holder.
        holder_cpf: Masked CPF of the card holder.
        holder_role: Job title / role of the card holder.
        card_number: Masked card number.
        transaction_date: Date the purchase was made.
        supplier_name: Name of the vendor/establishment.
        supplier_cnpj: CNPJ of the vendor.
        value: Transaction value in BRL.
        installments: Number of installments (usually 1).
        raw_data: Full raw JSON payload from the API, preserved for auditing.
        created_at: Record creation timestamp.
    """

    __tablename__ = "card_expenses"

    id: Mapped[int] = mapped_column(primary_key=True)
    external_id: Mapped[str] = mapped_column(String(100), unique=True, index=True)

    # Optionally linked to a Politician (for president and vice-president)
    politician_id: Mapped[int | None] = mapped_column(
        ForeignKey("politicians.id"), nullable=True, index=True
    )

    # Organ / management unit
    organ_code: Mapped[str] = mapped_column(String(20), index=True)
    organ_name: Mapped[str] = mapped_column(String(255))
    management_unit_code: Mapped[str | None] = mapped_column(String(20))
    management_unit_name: Mapped[str | None] = mapped_column(String(255))

    # Card holder
    holder_name: Mapped[str | None] = mapped_column(String(255), index=True)
    holder_cpf: Mapped[str | None] = mapped_column(String(20))
    holder_role: Mapped[str | None] = mapped_column(String(255))
    card_number: Mapped[str | None] = mapped_column(String(30))

    # Transaction
    transaction_date: Mapped[date | None] = mapped_column(Date, index=True)
    transaction_year: Mapped[int | None] = mapped_column(Integer, index=True)
    transaction_month: Mapped[int | None] = mapped_column(Integer)

    # Supplier
    supplier_name: Mapped[str | None] = mapped_column(String(255), index=True)
    supplier_cnpj: Mapped[str | None] = mapped_column(String(20), index=True)

    # Value
    value: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    installments: Mapped[int] = mapped_column(Integer, default=1)

    # Full payload for auditing
    raw_data: Mapped[dict | None] = mapped_column(JSONB)

    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    politician: Mapped["Politician | None"] = relationship(back_populates="card_expenses")

    __table_args__ = (
        Index("ix_card_expenses_organ_year", "organ_code", "transaction_year"),
        Index("ix_card_expenses_supplier_organ", "supplier_cnpj", "organ_code"),
    )
