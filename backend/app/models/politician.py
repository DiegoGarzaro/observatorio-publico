from datetime import datetime

from sqlalchemy import BigInteger, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Politician(Base):
    """An elected official tracked by the system.

    Attributes:
        id: Internal primary key.
        external_id: Numeric ID from the source API (Câmara, Senado, TSE etc.) — BigInt to support TSE sequence numbers.
        role: Role type — deputado_federal, senador, presidente, vice_presidente, ministro, governador, prefeito, deputado_estadual, vereador.
        source: Data source identifier — camara, senado, tse, manual.
        name: Full name.
        photo_url: URL of the official photo.
        party_id: Foreign key to Party.
        uf: State abbreviation (e.g. SP, RJ).
        municipality: Municipality name (used for vereadores and prefeitos).
        email: Official email address.
        phone: Official phone number.
        legislature: Legislature number or term start year.
        mandate_end: Year the mandate ends (None if current).
        created_at: Record creation timestamp.
        updated_at: Record last update timestamp.
    """

    __tablename__ = "politicians"
    __table_args__ = (
        UniqueConstraint("external_id", "source", name="uq_politicians_external_id_source"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    external_id: Mapped[int] = mapped_column(BigInteger, index=True)
    role: Mapped[str] = mapped_column(String(50), server_default="deputado_federal", index=True)
    source: Mapped[str] = mapped_column(String(20), server_default="camara", index=True)
    name: Mapped[str] = mapped_column(String(255), index=True)
    photo_url: Mapped[str | None] = mapped_column(String(500))
    party_id: Mapped[int | None] = mapped_column(ForeignKey("parties.id"), index=True)
    uf: Mapped[str | None] = mapped_column(String(2), index=True)
    municipality: Mapped[str | None] = mapped_column(String(255), index=True)
    email: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(50))
    legislature: Mapped[int | None] = mapped_column(Integer, index=True)
    mandate_end: Mapped[int | None] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    party: Mapped["Party"] = relationship(back_populates="politicians")
    expenses: Mapped[list["Expense"]] = relationship(back_populates="politician")
    card_expenses: Mapped[list["CardExpense"]] = relationship(back_populates="politician")
    amendments: Mapped[list["Amendment"]] = relationship(back_populates="politician")
