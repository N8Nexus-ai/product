# 📊 Status do Projeto

## ❌ Projeto NÃO está rodando

**Motivo:** Docker não está instalado ou não está rodando.

---

## 🔧 Opções para Iniciar

### Opção 1: Instalar Docker (Recomendado - Mais Fácil)

**macOS:**
1. Download: https://www.docker.com/products/docker-desktop/
2. Instalar Docker Desktop
3. Abrir Docker Desktop
4. Aguardar iniciar (ícone na barra de menu)

**Depois de instalar:**
```bash
cd "/Users/marco/Downloads/Automation/Product Nexus"
docker compose up -d
docker compose exec backend npm run migrate
```

**Acessar:**
- Dashboard: http://localhost:3000
- API: http://localhost:3001
- n8n: http://localhost:5678

---

### Opção 2: Rodar Sem Docker (Manual)

**Pré-requisitos:**
- ✅ Node.js 18+ (já tem)
- ⚠️ PostgreSQL instalado localmente
- ⚠️ Redis (opcional)

**Passos:**

1. **Instalar PostgreSQL:**
```bash
# macOS
brew install postgresql@15
brew services start postgresql@15

# Criar database
createdb nexus_sales_os
```

2. **Configurar Backend:**
```bash
cd backend
npm install

# Criar .env
cat > .env << EOF
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://$(whoami)@localhost:5432/nexus_sales_os
JWT_SECRET=$(openssl rand -hex 32)
GEMINI_API_KEY=
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF

# Gerar Prisma Client
npm run prisma:generate

# Rodar migrations
npm run migrate

# Iniciar backend
npm run dev
```

3. **Configurar Dashboard (em outro terminal):**
```bash
cd dashboard
npm install

# Criar .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local

# Iniciar dashboard
npm run dev
```

---

## ✅ Verificar Status

**Com Docker:**
```bash
docker compose ps
```

**Sem Docker:**
```bash
# Backend
curl http://localhost:3001/health

# Dashboard
curl http://localhost:3000
```

---

## 🚀 Próximo Passo

**Recomendação:** Instalar Docker Desktop (mais fácil e rápido).

Depois de instalar, me avise que eu inicio o projeto para você!

