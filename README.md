# Nexus Sales OS

> Sistema Operacional de Vendas: A máquina que transforma tráfego em vendas qualificadas

## 🎯 O Que É?

**Nexus Sales OS** é uma infraestrutura de inteligência comercial pré-moldada que automatiza todo o processo de captura, qualificação e distribuição de leads.

### O Problema Que Resolvemos

Empresas que investem em tráfego pago (Facebook Ads, Google Ads) perdem 40% do tempo do time comercial com:
- Leads desqualificados
- Preenchimento manual de CRM
- Pesquisa manual de informações (CNPJ, cargo, faturamento)
- Leads perdidos por falta de organização

### A Solução

Uma "Máquina de Vendas Autônoma" que:
1. **Captura** leads de múltiplas fontes (Facebook, Google, LinkedIn, etc.)
2. **Enriquece** dados automaticamente (CNPJ, faturamento, cargo, etc.)
3. **Qualifica** com IA (lead scoring baseado em perfil ideal)
4. **Distribui** para o CRM e time comercial (apenas leads quentes)

## 🏗️ Arquitetura

```
┌─────────────────┐
│  TRÁFEGO PAGO   │
│ (Ads, Landing)  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│         NEXUS SALES OS                  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  Módulo A: Captura               │  │
│  │  (Webhooks, APIs)                │  │
│  └──────────┬───────────────────────┘  │
│             │                           │
│             ▼                           │
│  ┌──────────────────────────────────┐  │
│  │  Módulo B: Enriquecimento        │  │
│  │  (Receita Federal, LinkedIn)     │  │
│  └──────────┬───────────────────────┘  │
│             │                           │
│             ▼                           │
│  ┌──────────────────────────────────┐  │
│  │  Módulo C: IA Triagem            │  │
│  │  (Gemini/GPT - Lead Scoring)     │  │
│  └──────────┬───────────────────────┘  │
│             │                           │
│             ▼                           │
│  ┌──────────────────────────────────┐  │
│  │  Módulo D: Distribuição          │  │
│  │  (CRM, WhatsApp, Notificações)   │  │
│  └──────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│   CRM + TIME    │
│   COMERCIAL     │
└─────────────────┘
```

## 👥 Roles e Permissões

O sistema possui três tipos de usuários:

### ADMIN
- ✅ **Acesso global** a dados de todas as empresas
- ✅ **Filtro de empresa** visível em todas as páginas do dashboard
- ✅ Pode ver, criar e gerenciar dados de qualquer empresa
- ✅ Pode criar outros ADMINs (apenas via API `/api/users`)
- ❌ Não possui `companyId` (acesso global)
- ⚠️ ADMINs só podem ser criados:
  - Via script interno: `npm run create-admin`
  - Por outro ADMIN via API: `POST /api/users` (com role: ADMIN)

### CLIENT
- ✅ Acesso apenas aos dados da própria empresa
- ❌ Não vê filtro de empresa (acessa apenas sua empresa)
- ✅ Gerencia leads, campanhas e integrações da própria empresa

### USER
- ✅ Acesso apenas aos dados da própria empresa
- ❌ Permissões limitadas (depende da configuração)

### Filtro de Empresa (Admin Only)

ADMINs têm acesso a um **filtro de empresa** visível ao lado do título em todas as páginas do dashboard:

- **Dashboard**: Filtra métricas por empresa
- **Leads**: Filtra leads por empresa
- **Analytics**: Filtra análises por empresa
- **Agentes**: Filtra agentes por empresa

**Como usar:**
1. Faça login como ADMIN
2. Em qualquer página, veja o filtro ao lado do título
3. Selecione "Todas as empresas" ou uma empresa específica
4. Os dados são filtrados automaticamente

---

## 📦 Estrutura do Projeto

