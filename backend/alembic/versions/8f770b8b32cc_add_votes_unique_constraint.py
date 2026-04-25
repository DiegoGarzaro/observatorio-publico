"""add_votes_unique_constraint

Revision ID: 8f770b8b32cc
Revises: add890c6769f
Create Date: 2026-04-14 19:47:55.145173

"""
from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = '8f770b8b32cc'
down_revision: str | Sequence[str] | None = 'add890c6769f'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_unique_constraint(
        "uq_votes_votacao_politician",
        "votes",
        ["external_votacao_id", "politician_id"],
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint("uq_votes_votacao_politician", "votes", type_="unique")
