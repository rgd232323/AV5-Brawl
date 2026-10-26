from sqlalchemy import Index, func

from config import db


class Brawler(db.Model):
    __tablename__ = "brawl"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(200), nullable=False)
    classe = db.Column(db.String(200), nullable=False)
    velocidade = db.Column(db.String(200), nullable=False)
    descricao = db.Column(db.String(200), nullable=False)

    __table_args__ = (
        Index("uq_brawl_nome_lower", func.lower(nome), unique=True),
    )


    def json(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "classe": self.classe,
            "velocidade": self.velocidade,
            "descricao": self.descricao,
        }


Brawl = Brawler
