from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, ForeignKey, Index, Integer, Numeric, String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Amendment(Base):
    """Parliamentary amendment (emenda parlamentar) from Portal da Transparência.

    Covers individual emendas (deputados/senadores), bancada emendas, committee
    emendas and the 'Emenda Pix' type that bypasses beneficiary traceability.

    Source: api.portaldatransparencia.gov.br/api-de-dados/emendas

    Attributes:
        id: Internal primary key.
        external_code: Unique amendment code from the API (codigoEmenda).
        year: Reference year.
        amendment_type: Type of amendment (e.g. 'Emenda Individual',
            'Emenda de Bancada', 'Emenda de Comissão', 'Emenda Pix').
        author: Author identifier code (e.g. deputy/senator code or bancada name).
        author_name: Human-readable author name.
        politician_id: FK to Politician, set when author matches a tracked politician.
        amendment_number: Sequential number within the year and type.
        locality: Target locality/UF of the spending.
        function_name: Budget function (e.g. 'Saúde', 'Educação').
        subfunction_name: Budget subfunction (e.g. 'Atenção Básica').
        committed_value: Empenhado — reserved from the budget.
        liquidated_value: Liquidado — goods/services received and confirmed.
        paid_value: Pago — money actually transferred.
        remainder_inscribed: Restos a pagar inscritos.
        remainder_canceled: Restos a pagar cancelados.
        remainder_paid: Restos a pagar pagos.
        is_pix: True for 'Emenda Pix' — lacks beneficiary traceability.
        raw_data: Full raw JSON payload, preserved for auditing.
        created_at: Record creation timestamp.
    """

    __tablename__ = "amendments"

    id: Mapped[int] = mapped_column(primary_key=True)
    external_code: Mapped[str] = mapped_column(String(50), unique=True, index=True)

    year: Mapped[int] = mapped_column(Integer, index=True)
    amendment_type: Mapped[str | None] = mapped_column(String(100), index=True)
    author: Mapped[str | None] = mapped_column(String(255))
    author_name: Mapped[str | None] = mapped_column(String(255), index=True)

    politician_id: Mapped[int | None] = mapped_column(
        ForeignKey("politicians.id"), nullable=True, index=True
    )

    amendment_number: Mapped[str | None] = mapped_column(String(20))
    locality: Mapped[str | None] = mapped_column(String(255), index=True)
    function_name: Mapped[str | None] = mapped_column(String(100), index=True)
    subfunction_name: Mapped[str | None] = mapped_column(String(100))

    committed_value: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    liquidated_value: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    paid_value: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    remainder_inscribed: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    remainder_canceled: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    remainder_paid: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)

    is_pix: Mapped[bool] = mapped_column(Boolean, default=False)

    raw_data: Mapped[dict | None] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    politician: Mapped["Politician | None"] = relationship(back_populates="amendments")

    __table_args__ = (
        Index("ix_amendments_year_type", "year", "amendment_type"),
        Index("ix_amendments_author_year", "author_name", "year"),
        Index("ix_amendments_politician_year", "politician_id", "year"),
    )
