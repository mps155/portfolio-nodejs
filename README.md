# Bank API (Exemplo)

API simples em Node.js/Express para demonstrar uma rota de transação entre contas.

Instalação:

```powershell
cd e:\Estudo\bank-api-node
npm install
npm start
```

Configurar MongoDB

- Edite `src/config.js` e substitua `<YOUR_MONGO_URI_HERE>` pela sua string de conexão do MongoDB (ou configure `MONGO_URI` como variável de ambiente).
- Opcional: defina `MONGO_DB_NAME` para alterar o nome do banco.

Observação: o servidor falhará ao iniciar se a string de conexão não estiver configurada.

Endpoint:

- `POST /transactions`
  - Headers:
    - `Content-Type: application/json`
    - (opcional) `x-user-account-id`: id da conta origem (simula usuário logado)
  - Body JSON:
    - `toAccountId`: string (id da conta destino)
    - `amount`: número (valor a transferir, > 0)

Exemplo curl (PowerShell):

```powershell
$body = @{ toAccountId = "2"; amount = 50 } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/transactions -Headers @{ 'x-user-account-id' = '1' } -Body $body -ContentType 'application/json'
```

Notas:
- Este é um exemplo educativo com armazenamento em memória. Reiniciar o servidor restaura os saldos.
- Não usar em produção sem adicionar persistência, autenticação e validações adicionais.

Histórico de transações

- `GET /transactions?accountId=<id>`: retorna transações onde a conta é origem ou destino. Se `accountId` não for informado, usa a conta do usuário autenticado (header `x-user-account-id`).
- `GET /accounts/:id/transactions`: retorna transações para a conta `:id`.

Exemplo: listar histórico da conta 1

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/transactions?accountId=1"
```

Exemplo: listar histórico usando usuário autenticado simulado

```powershell
Invoke-RestMethod -Method Get -Uri http://localhost:3000/transactions -Headers @{ 'x-user-account-id' = '1' }
```
