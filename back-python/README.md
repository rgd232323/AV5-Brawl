# Como testar

Dentro dos arquivos das rotas existem demonstrações sobre como executar as rotas. Porém, seguem alguns testes:

## Teste de operação do backend

```curl localhost:5000```

## Listagem de dados

<a href="https://gitlab.com/hvescovi/progs/-/blob/main/web/react_with_next/06-complete-app/back-python/src/routes/pessoa.py?ref_type=heads#L15">link</a>

OU

```curl localhost:5000/pessoas```

## Login

<a href="https://gitlab.com/hvescovi/progs/-/blob/main/web/react_with_next/06-complete-app/back-python/src/routes/login.py?ref_type=heads#L14">link</a>

OU  

```curl http://localhost:5000/login -X POST -H "Content-Type:application/json" -d '{"login":"admin", "senha":"admin123"}'```

NO WINDOWS, use o prompt de comando (NÃO use o PowerShell), e execute desta maneira (note que não usaremos aspas simples e vamos inserir uma contrabarra antes das aspas duplas internas):

```curl.exe -v -X POST "http://localhost:5000/login" -H "Content-Type: application/json" --data "{\"login\":\"admin\",\"senha\":\"admin123\"}"```

## Incluir uma pessoa

<a href="https://gitlab.com/hvescovi/progs/-/blob/main/web/react_with_next/06-complete-app/back-python/src/routes/pessoa.py?ref_type=heads#L61">link</a>

OU

```curl http://localhost:5000/pessoa -X POST -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc4NDU4NDIwNCwianRpIjoiNDE0NWNhOTUtYzA0NS00Mjk2LThjZjctNjUxNzliZTA5ZTMzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjEiLCJuYmYiOjE3ODQ1ODQyMDQsImNzcmYiOiJhMmMxNTU4Yy1lNjI0LTQ2OTYtOWRlZi0wZGY5YTg4Mjc0MzMiLCJleHAiOjE3ODQ1ODUxMDR9.C2ZOz5K7Dm90QCXsiGC7BslmHn-DGYsVYRUtmmaPWsI" -H "Content-Type:application/json" -d '{"nome":"Tiago Matos", "email":"tima@gmail.com","telefone":"47 9 8899 7766", "login":"tima","senha":"tima123"}'```

NO WINDOWS, acrescente ".exe" após o "curl", substitua as aspas simples por aspas duplas e insira contrabarra antes das aspas duplas internas. Por exemplo:

```curl.exe http://localhost:5000/pessoa -X POST -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc4NTYxOTAzMCwianRpIjoiMGJiZTgyNjEtMjliNC00NWRjLWI4OGMtNmJhNzc3OTJjYzRmIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjEiLCJuYmYiOjE3ODU2MTkwMzAsImNzcmYiOiI3ZWRhYjgyYy1kM2JmLTQ5MjctYjcxMC02MjBmOTAzMzZhOWUiLCJleHAiOjE3ODU2MTk5MzB9.EmONHkGIfETj-ysOecWvrNrdT6lNlN9xhy-FyMUKHRM" -H "Content-Type:application/json" -d "{\"nome\":\"Sara Jango\", \"email\":\"saja@gmail.com\",\"telefone\":\"47 9 1155 4376\", \"login\":\"saja\",\"senha\":\"saja123\"}"```

Observação: note que a *token* é gerada após o sucesso da execução do login. No exemplo de incluir pessoa, portanto, o valor de token usado no curl deve ser *substituído* pelo valor que for retornado na execução da rota *login*.

## Erro de Permissão no Windows 

Se ocorrer algum problema de permissão do Windows ao executar o curl.exe usando POST, tente este comando alternativo:

```powershell
$headers = @{
    Authorization = "Bearer <TOKEN>"
    "Content-Type" = "application/json"
}

$body = @{
    nome      = "Sara Jango"
    email     = "saja@gmail.com"
    telefone  = "47 9 1155 4376"
    login     = "saja"
    senha     = "saja123"
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "http://localhost:5000/pessoa" `
    -Method Post `
    -Headers $headers `
    -Body $body
```

## Gerenciar brawlers

As rotas de leitura são públicas. Para criar, atualizar ou excluir brawlers,
envie o JWT retornado por `/login` no cabeçalho `Authorization: Bearer <token>`.

- `GET /brawlers` lista todos; filtros opcionais: `nome`, `classe` e `velocidade`
- `GET /brawlers/<id>` consulta um brawler
- `POST /brawlers` cria um brawler com `nome`, `classe`, `velocidade` e `descricao`
- `PUT /brawlers/<id>` substitui os quatro campos
- `PATCH /brawlers/<id>` atualiza somente os campos informados
- `DELETE /brawlers/<id>` exclui um brawler

Os campos são textos obrigatórios, com até 200 caracteres. O nome não pode ser
duplicado, sem distinção entre maiúsculas e minúsculas. Respostas de erro usam
`resultado: "erro"` e status HTTP apropriado (400, 401, 404, 409 ou 500).

Para preparar as tabelas de Pessoa e Brawler em um banco existente ou novo,
aplique as migrações antes de iniciar o backend:

```
uv run flask --app src/app db upgrade
```

Execute a migração antes de iniciar o backend. Na inicialização, o usuário
`admin` (`admin123`) é criado somente se ainda não existir; sua senha é
armazenada com hash. A inicialização não substitui credenciais existentes.

# Como instalar as bibliotecas necessárias

É preciso pelo menos uma vez instalar as bibliotecas necessárias para executar o backend. 
Use este comando:

```
uv sync
```

# Como executar

Para executar o backend, use este comando:

```
uv run flask --app src/app run
```
