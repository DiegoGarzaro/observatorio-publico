from datetime import datetime

from sqlalchemy import ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Proposition(Base):
    """Legislative proposition authored or co-authored by a politician.

    Attributes:
        id: Internal primary key.
        external_id: Proposition ID from the Câmara API.
        author_id: Internal ID of the primary authoring politician.
        prop_type: Proposition type acronym (e.g. PL, PEC, MPV).
        number: Proposition number within its year.
        year: Year of submission.
        title: Short summary (ementa).
        status: Current processing status.
        created_at: Record creation timestamp.
    """

    __tablename__ = "propositions"

    id: Mapped[int] = mapped_column(primary_key=True)
    external_id: Mapped[int] = mapped_column(Integer, unique=True, index=True)
    author_id: Mapped[int | None] = mapped_column(ForeignKey("politicians.id"), index=True)
    prop_type: Mapped[str] = mapped_column(String(20), index=True)
    number: Mapped[int] = mapped_column(Integer)
    year: Mapped[int] = mapped_column(Integer, index=True)
    title: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    author: Mapped["Politician"] = relationship()
    votes: Mapped[list["Vote"]] = relationship(back_populates="proposition")
