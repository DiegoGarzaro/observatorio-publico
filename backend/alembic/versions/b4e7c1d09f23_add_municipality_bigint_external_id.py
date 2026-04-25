"""add municipality and bigint external_id

Revision ID: b4e7c1d09f23
Revises: a9a9febe9fca
Create Date: 2026-04-21 00:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "b4e7c1d09f23"
down_revision: str | Sequence[str] | None = "a9a9febe9fca"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    # Widen external_id to BIGINT — TSE SQ_CANDIDATO values exceed INTEGER range
    op.alter_column(
        "politicians",
        "external_id",
        existing_type=sa.Integer(),
        type_=sa.BigInteger(),
        existing_nullable=False,
    )

    # Add municipality column for vereadores and prefeitos
    op.add_column(
        "politicians",
        sa.Column("municipality", sa.String(length=255), nullable=True),
    )
    op.create_index("ix_politicians_municipality", "politicians", ["municipality"])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("ix_politicians_municipality", table_name="politicians")
    op.drop_column("politicians", "municipality")
    op.alter_column(
        "politicians",
        "external_id",
        existing_type=sa.BigInteger(),
        type_=sa.Integer(),
        existing_nullable=False,
    )
