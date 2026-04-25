from datetime import date, datetime

from sqlalchemy import Date, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Vote(Base):
    """A single politician's vote in a plenary session.

    Attributes:
        id: Internal primary key.
        external_votacao_id: Votação ID from the Câmara API.
        politician_id: Internal ID of the voting politician.
        proposition_id: Internal ID of the proposition being voted on.
        direction: Vote cast (Sim, Não, Abstenção, Obstrução, Artigo 17, etc.).
        session_date: Date the vote session took place.
        created_at: Record creation timestamp.
    """

    __tablename__ = "votes"
    __table_args__ = (
        UniqueConstraint("external_votacao_id", "politician_id", name="uq_votes_votacao_politician"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    external_votacao_id: Mapped[str] = mapped_column(String(50), index=True)
    politician_id: Mapped[int] = mapped_column(ForeignKey("politicians.id"), index=True)
    proposition_id: Mapped[int | None] = mapped_column(ForeignKey("propositions.id"), index=True)
    direction: Mapped[str] = mapped_column(String(50))
    session_date: Mapped[date | None] = mapped_column(Date, index=True)
    description: Mapped[str | None] = mapped_column(String(500))
    proposition_ref: Mapped[str | None] = mapped_column(String(50), index=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    politician: Mapped["Politician"] = relationship()
    proposition: Mapped["Proposition"] = relationship(back_populates="votes")
