from config import *
class Pessoa(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(200), nullable=False)
    telefone = db.Column(db.String(200), nullable=True)
    login = db.Column(db.String(200), nullable=False)
    # armazenado em formato cifrado
    senha = db.Column(db.String(200), nullable=False)

    def json(self):
        return {
            "id":self.id,
            "nome":self.nome,
                "email":self.email,
                "telefone":self.telefone,
                "login":self.login,
            }
