# Guia de Instalação - Nexus Sales OS

Este guia completo te ajudará a configurar o Nexus Sales OS do zero.

## 📋 Pré-requisitos

### Software Necessário

- **Node.js 18+** ([Download](https://nodejs.org/))
- **PostgreSQL 14+** ([Download](https://www.postgresql.org/download/))
- **Docker & Docker Compose** (opcional, mas recomendado) ([Download](https://www.docker.com/))
- **n8n** ([Docs](https://docs.n8n.io/hosting/installation/))
- **Git** ([Download](https://git-scm.com/))

### Contas e APIs

Antes de começar, obtenha suas credenciais:

1. **Google Gemini API Key** (ou OpenAI)
   - Acesse: https://makersuite.google.com/
   - Crie uma API key gratuita

2. **CRM** (escolha um):
   - [Pipedrive](https://www.pipedrive.com/) - API Token
   - [RD Station](https://www.rdstation.com/) - OAuth credentials
   - [HubSpot](https://www.hubspot.com/) - API Key

3. **Plataformas de Ads** (opcional):
   - Facebook Business Manager
   - Google Ads
   - LinkedIn Campaign Manager

---

## 🚀 Instalação Rápida (Docker)

### Método Recomendado

```bash
# 1. Clone o repositório
git clone https://github.com/nexus-ai/nexus-sales-os.git
cd nexus-sales-os

# 2. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# 3. Inicie todos os serviços
docker-compose up -d

# 4. Aguarde os serviços iniciarem (30-60 segundos)
docker-compose logs -f

# 5. Rode as migrations do banco
docker-compose exec backend npm run migrate

# 6. Acesse os serviços
# Dashboard: http://localhost:3000
# API: http://localhost:3001
# n8n: http://localhost:5678
```

**Pronto!** 🎉 O Nexus Sales OS está rodando.

---

## 🔧 Instalação Manual (Sem Docker)

### 1. Configurar Banco de Dados

```bash
# Criar database PostgreSQL
createdb nexus_sales_os

# Ou via psql
psql -U postgres
CREATE DATABASE nexus_sales_os;
\q
```

### 2. Configurar Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar .env
cp .env.example .env
# Edite DATABASE_URL e outras variáveis

# Gerar Prisma Client
npm run prisma:generate

# Rodar migrations
npm run migrate

# Iniciar em desenvolvimento
npm run dev

# Ou build para produção
npm run build
npm start
```

O backend estará rodando em: http://localhost:3001

### 3. Configurar Dashboard

```bash
cd dashboard

# Instalar dependências
npm install

# Configurar .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local

# Iniciar em desenvolvimento
npm run dev

# Ou build para produção
npm run build
npm start
```

O dashboard estará em: http://localhost:3000

### 4. Configurar n8n

```bash
# Instalar n8n globalmente
npm install -g n8n

# Ou com Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Acessar: http://localhost:5678
```

---

## ⚙️ Configuração Detalhada

### Variáveis de Ambiente

Edite o arquivo `.env`:

```env
# ======================
# BACKEND CONFIGURATION
# ======================

NODE_ENV=production
PORT=3001
API_URL=https://api.seu-dominio.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/nexus_sales_os

# JWT
JWT_SECRET=seu-secret-super-seguro-aqui-min-32-caracteres

# Redis (para filas)
REDIS_URL=redis://localhost:6379

# ======================
# n8n CONFIGURATION
# ======================

N8N_URL=http://localhost:5678
N8N_API_KEY=sua-api-key-n8n

# ======================
# AI SERVICES
# ======================

# Google Gemini (recomendado)
GEMINI_API_KEY=sua-key-aqui

# OpenAI (alternativa)
OPENAI_API_KEY=sua-key-aqui

# ======================
# DATA ENRICHMENT
# ======================

# ReceitaWS (API pública, sem key necessária)
# Para versão premium: RECEITAWS_API_KEY=sua-key

# LinkedIn (opcional)
LINKEDIN_API_KEY=
LINKEDIN_API_SECRET=

# ======================
# CRM INTEGRATIONS
# ======================

# Pipedrive
PIPEDRIVE_API_TOKEN=sua-token-aqui
PIPEDRIVE_DOMAIN=sua-empresa.pipedrive.com

# RD Station
RD_STATION_CLIENT_ID=seu-client-id
RD_STATION_CLIENT_SECRET=seu-client-secret
RD_STATION_REFRESH_TOKEN=seu-refresh-token

# HubSpot
HUBSPOT_API_KEY=sua-key-aqui

# Salesforce (se usar)
SALESFORCE_CLIENT_ID=
SALESFORCE_CLIENT_SECRET=
SALESFORCE_USERNAME=
SALESFORCE_PASSWORD=

# ======================
# ADS PLATFORMS
# ======================

# Meta (Facebook/Instagram)
META_ACCESS_TOKEN=
META_APP_ID=
META_APP_SECRET=

# Google Ads
GOOGLE_ADS_CLIENT_ID=
GOOGLE_ADS_CLIENT_SECRET=
GOOGLE_ADS_REFRESH_TOKEN=
GOOGLE_ADS_DEVELOPER_TOKEN=

# ======================
# NOTIFICATIONS
# ======================

# WhatsApp Business API
WHATSAPP_API_URL=
WHATSAPP_API_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=

# Email (SendGrid)
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=
EMAIL_FROM=noreply@seu-dominio.com

# ======================
# CLOUD SERVICES
# ======================

# AWS (se usar)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET=

# Sentry (monitoramento)
SENTRY_DSN=

# ======================
# FRONTEND
# ======================

NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Nexus Sales OS
```

---

## 🗄️ Migrations do Banco de Dados

```bash
cd backend

# Ver status das migrations
npm run prisma:studio

# Criar nova migration
npx prisma migrate dev --name nome_da_migration

# Deploy em produção
npm run migrate:deploy

# Reset database (⚠️ CUIDADO - apaga tudo)
npx prisma migrate reset
```

---

## 📦 Importar Workflows n8n

### Método 1: Interface Web

1. Acesse http://localhost:5678
2. Clique em **Workflows** > **Import from file**
3. Selecione os arquivos em `n8n-workflows/`
4. Configure as credenciais
5. Ative os workflows

### Método 2: API

```bash
# Para cada workflow
curl -X POST http://localhost:5678/api/v1/workflows/import \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "file=@n8n-workflows/01-lead-capture.json"
```

---

## 🔐 Criar Primeiro Usuário

```bash
# Via API
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sua-empresa.com",
    "password": "SenhaSegura123!",
    "name": "Administrador",
    "companyName": "Sua Empresa"
  }'

# Copie o token JWT retornado
```

---

## 🧪 Testar a Instalação

### 1. Teste o Backend

```bash
# Health check
curl http://localhost:3001/health

# Resposta esperada:
# {"status":"ok","environment":"production"}
```

### 2. Teste o Dashboard

Acesse: http://localhost:3000/login

Use as credenciais criadas acima.

### 3. Teste a Captura de Lead

```bash
curl -X POST http://localhost:5678/webhook/lead-capture \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Teste",
    "email": "joao@teste.com",
    "phone": "11999999999",
    "source": "test"
  }'
```

Verifique no dashboard se o lead foi criado.

---

## 🌐 Deploy em Produção

### Opção 1: VPS (AWS, DigitalOcean, etc.)

```bash
# 1. Configurar servidor
ssh user@seu-servidor.com

# 2. Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 3. Clonar repositório
git clone https://github.com/nexus-ai/nexus-sales-os.git
cd nexus-sales-os

# 4. Configurar .env para produção
nano .env

# 5. Iniciar serviços
docker-compose -f docker-compose.prod.yml up -d

# 6. Configurar Nginx (reverse proxy)
# Ver: docs/setup/nginx.conf.example
```

### Opção 2: Cloud Platforms

#### Heroku

```bash
heroku create nexus-sales-os-backend
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set NODE_ENV=production
git push heroku main
```

#### Vercel (Dashboard)

```bash
cd dashboard
vercel --prod
```

#### Railway.app

```bash
railway init
railway up
```

---

## 📊 Monitoramento

### Logs

```bash
# Docker
docker-compose logs -f backend
docker-compose logs -f dashboard
docker-compose logs -f n8n

# PM2 (se instalação manual)
pm2 logs nexus-backend
pm2 logs nexus-dashboard
```

### Health Checks

Configure monitoramento em:
- [UptimeRobot](https://uptimerobot.com/)
- [StatusCake](https://www.statuscake.com/)

Endpoints para monitorar:
- Backend: `https://api.seu-dominio.com/health`
- Dashboard: `https://dashboard.seu-dominio.com`
- n8n: `https://n8n.seu-dominio.com`

---

## 🔄 Atualizações

```bash
# Pull latest changes
git pull origin main

# Rebuild containers
docker-compose build
docker-compose up -d

# Run new migrations
docker-compose exec backend npm run migrate:deploy
```

---

## 🐛 Troubleshooting

### Backend não inicia

**Erro:** `Cannot connect to database`

**Solução:**
```bash
# Verifique se PostgreSQL está rodando
docker-compose ps postgres

# Verifique a connection string
echo $DATABASE_URL
```

### n8n não acessa a API

**Erro:** `ECONNREFUSED`

**Solução:**
```bash
# Use o nome do serviço no Docker
# Não: http://localhost:3001
# Sim: http://backend:3001
```

### Dashboard mostra erro 401

**Erro:** `Unauthorized`

**Solução:**
```bash
# Verifique se o token JWT é válido
# Faça login novamente no dashboard
```

---

## 📚 Próximos Passos

1. [Configurar Integrações com CRMs](../integrations/README.md)
2. [Personalizar Workflows para Seu Nicho](../../n8n-workflows/README.md)
3. [Configurar Webhooks de Ads](../integrations/ads-platforms.md)
4. [Treinar IA para Seu Perfil de Cliente](../ai/training.md)

---

## 💬 Suporte

- **Documentação:** [docs/](../)
- **Issues:** [GitHub Issues](https://github.com/nexus-ai/nexus-sales-os/issues)
- **Email:** suporte@nexus.ai

---

**Última atualização:** Novembro 2024  
**Versão:** 1.0.0  
**Autor:** Nexus.ai Team

