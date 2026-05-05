"""Add teacher access codes table

Revision ID: 0009_teacher_access_codes
Revises: 0008_teacher_advanced_features
Create Date: 2026-04-30
"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "0009_teacher_access_codes"
down_revision = "0008_teacher_advanced_features"
branch_labels = None
depends_on = None


# ── Pre-approved teacher access codes ────────────────────────────────────────
TEACHER_CODES = [
    "ari7777",
    "rol2313",
    "vic4059",
    "ari7878",
    "har1818",
]


def _has_table(name: str) -> bool:
    bind = op.get_bind()
    return name in sa.inspect(bind).get_table_names()


def upgrade() -> None:
    if not _has_table("teacher_access_codes"):
        op.create_table(
            "teacher_access_codes",
            sa.Column("id",         sa.Integer(),     primary_key=True, autoincrement=True),
            sa.Column("code",       sa.String(20),    nullable=False, unique=True, index=True),
            sa.Column("is_active",  sa.Boolean(),     nullable=False, server_default=sa.text("true")),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        )

        # Seed the approved codes
        op.bulk_insert(
            sa.table(
                "teacher_access_codes",
                sa.column("code",      sa.String),
                sa.column("is_active", sa.Boolean),
            ),
            [{"code": c, "is_active": True} for c in TEACHER_CODES],
        )


def downgrade() -> None:
    if _has_table("teacher_access_codes"):
        op.drop_table("teacher_access_codes")
