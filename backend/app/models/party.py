from datetime import datetime

from sqlalchemy import String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Party(Base):
    """Political party.

    Attributes:
        id: Internal primary key.
        abbreviation: Party acronym (e.g. PT, PSDB).
        name: Full party name.
        created_at: Record creation timestamp.
    """

    __tablename__ = "parties"

    id: Mapped[int] = mapped_column(primary_key=True)
    abbreviation: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    politicians: Mapped[list["Politician"]] = relationship(back_populates="party")
