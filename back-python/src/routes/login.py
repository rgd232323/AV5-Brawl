from config import *
import services.pessoa as pessoa_service



'''
-----
LOGIN
-----
'''


'''
curl http://localhost:5000/login -X POST -H "Content-Type:application/json" -d '{"login":"admin", "senha":"admin123"}'
{"detalhes":{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc4NDU4NDIwNCwianRpIjoiNDE0NWNhOTUtYzA0NS00Mjk2LThjZjctNjUxNzliZTA5ZTMzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjEiLCJuYmYiOjE3ODQ1ODQyMDQsImNzcmYiOiJhMmMxNTU4Yy1lNjI0LTQ2OTYtOWRlZi0wZGY5YTg4Mjc0MzMiLCJleHAiOjE3ODQ1ODUxMDR9.C2ZOz5K7Dm90QCXsiGC7BslmHn-DGYsVYRUtmmaPWsI"},"resultado":"ok"}

'''

# rota para fornecer uma JWT
@app.route('/login', methods=['POST'])
def login():
    # ler os dados em json
    dados = request.json
    
    # se faltou algum dado obrigatório...
    if not dados or not dados.get('login') or not dados.get('senha'):
        # retorna erro
        return jsonify({"resultado":"erro", "detalhes":"Login e senha são obrigatórios"}), 400
    
    # chama o serviço de login
    token = pessoa_service.gerar_token(dados['login'], dados['senha'])
    
    if token:
        # retornar mensagem de sucesso :-)
        return jsonify({
            "resultado":"ok", 
            "detalhes":{"token":token}
        }), 200
    else:
        return jsonify({"resultado":"erro", 
                        "detalhes":"Login ou senha inválidos"}), 401
