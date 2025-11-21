# 👤 Como Criar Primeiro Usuário Admin

## 🚀 Método Rápido (Via Terminal)

### Opção 1: cURL (Recomendado)

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@nexus.ai",
    "password": "Admin123!",
    "name": "Administrador",
    "companyName": "Nexus.ai"
  }'
```

**Resposta esperada:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid-aqui",
      "email": "admin@nexus.ai",
      "name": "Administrador",
      "role": "CLIENT",
      "company": {
        "id": "uuid-aqui",
        "name": "Nexus.ai"
      }
    },
    "token": "jwt-token-aqui"
  }
}
```

### Opção 2: Via Dashboard (Depois de ter um usuário)

1. Acesse: http://localhost:3000
2. Faça login
3. Vá em "Configurações" > "Usuários"
4. Clique em "Novo Usuário"

---

## 📝 Personalizar Dados

Você pode mudar os dados do usuário:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu@email.com",
    "password": "SuaSenhaSegura123!",
    "name": "Seu Nome",
    "companyName": "Nome da Sua Empresa"
  }'
```

**Importante:**
- Email deve ser único
- Senha deve ter pelo menos 8 caracteres
- Recomendado: usar senha forte (maiúsculas, minúsculas, números, símbolos)

---

## 🔐 Fazer Login

Depois de criar o usuário:

1. **Acesse:** http://localhost:3000
2. **Faça login com:**
   - Email: `admin@nexus.ai` (ou o email que você usou)
   - Senha: `Admin123!` (ou a senha que você definiu)

---

## 🛠️ Verificar Usuário Criado

### Via API

```bash
# Primeiro, faça login para obter o token
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nexus.ai","password":"Admin123!"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])")

# Ver seu perfil
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Via Prisma Studio (Interface Visual)

```bash
cd backend
npm run prisma:studio
```

Abre em: http://localhost:5555

Navegue até a tabela `users` para ver todos os usuários.

---

## 🔄 Criar Mais Usuários

### Via API (Recomendado)

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendedor@nexus.ai",
    "password": "Vendedor123!",
    "name": "Vendedor",
    "companyName": "Nexus.ai"
  }'
```

**Nota:** Se a empresa já existe, o novo usuário será vinculado à empresa existente.

### Via Dashboard

1. Faça login como admin
2. Vá em "Configurações" > "Usuários"
3. Clique em "Novo Usuário"
4. Preencha os dados

---

## 👥 Tipos de Usuário (Roles)

Atualmente, o sistema tem 3 tipos:

1. **ADMIN** - Acesso total ao sistema
2. **CLIENT** - Cliente (padrão para novos usuários)
3. **USER** - Usuário comum

**Para mudar o role de um usuário:**

```bash
# Via Prisma Studio (mais fácil)
npm run prisma:studio

# Ou via código (precisa implementar endpoint)
```

---

## 🐛 Troubleshooting

### Erro: "User already exists"

**Solução:** O email já está cadastrado. Use outro email ou faça login.

```bash
# Verificar se usuário existe
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nexus.ai","password":"Admin123!"}'
```

### Erro: "Invalid credentials"

**Solução:** Verifique se o email e senha estão corretos.

### Erro: "Database connection failed"

**Solução:** Verifique se o PostgreSQL está rodando.

```bash
# Verificar PostgreSQL
psql -U $(whoami) -d nexus_sales_os -c "SELECT 1;"
```

---

## 📚 Próximos Passos

Depois de criar o usuário:

1. ✅ **Fazer Login** no dashboard
2. ✅ **Explorar** as funcionalidades
3. ✅ **Criar um Lead** de teste
4. ✅ **Configurar Integrações** (CRM, etc.)
5. ✅ **Personalizar** para seu nicho

---

## 💡 Dicas

- **Primeiro usuário:** Use um email que você realmente usa
- **Senha forte:** Use pelo menos 12 caracteres, com maiúsculas, minúsculas, números e símbolos
- **Backup:** Anote as credenciais em local seguro
- **Múltiplos usuários:** Crie usuários diferentes para diferentes funções (admin, vendedor, gestor)

---

**Última atualização:** Novembro 2024