```
nexus-sales-os/
├── backend/              # API REST (Node.js + TypeScript)
│   ├── src/
│   │   ├── modules/      # Módulos principais
│   │   │   ├── companies/ # Gerenciamento de empresas
│   │   │   ├── users/     # Gerenciamento de usuários
│   │   │   └── ...        # Outros módulos
│   │   ├── integrations/ # Integrações (CRMs, APIs externas)
│   │   ├── services/     # Lógica de negócio
│   │   └── database/     # Models e schemas
│   └── package.json
│
├── dashboard/            # Frontend (Next.js 14+)
│   ├── app/              # App Router
│   │   ├── (auth)/       # Páginas de autenticação
│   │   ├── (dashboard)/  # Páginas do dashboard
│   │   └── api/          # API Routes
│   ├── components/       # Componentes React
│   │   ├── company-filter.tsx  # Filtro de empresa (Admin)
│   │   └── page-header.tsx     # Header com filtro
│   └── package.json
│
├── n8n-workflows/        # Templates de workflows
│   ├── lead-capture/     # Captura de leads
│   ├── enrichment/       # Enriquecimento de dados
│   ├── ai-scoring/       # Qualificação com IA
│   └── crm-integration/  # Integração com CRMs
│
├── database/             # Schemas e migrations
│   ├── migrations/
│   └── schemas/
│
├── docs/                 # Documentação
│   ├── setup/            # Guia de instalação
│   ├── onboarding/       # Onboarding de clientes
│   └── api/              # Documentação da API
│
└── scripts/              # Scripts de utilidade
```

## 🚀 Stack Tecnológica

### Backend
- **Node.js** + **TypeScript**
- **Express** (API REST)
- **PostgreSQL** (Database)
- **Prisma** (ORM)
- **Bull** (Job Queue para processamento assíncrono)

### Frontend
- **Next.js 14+** (React Framework)
- **TypeScript**
- **Tailwind CSS** (Styling)
- **Shadcn/ui** (Componentes)
- **Recharts** (Analytics/Gráficos)

### Integrações
- **n8n** (Orquestração de workflows)
- **APIs Externas:**
  - ReceitaWS (Dados de CNPJ)
  - Google Gemini / OpenAI (IA)
  - Meta Business API (Facebook/Instagram Ads)
  - Google Ads API
  - LinkedIn API
- **CRMs:**
  - Pipedrive
  - RD Station
  - HubSpot
  - Salesforce

### Infraestrutura
- **AWS** ou **Hostinger** (Hosting)
- **Docker** (Containerização)
- **GitHub Actions** (CI/CD)

## 🎯 Nichos-Alvo

### 1. Energia Solar ⭐ (Principal)
- **Ticket:** R$ 20k - R$ 100k+
- **Dor:** Muitos leads curiosos, precisam qualificar (telhado próprio, conta de luz alta)
- **ROI:** Recuperar 2 vendas/mês = R$ 60k extra

### 2. Consultorias B2B
- **Dor:** Precisa enriquecer dados (CNPJ, faturamento) antes de contato
- **Solução:** Enriquecimento automático + qualificação por perfil

### 3. Imobiliárias Alto Padrão
- **Dor:** Corretores perdem tempo com leads sem renda compatível
- **Solução:** Qualificação por perfil financeiro

### 4. SaaS B2B
- **Dor:** Leads de múltiplas fontes, precisa qualificar por fit
- **Solução:** Enriquecimento + lead scoring inteligente

## 💰 Modelo de Precificação

### Setup Fee (Implantação)
**R$ 15.000 - R$ 30.000** (pagamento único)

**Inclui:**
- Configuração completa da infraestrutura
- Integração com fontes de leads (Facebook, Google, etc.)
- Integração com CRM do cliente
- Configuração de regras de qualificação (IA)
- Treinamento da equipe
- **Entrega:** 30-45 dias

### Plano de Continuidade Operacional
**R$ 2.000 - R$ 3.000/mês** (recorrência)

**Inclui:**
- Hospedagem da infraestrutura
- Monitoramento 24/7
- Atualizações e melhorias
- Suporte técnico
- Ajustes finos na IA
- Relatórios mensais de performance

## 📊 ROI para o Cliente

### Exemplo: Empresa de Energia Solar

