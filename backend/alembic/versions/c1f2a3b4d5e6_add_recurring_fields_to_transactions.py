"""add recurring fields to transactions

Revision ID: c1f2a3b4d5e6
Revises: ab4e35e95829
Create Date: 2026-03-30 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'c1f2a3b4d5e6'
down_revision: Union[str, Sequence[str], None] = 'ab4e35e95829'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'transactions',
        sa.Column('is_recurring', sa.Boolean(), nullable=False, server_default='false'),
    )
    op.add_column(
        'transactions',
        sa.Column('recurrence', sa.String(length=20), nullable=True),
    )


def downgrade() -> None:
    op.drop_column('transactions', 'recurrence')
    op.drop_column('transactions', 'is_recurring')
