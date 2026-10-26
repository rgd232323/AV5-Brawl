"""Create the Pessoa table for fresh databases."""

from alembic import op
import sqlalchemy as sa


revision = "20261019_02"
down_revision = "20261019_01"
branch_labels = None
depends_on = None


def upgrade():
    if sa.inspect(op.get_bind()).has_table("pessoa"):
        return

    op.create_table(
        "pessoa",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("nome", sa.String(length=200), nullable=False),
        sa.Column("email", sa.String(length=200), nullable=False),
        sa.Column("telefone", sa.String(length=200), nullable=True),
        sa.Column("login", sa.String(length=200), nullable=False),
        sa.Column("senha", sa.String(length=200), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade():
    connection = op.get_bind()
    if not sa.inspect(connection).has_table("pessoa"):
        return

    people_count = connection.execute(
        sa.text("SELECT COUNT(*) FROM pessoa")
    ).scalar_one()
    if people_count:
        raise RuntimeError(
            "Refusing to drop the Pessoa table while it contains user records."
        )
    op.drop_table("pessoa")