**Situação Atual:**
- Investimento em tráfego: R$ 10.000/mês
- Leads gerados: 100/mês
- Leads qualificados manualmente: 20
- Vendas fechadas: 5
- Ticket médio: R$ 30.000
- Receita: R$ 150.000/mês

**Com Nexus Sales OS:**
- Investimento em tráfego: R$ 10.000/mês (mesmo)
- Leads gerados: 100/mês (mesmo)
- Leads qualificados automaticamente: 25 (+5 por melhor qualificação)
- Vendas fechadas: 7 (+2 por melhor gestão)
- Ticket médio: R$ 30.000
- Receita: R$ 210.000/mês

**Ganho:** +R$ 60.000/mês  
**Investimento:** R$ 25.000 (setup) + R$ 2.500/mês  
**ROI:** Se paga em menos de 1 mês

## 🛠️ Instalação e Setup

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+
- Docker (opcional, mas recomendado)
- n8n (instância própria ou cloud)

### Fluxo Recomendado de Setup

1. **Instale as dependências** (veja Quick Start acima)
2. **Configure o `.env`** com suas credenciais
3. **Rode as migrations:**
   ```bash
   cd backend
   npm run migrate
   ```
4. **Crie um usuário ADMIN:**
   ```bash
   cd backend
   npm run create-admin
   ```
5. **(Opcional) Popule com dados fictícios:**
   ```bash
   cd backend
   npm run seed
   ```
6. **Inicie os serviços:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Dashboard
   cd dashboard
   npm run dev
   ```
7. **Acesse o dashboard:**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:3001`

### Configuração n8n

```bash
cd n8n-workflows
# Importe os workflows para sua instância n8n
```

Veja a [documentação completa de setup](./docs/setup/README.md) para instruções detalhadas.

---

## 🌱 Seed de Dados Fictícios (Empresas de Teste)

Para popular o banco de dados com dados fictícios realistas e simular uma empresa cheia de dados:

### O que o script cria:

- ✅ **1 Empresa** fictícia (TechSolutions Brasil)
- ✅ **6 Usuários** (1 CEO, 5 usuários regulares com roles CLIENT/USER)
- ⚠️ **ADMIN não é criado** via seed (veja abaixo como criar admin)
- ✅ **5 Integrações** (RD Station, Facebook Ads, Google Ads, Typeform, WhatsApp)
- ✅ **6 Campanhas** ativas
- ✅ **150 Leads** com diferentes statuses e dados enriquecidos
- ✅ **Múltiplas Atividades** para cada lead (timeline completa)
- ✅ **6 Tags** de leads
- ✅ **4 Agentes** (IA Gemini, Automação, Scoring, Chatbot)
- ✅ **91 dias de métricas diárias** (últimos 3 meses)
- ✅ **50 logs do sistema**

### Como executar:

```bash
# Entre na pasta backend
cd backend

# Execute o script de seed
npm run seed
```

**Ou via Docker:**

```bash
docker-compose exec backend npm run seed
```

### ⚠️ Importante:

1. **Rode as migrations primeiro!** O script verifica automaticamente se as migrations foram aplicadas.
   ```bash
   cd backend
   npm run migrate
   npm run seed
   ```

2. **Credenciais após o seed:**
   - Você pode fazer login com qualquer usuário criado pela empresa fictícia
   - Exemplo: `ceo@techsolutions.com` / `Senha123!`
   - ⚠️ **ADMINs não são criados pelo seed** - veja abaixo como criar um admin

3. **O script não limpa dados existentes** - ele apenas adiciona novos dados ao banco.

📖 Veja a [documentação completa do seed](./backend/src/scripts/README.md) para mais detalhes e opções de personalização.

---

## 🔐 Criar Usuário ADMIN

**IMPORTANTE:** ADMINs só devem ser criados pela equipe interna. O registro público (`/api/auth/register`) **nunca** cria usuários com role ADMIN.

### Características do ADMIN:

- ✅ **Acesso global** a todas as empresas do sistema
- ✅ **Filtro de empresa** visível em todas as páginas do dashboard
- ✅ Pode ver, editar e gerenciar dados de qualquer empresa
- ✅ Pode criar outros ADMINs via API
- ❌ **Não possui `companyId`** (acesso global)
- ⚠️ **Apenas outros ADMINs** podem criar/editar ADMINs

