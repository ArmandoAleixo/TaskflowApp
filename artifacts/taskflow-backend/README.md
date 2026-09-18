# TaskFlow Backend

## Arquitetura atual

- Node.js + Express para API REST
- JWT para autenticação segura
- bcryptjs para hash de senha
- Mongoose para ORM (Object-Relational Mapping) com MongoDB
- Pino para logging estruturado
- MongoDB como banco de dados

## Stack Tecnológico

- **API**: Express 5
- **DB**: MongoDB + Mongoose
- **Autenticação**: JWT (JSON Web Tokens)
- **Hash de Senha**: bcryptjs
- **Logging**: Pino
- **Config**: dotenv para variáveis de ambiente

## Estrutura de pastas

```
artifacts/taskflow-backend/
  src/
    app.ts
    index.ts
    config/
      env.ts              # Centraliza variáveis de ambiente
    lib/
      logger.ts
      db.ts               # Conexão e config do MongoDB
    middleware/
      auth.ts             # Middleware de autenticação JWT
    models/
      user.ts             # Schema e model de usuário
      task.ts             # Schema e model de tarefa
    routes/
      health.ts
      auth.ts
      tasks.ts
      index.ts
    services/
      authService.ts      # Lógica de autenticação (hash, JWT, verificação)
      userService.ts      # Serviços de usuário (create, findByEmail, etc)
      taskService.ts      # Serviços de tarefa (CRUD, filtros, etc)
```

## Camadas da Arquitetura

- **Routes**: Endpoints REST que recebem requests e chamam controllers/services
- **Controllers**: Lógica de HTTP (dentro das routes)
- **Services**: Regras de negócio (autenticação, validação, CRUD)
- **Models**: Schemas de dados (User, Task)
- **Middleware**: Autenticação, logging, validação
- **Config**: Variáveis de ambiente centralizadas
- **Lib**: Utilidades (logger, conexão DB)

## Recursos implementados

### Autenticação
- Registro de usuário (`POST /api/auth/register`)
- Login (`POST /api/auth/login`)
- JWT para sessões autenticadas
- Hash de senha com bcryptjs

### Gerenciamento de Tarefas
- Criação de tarefa (`POST /api/tasks`)
- Listagem de tarefas (`GET /api/tasks`)
- Atualização de tarefa (`PATCH /api/tasks/:id`)
- Exclusão de tarefa (`DELETE /api/tasks/:id`)
- Detalhes de tarefa (`GET /api/tasks/:id`)
- Filtragem por status e prioridade em `GET /api/tasks?status=pending&priority=high`

### Validação
- Validação manual de inputs em routes
- Validação de email, senha, título, descrição
- Tratamento de erros estruturado

### Segurança
- Hash de senha com bcryptjs (salt rounds: 10)
- Middleware de autenticação JWT em todas as rotas de tarefas
- Isolamento de tarefas por usuário (userId)
- Validação de autorização (usuário só acessa suas próprias tarefas)

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz de `artifacts/taskflow-backend` com:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=sua-chave-secreta-aqui
MONGODB_URI=mongodb://localhost:27017/taskflow
```

Para MongoDB remoto (ex: MongoDB Atlas):
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskflow?retryWrites=true&w=majority
```

## Como iniciar

### 1. Instalar dependências
```bash
cd artifacts/taskflow-backend
pnpm install
```

### 2. Verificar MongoDB
Certifique-se de que MongoDB está rodando:
```bash
# Local
mongod

# Ou se usar MongoDB Atlas, atualize MONGODB_URI no .env
```

### 3. Executar em desenvolvimento
```bash
pnpm run dev
```

O servidor expõe:
- `/api/auth/register` - POST para registro
- `/api/auth/login` - POST para login
- `/api/tasks` - GET, POST, PATCH, DELETE para gerenciar tarefas

### 4. Testar com Postman/Insomnia

**1. Registro**
```
POST http://localhost:3000/api/auth/register
Body (JSON):
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}
```

**2. Login**
```
POST http://localhost:3000/api/auth/login
Body (JSON):
{
  "email": "joao@example.com",
  "password": "senha123"
}
Response:
{
  "user": { "id": "...", "email": "...", "name": "..." },
  "token": "eyJhbGc..."
}
```

**3. Criar Tarefa (requer token)**
```
POST http://localhost:3000/api/tasks
Headers: Authorization: Bearer <token>
Body (JSON):
{
  "title": "Estudar Express",
  "description": "Aprender middlewares e rotas",
  "priority": "high",
  "status": "pending"
}
```

**4. Listar Tarefas (requer token)**
```
GET http://localhost:3000/api/tasks
Headers: Authorization: Bearer <token>

# Com filtros
GET http://localhost:3000/api/tasks?status=pending&priority=high
Headers: Authorization: Bearer <token>
```

**5. Atualizar Tarefa (requer token)**
```
PATCH http://localhost:3000/api/tasks/<id>
Headers: Authorization: Bearer <token>
Body (JSON):
{
  "status": "in_progress"
}
```

**6. Deletar Tarefa (requer token)**
```
DELETE http://localhost:3000/api/tasks/<id>
Headers: Authorization: Bearer <token>
```

## Fluxo de Autenticação

1. **Registro**: usuário envia `email`, `name`, `password` → bcryptjs faz hash → Mongoose salva no MongoDB
2. **Login**: usuário envia `email`, `password` → bcryptjs compara com hash → JWT gera token (7 dias de validade)
3. **Requisição autenticada**: cliente envia `Authorization: Bearer <token>` → middleware valida JWT → acesso liberado

## Tratamento de Erros

- 400: Validação falhou (campo obrigatório ausente, email inválido, etc)
- 401: Unauthorized (token inválido, credenciais erradas)
- 404: Recurso não encontrado
- 409: Conflito (email já registrado)
- 500: Erro interno do servidor

## Próximos Passos (Fase 2)

- Testes unitários com Jest
- Testes de integração
- Documentação OpenAPI/Swagger
- CI/CD com GitHub Actions
- Deploy em produção
- Integração com frontend em React Native

