"""add_role_source_to_politicians

Revision ID: 9eeb7ce74443
Revises: 8f770b8b32cc
Create Date: 2026-04-14 23:53:35.141147

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = '9eeb7ce74443'
down_revision: str | Sequence[str] | None = '8f770b8b32cc'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add role and source columns with server defaults so existing rows are backfilled
    op.add_column(
        "politicians",
        sa.Column("role", sa.String(50), nullable=False, server_default="deputado_federal"),
    )
    op.add_column(
        "politicians",
        sa.Column("source", sa.String(20), nullable=False, server_default="camara"),
    )
    op.create_index("ix_politicians_role", "politicians", ["role"])
    op.create_index("ix_politicians_source", "politicians", ["source"])

    # Replace the single-column unique index with a composite unique constraint.
    # Alembic created it as an index named "ix_politicians_external_id" because
    # unique=True was set directly on the mapped_column (not via UniqueConstraint).
    op.drop_index("ix_politicians_external_id", "politicians")
    op.create_unique_constraint(
        "uq_politicians_external_id_source",
        "politicians",
        ["external_id", "source"],
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint("uq_politicians_external_id_source", "politicians", type_="unique")
    op.create_index("ix_politicians_external_id", "politicians", ["external_id"], unique=True)
    op.drop_index("ix_politicians_source", "politicians")
    op.drop_index("ix_politicians_role", "politicians")
    op.drop_column("politicians", "source")
    op.drop_column("politicians", "role")