### Como criar um ADMIN:

#### Opção 1: Via npm script (Recomendado)

```bash
# Entre na pasta backend
cd backend

# Execute o script interativo
npm run create-admin
```

O script vai pedir:
- Email do admin
- Senha
- Nome (opcional)

#### Opção 2: Via linha de comando com argumentos

```bash
cd backend
npx tsx src/scripts/create-admin.ts <email> <senha> <nome>
```

Exemplo:
```bash
npx tsx src/scripts/create-admin.ts admin@nexus.ai MinhaSenhaSegura123! "Admin Nexus"
```

#### Opção 3: Via variáveis de ambiente

```bash
cd backend
ADMIN_EMAIL=admin@nexus.ai ADMIN_PASSWORD=SenhaSegura123! ADMIN_NAME="Admin Nexus" npm run create-admin
```

### Login após criar ADMIN:

1. Acesse o dashboard: `http://localhost:3000/login`
2. Use as credenciais que você criou
3. Como ADMIN, você verá:
   - **Filtro de empresa** ao lado do título em todas as páginas
   - **Painel Admin** no menu lateral (ícone de escudo)
   - Acesso para ver/editar contas de todas as empresas

### Empresa Nexus (Especial para Admins):

- A empresa "Nexus" é tratada de forma especial no sistema
- ADMINs da empresa Nexus **não podem ter o role alterado**
- ADMINs da Nexus **não podem ser deletados**
- ADMINs sem `companyId` também aparecem quando você visualiza a empresa Nexus

📖 Veja a [documentação completa](./backend/src/scripts/README.md) para mais detalhes.

---

## 📖 Documentação

- [Guia de Instalação](./docs/setup/README.md)
- [Onboarding de Clientes](./docs/onboarding/README.md)
- [Documentação da API](./docs/api/README.md)
- [Workflows n8n](./docs/workflows/README.md)
- [Integrações](./docs/integrations/README.md)

## 🎯 Roadmap

### MVP (60 dias) - Q1 2025
- [x] Estrutura base do projeto
- [ ] Módulo A: Captura (webhooks básicos)
- [ ] Módulo B: Enriquecimento (ReceitaWS + 2 APIs)
- [ ] Módulo C: IA Triagem (Gemini + regras básicas)
- [ ] Módulo D: Integração com 1 CRM (Pipedrive)
- [ ] Dashboard básico (métricas principais)
- [ ] 3-5 clientes beta

### Produto Completo (90 dias) - Q2 2025
- [ ] Todas as integrações de captura (Facebook, Google, LinkedIn)
- [ ] Integrações com 4 CRMs principais
- [ ] Dashboard completo com analytics avançados
- [ ] Documentação completa
- [ ] Processo de onboarding padronizado
- [ ] 10+ clientes ativos

### Escala (180 dias) - Q3 2025
- [ ] Portal do cliente (self-service)
- [ ] Templates por nicho (Energia Solar, B2B, etc.)
- [ ] API pública
- [ ] Programa de parceiros
- [ ] 20+ clientes ativos
- [ ] MRR: R$ 40.000+

## 📈 Métricas de Sucesso

### Para o Cliente
- 📈 Aumento de vendas (receita mensal)
- ⏱️ Redução de tempo do time comercial
- 🎯 Taxa de qualificação de leads
- 💰 ROI do investimento

### Para a Nexus.ai
- 👥 Número de clientes ativos
- 💵 MRR (Monthly Recurring Revenue)
- 📊 Taxa de churn
- ⚡ Tempo médio de onboarding
- 🔄 Taxa de expansão (upsell)

## 🤝 Contato

**Nexus.ai**  
Site: [n8nexus.com.br](https://n8nexus.com.br)  
Produto: Nexus Sales OS

---

**Versão:** 1.0.0  
**Última Atualização:** Novembro 2024  
**Status:** Em Desenvolvimento (MVP)

