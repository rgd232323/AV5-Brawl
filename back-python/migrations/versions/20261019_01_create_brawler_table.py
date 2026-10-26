"""Create the brawler table."""

from alembic import op
import sqlalchemy as sa


revision = "20261019_01"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "brawl",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("nome", sa.String(length=200), nullable=False),
        sa.Column("classe", sa.String(length=200), nullable=False),
        sa.Column("velocidade", sa.String(length=200), nullable=False),
        sa.Column("descricao", sa.String(length=200), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "uq_brawl_nome_lower",
        "brawl",
        [sa.text("lower(nome)")],
        unique=True,
    )


def downgrade():
    op.drop_index("uq_brawl_nome_lower", table_name="brawl")
    op.drop_table("brawl")
