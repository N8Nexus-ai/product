# 🔐 Credenciais do Banco de Dados

## 📊 Configuração Atual

### PostgreSQL Local (Sem Docker)

**Credenciais:**
- **Host:** `localhost`
- **Porta:** `5432`
- **Database:** `nexus_sales_os`
- **Usuário:** `marco` (seu usuário do sistema)
- **Senha:** *(sem senha - autenticação local do macOS)*

**Connection String:**
```
postgresql://marco@localhost:5432/nexus_sales_os
```

**No arquivo `.env` do backend:**
```env
DATABASE_URL=postgresql://marco@localhost:5432/nexus_sales_os
```

---

## 🔍 Como Verificar

### Ver usuário atual do PostgreSQL

```bash
psql -U $(whoami) -d nexus_sales_os -c "SELECT current_user, current_database();"
```

### Testar conexão

```bash
psql -U $(whoami) -d nexus_sales_os -c "SELECT 1;"
```

Se funcionar, a conexão está OK!

---

## 🔧 Se Precisar de Senha

### Configurar senha para PostgreSQL

**1. Definir senha para o usuário:**

```bash
psql -U $(whoami) -d postgres
```

No psql:
```sql
ALTER USER marco WITH PASSWORD 'sua_senha_aqui';
\q
```

**2. Atualizar .env:**

```env
DATABASE_URL=postgresql://marco:sua_senha_aqui@localhost:5432/nexus_sales_os
```

**3. Reiniciar backend:**

```bash
pkill -f "tsx watch"
cd backend
npm run dev
```

---

## 🐳 Se Usar Docker (Alternativa)

Se você instalar Docker depois, as credenciais serão:

**Credenciais Docker:**
- **Host:** `postgres` (dentro do Docker) ou `localhost` (de fora)
- **Porta:** `5432`
- **Database:** `nexus_sales_os`
- **Usuário:** `postgres`
- **Senha:** `postgres` (padrão do docker-compose.yml)

**Connection String (Docker):**
```
postgresql://postgres:postgres@postgres:5432/nexus_sales_os
```

**Connection String (de fora do Docker):**
```
postgresql://postgres:postgres@localhost:5432/nexus_sales_os
```

---

## 📝 Ver Credenciais no Código

### Backend (.env)

```bash
cd backend
cat .env | grep DATABASE_URL
```

### Raiz do Projeto (.env)

```bash
cat .env | grep DATABASE_URL
```

---

## 🔐 Segurança

### ⚠️ IMPORTANTE:

1. **Nunca commite o `.env`** com credenciais reais
2. **Use senhas fortes** em produção
3. **Limite acesso** por IP em produção
4. **Use SSL** em produção

### Em Produção:

```env
# Exemplo de connection string segura
DATABASE_URL=postgresql://usuario:senha_forte@host:5432/nexus_sales_os?sslmode=require
```

---

## 🛠️ Troubleshooting

### Erro: "password authentication failed"

**Solução:**
```bash
# Verificar se usuário existe
psql -U $(whoami) -d postgres -c "\du"

# Se precisar criar senha
psql -U $(whoami) -d postgres
ALTER USER marco WITH PASSWORD 'nova_senha';
```

### Erro: "database does not exist"

**Solução:**
```bash
createdb nexus_sales_os
```

### Erro: "connection refused"

**Solução:**
```bash
# Verificar se PostgreSQL está rodando
brew services list | grep postgresql

# Iniciar se necessário
brew services start postgresql@15
```

---

## 📚 Comandos Úteis

### Acessar banco via psql

```bash
psql -U $(whoami) -d nexus_sales_os
```

### Ver todas as databases

```bash
psql -U $(whoami) -d postgres -c "\l"
```

### Ver todas as tabelas

```bash
psql -U $(whoami) -d nexus_sales_os -c "\dt"
```

### Ver estrutura de uma tabela

```bash
psql -U $(whoami) -d nexus_sales_os -c "\d users"
```

---

## ✅ Resumo

**Configuração Atual:**
- ✅ PostgreSQL local (sem Docker)
- ✅ Usuário: `marco` (seu usuário do sistema)
- ✅ Sem senha (autenticação local)
- ✅ Database: `nexus_sales_os`
- ✅ Porta: `5432`

**Connection String:**
```
postgresql://marco@localhost:5432/nexus_sales_os
```

---

**Última atualização:** Novembro 2024

