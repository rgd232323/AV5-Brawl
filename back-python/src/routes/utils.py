from sqlalchemy import inspect

from config import *
from models.pessoa import Pessoa

# Override the missing token / unauthorized error message
@jwt.unauthorized_loader
def my_custom_unauthorized_callback(error_string):
    return jsonify({
        "resultado": "erro",
        "detalhes": "Estah faltando a TOKEN de autorizacao no cabecalho"
    }), 401

# rota padrão
@app.route('/')
def index():
    return "Backend operante :-)"

def auxiliar_criar_bd():
    with app.app_context():
        if not inspect(db.engine).has_table(Pessoa.__tablename__):
            return

        pessoa_inicial = Pessoa.query.filter_by(login="admin").first()
        if pessoa_inicial:
            return

        pessoa_inicial = Pessoa(
            nome="Administrador",
            email="admin@admin",
            login="admin",
            senha=bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
            telefone="(00) 0 0000-0000"
        )
        db.session.add(pessoa_inicial)
        db.session.commit()


@app.route("/criar_banco", methods=['GET'])
def criar_banco():
    db.create_all()
    auxiliar_criar_bd()

    return jsonify({"resultado":"ok", 
                    "detalhes":"Banco de dados criado com sucesso!"})


# rota padrão
@app.route('/info')
def info():
    s = 'Where is the database?'
    s += app.config['SQLALCHEMY_DATABASE_URI']
    return "Info: " + s