# Nexus Sales OS

> Plataforma Completa de Automação e Agentes Inteligentes

## 🎯 O Que É?

**Nexus Sales OS** é uma infraestrutura completa de automação e agentes inteligentes que permite criar, gerenciar e orquestrar processos automatizados em escala empresarial.

### O Problema Que Resolvemos

Empresas perdem tempo e recursos com processos manuais e repetitivos:
- Processamento manual de dados e informações
- Integrações desconectadas entre sistemas
- Falta de automação inteligente para decisões
- Processos que precisam de escala mas dependem de pessoas
- Dificuldade em criar e manter agentes autônomos

### A Solução

Uma **Plataforma de Automação Completa** com:
1. **Agentes Inteligentes** configuráveis para tarefas específicas
2. **Automação de Processos** end-to-end
3. **Integrações Nativas** com CRMs, APIs e sistemas externos
4. **IA Integrada** para análise, decisões e qualificação
5. **Infraestrutura Escalável** pronta para produção

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────┐
│     FONTES DE DADOS/PROCESSOS           │
│  (APIs, Webhooks, CRMs, Formulários)    │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│         NEXUS SALES OS                  │
│   Plataforma de Automação Completa      │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  Camada de Agentes               │  │
│  │  (IA, Processamento, Chatbots)   │  │
│  └──────────┬───────────────────────┘  │
│             │                           │
│             ▼                           │
│  ┌──────────────────────────────────┐  │
│  │  Engine de Automação             │  │
│  │  (Workflows, Orquestração)       │  │
│  └──────────┬───────────────────────┘  │
│             │                           │
│             ▼                           │
│  ┌──────────────────────────────────┐  │
│  │  Camada de Integrações           │  │
│  │  (CRMs, APIs, Sistemas Externos) │  │
│  └──────────┬───────────────────────┘  │
│             │                           │
│             ▼                           │
│  ┌──────────────────────────────────┐  │
│  │  Dashboard & Analytics           │  │
│  │  (Monitoramento, Métricas, Logs) │  │
│  └──────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│   SISTEMAS DESTINO                  │
│  (CRMs, Notificações, Webhooks)     │
└─────────────────────────────────────┘
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

## 🎯 Casos de Uso

### 1. Automação de Vendas e Marketing
- **Captura e qualificação** de leads de múltiplas fontes
- **Enriquecimento automático** de dados (CNPJ, perfis, informações)
- **Distribuição inteligente** para CRMs e times
- **Scoring e priorização** com IA

### 2. Processamento de Dados Inteligente
- **Agentes de IA** para análise e classificação
- **Automação de workflows** complexos
- **Integração entre sistemas** desconectados
- **Transformação e enriquecimento** de dados

### 3. Atendimento e Comunicação
- **Chatbots inteligentes** configuráveis
- **Respostas automáticas** personalizadas
- **Roteamento inteligente** de mensagens
- **Análise de sentimento** e contexto

### 4. Operações e Backend
- **Automação de processos** internos
- **Sincronização de dados** entre sistemas
- **Monitoramento e alertas** automatizados
- **Orquestração de tarefas** complexas

## 💰 Modelo de Precificação

### Setup Fee (Implantação)
**R$ 15.000 - R$ 30.000** (pagamento único)

**Inclui:**
- Configuração completa da infraestrutura
- Criação e configuração de agentes personalizados
- Integração com sistemas do cliente (CRMs, APIs, etc.)
- Configuração de workflows e automações
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

## 📊 Valor Gerado

### Benefícios Principais

**Eficiência Operacional:**
- Redução de 60-80% no tempo gasto em processos manuais
- Automação 24/7 sem necessidade de intervenção humana
- Escalabilidade automática conforme demanda

**Inteligência e Qualidade:**
- Decisões mais precisas com IA integrada
- Qualificação e classificação automática
- Insights e analytics em tempo real

**Economia de Recursos:**
- Menos necessidade de equipe para tarefas repetitivas
- Redução de erros manuais
- Otimização de processos existentes

**Flexibilidade:**
- Agentes configuráveis para cada necessidade
- Integração com qualquer sistema via APIs
- Workflows personalizáveis por cliente

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
- [x] Sistema de agentes configuráveis
- [x] Dashboard de automação e monitoramento
- [ ] Engine de workflows mais robusto
- [ ] Biblioteca de agentes pré-configurados
- [ ] Integrações com principais CRMs e APIs
- [ ] 3-5 clientes beta

### Produto Completo (90 dias) - Q2 2025
- [ ] Marketplace de agentes e automações
- [ ] Editor visual de workflows
- [ ] Integrações com 10+ sistemas populares
- [ ] Dashboard completo com analytics avançados
- [ ] Documentação completa e tutoriais
- [ ] Processo de onboarding padronizado
- [ ] 10+ clientes ativos

### Escala (180 dias) - Q3 2025
- [ ] Portal do cliente (self-service)
- [ ] Templates de automação por vertical
- [ ] API pública para desenvolvedores
- [ ] Programa de parceiros e integradores
- [ ] Agentes de IA mais avançados
- [ ] 20+ clientes ativos
- [ ] MRR: R$ 40.000+

## 📈 Métricas de Sucesso

### Para o Cliente
- 📈 Eficiência operacional (tempo economizado)
- ⏱️ Redução de processos manuais
- 🎯 Automação de tarefas repetitivas
- 💰 ROI do investimento em automação
- 🤖 Número de processos automatizados
- 📊 Qualidade e precisão das automações

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

