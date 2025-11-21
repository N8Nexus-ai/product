# 🚀 Como Iniciar Localmente - Nexus Sales OS

Guia passo a passo para rodar o projeto na sua máquina.

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- ✅ **Node.js 18+** ([Download](https://nodejs.org/))
- ✅ **Docker & Docker Compose** ([Download](https://www.docker.com/))
- ✅ **Git** (já deve ter)

**Verificar instalações:**
```bash
node --version  # Deve ser 18 ou superior
docker --version
docker-compose --version
```

---

## ⚡ Método Rápido (Docker - Recomendado)

### Passo 1: Clonar o Repositório

```bash
# Se ainda não clonou
git clone https://github.com/N8Nexus-ai/product.git
cd product
```

### Passo 2: Criar Arquivo .env

```bash
# Criar arquivo .env na raiz do projeto
touch .env
```

Edite o `.env` e adicione o mínimo necessário:

```env
# Backend
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/nexus_sales_os
JWT_SECRET=seu-secret-super-seguro-minimo-32-caracteres-mude-isso

# Redis
REDIS_URL=redis://redis:6379

# n8n
N8N_URL=http://localhost:5678
N8N_API_KEY=

# AI (obtenha em https://makersuite.google.com/)
GEMINI_API_KEY=sua-gemini-api-key-aqui

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**⚠️ IMPORTANTE:** 
- Mude o `JWT_SECRET` para algo seguro (32+ caracteres)
- Obtenha uma API key do Gemini (gratuita): https://makersuite.google.com/

### Passo 3: Iniciar Todos os Serviços

```bash
# Iniciar PostgreSQL, Redis, n8n, Backend e Dashboard
docker-compose up -d

# Aguardar 30-60 segundos para tudo iniciar
# Verificar logs
docker-compose logs -f
```

### Passo 4: Configurar Banco de Dados

```bash
# Rodar migrations (cria todas as tabelas)
docker-compose exec backend npm run migrate
```

Você deve ver:
```
✅ Database migrated successfully
```

### Passo 5: Criar Primeiro Usuário

```bash
# Criar usuário admin
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@nexus.ai",
    "password": "Admin123!",
    "name": "Administrador",
    "companyName": "Nexus.ai"
  }'
```

**Copie o `token` retornado!** Você vai precisar dele.

### Passo 6: Acessar o Sistema

**Dashboard:**
- URL: http://localhost:3000
- Login com: `admin@nexus.ai` / `Admin123!`

**API Backend:**
- URL: http://localhost:3001
- Health: http://localhost:3001/health

**n8n:**
- URL: http://localhost:5678
- Login: `admin` / `changeme` (mude depois!)

---

## 🔧 Método Manual (Sem Docker)

Se preferir rodar sem Docker:

### Passo 1: Instalar PostgreSQL Localmente

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
- Download: https://www.postgresql.org/download/windows/

### Passo 2: Criar Database

```bash
# Acessar PostgreSQL
psql -U postgres

# Criar database
CREATE DATABASE nexus_sales_os;

# Sair
\q
```

### Passo 3: Instalar Redis (Opcional)

**macOS:**
```bash
brew install redis
brew services start redis
```

**Linux:**
```bash
sudo apt install redis-server
sudo systemctl start redis
```

### Passo 4: Configurar Backend

```bash
cd backend

# Instalar dependências
npm install

# Criar .env
cat > .env << EOF
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:sua_senha@localhost:5432/nexus_sales_os
JWT_SECRET=seu-secret-super-seguro-minimo-32-caracteres
REDIS_URL=redis://localhost:6379
GEMINI_API_KEY=sua-gemini-api-key
EOF

# Gerar Prisma Client
npm run prisma:generate

# Rodar migrations
npm run migrate

# Iniciar backend
npm run dev
```

Backend rodando em: http://localhost:3001

### Passo 5: Configurar Dashboard

```bash
# Em outro terminal
cd dashboard

# Instalar dependências
npm install

# Criar .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local

# Iniciar dashboard
npm run dev
```

Dashboard rodando em: http://localhost:3000

---

## ✅ Verificar se Está Funcionando

### 1. Testar Backend

```bash
# Health check
curl http://localhost:3001/health

# Deve retornar:
# {"status":"ok","timestamp":"...","environment":"development"}
```

### 2. Testar Dashboard

Abra: http://localhost:3000

Você deve ver a tela de login.

### 3. Criar um Lead de Teste

```bash
# Primeiro, faça login e copie o token
TOKEN="seu-token-jwt-aqui"

# Criar lead
curl -X POST http://localhost:3001/api/leads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "João Teste",
    "email": "joao@teste.com",
    "phone": "11999999999",
    "message": "Quero saber mais",
    "source": "test"
  }'
```

### 4. Ver Lead no Dashboard

1. Acesse: http://localhost:3000/dashboard/leads
2. Você deve ver o lead criado!

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to database"

**Solução:**
```bash
# Verificar se PostgreSQL está rodando
docker-compose ps postgres

# Ou localmente
psql -U postgres -c "SELECT 1;"

# Verificar DATABASE_URL no .env
cat .env | grep DATABASE_URL
```

### Erro: "Port 3001 already in use"

**Solução:**
```bash
# Ver o que está usando a porta
lsof -i :3001

# Matar o processo ou mudar a porta no .env
PORT=3002
```

### Erro: "Module not found"

**Solução:**
```bash
# Reinstalar dependências
cd backend && rm -rf node_modules && npm install
cd ../dashboard && rm -rf node_modules && npm install
```

### Erro: "Prisma Client not generated"

**Solução:**
```bash
cd backend
npm run prisma:generate
```

### Docker não inicia

**Solução:**
```bash
# Ver logs
docker-compose logs

# Reiniciar tudo
docker-compose down
docker-compose up -d

# Se persistir, recriar volumes
docker-compose down -v
docker-compose up -d
```

---

## 📊 Comandos Úteis

### Docker

```bash
# Ver status de todos os serviços
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f

# Parar tudo
docker-compose stop

# Parar e remover containers
docker-compose down

# Reiniciar um serviço específico
docker-compose restart backend

# Acessar shell do container
docker-compose exec backend sh
docker-compose exec postgres psql -U postgres -d nexus_sales_os
```

### Backend

```bash
# Ver logs
docker-compose logs -f backend

# Rodar migrations
docker-compose exec backend npm run migrate

# Acessar Prisma Studio (interface visual do banco)
docker-compose exec backend npm run prisma:studio
# Abre em: http://localhost:5555
```

### Dashboard

```bash
# Ver logs
docker-compose logs -f dashboard

# Rebuild
docker-compose build dashboard
docker-compose up -d dashboard
```

---

## 🎯 Próximos Passos

Agora que está rodando localmente:

1. ✅ **Explorar o Dashboard**
   - Acesse: http://localhost:3000
   - Crie alguns leads
   - Veja as métricas

2. ✅ **Testar Integrações**
   - Configure um CRM (Pipedrive, RD Station)
   - Teste o envio de leads

3. ✅ **Configurar n8n**
   - Acesse: http://localhost:5678
   - Importe os workflows
   - Configure webhooks

4. ✅ **Customizar para Seu Nicho**
   - Ajuste regras de qualificação
   - Configure prompt da IA
   - Personalize dashboard

---

## 📚 Documentação Adicional

- [Guia Completo de Setup](./docs/setup/README.md)
- [PostgreSQL Setup](./docs/POSTGRESQL_SETUP.md)
- [Getting Started](./GETTING_STARTED.md)

---

## 💬 Precisa de Ajuda?

- **GitHub Issues:** https://github.com/N8Nexus-ai/product/issues
- **Documentação:** [docs/](./docs/)

---

**Pronto!** Seu Nexus Sales OS está rodando localmente! 🎉

