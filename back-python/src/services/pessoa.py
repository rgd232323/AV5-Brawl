from config import *
from models.pessoa import Pessoa

def criar_pessoa(data):
    # a senha vai cifrada
    password_bytes = data['senha'].encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password_bytes, salt)
    senha_para_salvar = hashed_password.decode('utf-8')

    # criar a pessoa
    pessoa = Pessoa(
        nome=data['nome'],
        email=data['email'],
        login=data['login'],
        senha=senha_para_salvar,
        telefone=data.get('telefone')
    )
    
    # salvar no banco de dados
    db.session.add(pessoa)
    db.session.commit()
    
    return pessoa

def retornar_pessoas():
    # buscar todas as pessoas no 
    # banco de dados
    pessoas = Pessoa.query.all()
    
    return pessoas

def gerar_token(login, senha):
    # buscar a pessoa pelo login
    pessoa = Pessoa.query.filter_by(login=login).first()
    
    if pessoa:
        # verificar se a senha fornecida corresponde à senha armazenada
        password_bytes = senha.encode('utf-8')
        stored_password_bytes = pessoa.senha.encode('utf-8')
        
        if bcrypt.checkpw(password_bytes, stored_password_bytes):
            # gerar token JWT            
            token = create_access_token(identity=str(pessoa.id))
            return token
    
    return None