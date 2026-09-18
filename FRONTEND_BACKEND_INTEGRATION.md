# 🔗 Guia de Integração Frontend-Backend - TaskFlow

## ✅ Status Atual

**Backend** ✓
- Express.js rodando na porta **3000**
- MongoDB configurado
- CORS habilitado para aceitar requisições do frontend

**Frontend** ✓
- React Native com Expo
- AuthContext preparado para chamar API

## 🚀 Como Executar

### 1. Iniciar o Backend

```bash
cd artifacts/taskflow-backend
pnpm install
pnpm dev
```

Você deve ver:
```
🚀 Server listening on port 3000
```

### 2. Iniciar o Frontend

Em outro terminal:

```bash
cd artifacts/taskflow-frontend
pnpm install
pnpm dev
```

Isso iniciará o Expo em modo LAN. No Expo Go, escaneie o QR code com endereço `exp://192.168.x.x:8081` ou use a opção exibida no terminal.

Se o celular não conseguir acessar a rede local, tente:

```bash
pnpm run dev:tunnel
```

### 3. Testar a Integração

#### **Test 1: Criar uma nova conta**
1. Na tela inicial, clique em "Criar conta"
2. Preencha:
   - Nome: `João Silva`
   - Email: `joao@example.com`
   - Senha: `senha123`
   - Confirmar Senha: `senha123`
3. Clique em "Criar Conta"

**Esperado:**
- Usuário é criado no MongoDB
- Token JWT é retornado
- Você é redirecionado para o Dashboard

#### **Test 2: Fazer login**
1. Na tela de login, preencha:
   - Email: `joao@example.com`
   - Senha: `senha123`
2. Clique em "Entrar"

**Esperado:**
- Você recebe um token JWT
- É redirecionado para o Dashboard
- Seus dados de usuário são salvos no AsyncStorage

## 📱 Testar em Dispositivo Real/Emulador

Se o frontend está em um emulador/dispositivo diferente da máquina que roda o backend:

1. Descubra o IP da sua máquina:
   ```bash
   ipconfig  # Windows
   ifconfig  # Mac/Linux
   ```
   Procure por algo como `192.168.x.x`

2. Edite o arquivo `.env` do frontend:
   ```
   EXPO_PUBLIC_API_URL=http://192.168.x.x:3000/api
   ```

3. Reinicie o frontend

## 🔍 Debug

### Ver logs do Backend
```bash
pnpm dev  # Mostra logs com pino
```

### Ver requisições do Frontend
- Abra o DevTools do Expo
- Vá para "Logs"
- Qualquer erro de rede será exibido

### Testar API manualmente
```bash
# Criar usuário
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"123456"}'

# Fazer login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```
