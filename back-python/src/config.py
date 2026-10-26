from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, jwt_required, create_access_token
import os
from flask_migrate import Migrate

# biblioteca para cifrar a senha
import bcrypt

# CONFIGURAÇÕES
# -------------

# Inicialização e configuração do aplicativo Flask
app = Flask(__name__)

# A chave secreta é usada para proteger 
# sessões e formulários (CSRF - Cross-Site Request Forgery)
app.config['SECRET_KEY'] = 'kfjad fkjasdlkfja;sldkfj39480293afKJ KJD:'

# configurar JWT
app.config['JWT_SECRET_KEY'] = 'kfjad fkjasdlkfja;sldkfj39480293afKJ KJD:'

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

database_url = os.getenv("POSTGRES_URL_NON_POOLING") or os.getenv("DATABASE_URL")

if database_url and database_url.startswith("postgres://"):

    database_url = database_url.replace(
        "postgres://",
        "postgresql+psycopg2://",
        1,
    )
    app.config["SQLALCHEMY_DATABASE_URI"] = database_url

elif database_url:
    app.config["SQLALCHEMY_DATABASE_URI"] = database_url

else:
    # pega o caminho no qual está este arquivo
    caminho = os.path.dirname(os.path.abspath(__file__))
    # soma o caminho ao nome do arquivo
    arquivobd = os.path.join(caminho, 'database', 'pessoas.db')
    # configura o arquivo de banco de dados
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///" + arquivobd

# aplicar CORS
CORS(app)

# Inicialização da extensão SQLAlchemy
db = SQLAlchemy(app)

# preparar migration
# db.init_app(app)
migrate = Migrate(app, db)

jwt = JWTManager(app)
