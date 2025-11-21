# Documentação Nexus Sales OS

Bem-vindo à documentação completa do Nexus Sales OS.

## 📚 Índice

### 🚀 Getting Started
- [Instalação e Setup](./setup/README.md) - Como instalar o sistema
- [Onboarding de Clientes](./onboarding/README.md) - Guia passo a passo para novos clientes
- [Quick Start Guide](./quick-start.md) - Comece em 5 minutos

### 🔧 Configuração
- [Variáveis de Ambiente](./configuration/environment.md)
- [Banco de Dados](./configuration/database.md)
- [n8n Workflows](../n8n-workflows/README.md)

### 🔌 Integrações
- [CRMs](./integrations/crms.md)
  - Pipedrive
  - RD Station
  - HubSpot
  - Salesforce
- [Plataformas de Ads](./integrations/ads-platforms.md)
  - Facebook/Instagram Ads
  - Google Ads
  - LinkedIn Ads
- [Ferramentas de Captura](./integrations/capture-tools.md)
  - Landing Pages
  - Typeform
  - Webhooks Customizados

### 🤖 IA e Automação
- [Enriquecimento de Dados](./ai/enrichment.md)
- [Lead Scoring com IA](./ai/scoring.md)
- [Personalização por Nicho](./ai/customization.md)

### 📊 Analytics
- [Métricas e KPIs](./analytics/metrics.md)
- [Dashboard](./analytics/dashboard.md)
- [Relatórios](./analytics/reports.md)

### 💻 Desenvolvimento
- [Arquitetura](./architecture/README.md)
- [API Reference](./api/README.md)
- [Contribuindo](./contributing.md)

### 🐛 Troubleshooting
- [Problemas Comuns](./troubleshooting/common-issues.md)
- [FAQ](./faq.md)

---

## 🎯 O Que é Nexus Sales OS?

Nexus Sales OS é um **Sistema Operacional de Vendas** que automatiza todo o processo de captura, qualificação e distribuição de leads.

### Como Funciona

```
TRÁFEGO PAGO          NEXUS SALES OS              CRM + TIME
(Ads, Landing)                                    COMERCIAL

    │                      │                           │
    │  1. Captura          │                           │
    ├─────────────────────►│                           │
    │                      │                           │
    │                      │ 2. Enriquecimento         │
    │                      │    (CNPJ, LinkedIn)       │
    │                      │                           │
    │                      │ 3. Qualificação IA        │
    │                      │    (Score 0-100)          │
    │                      │                           │
    │                      │ 4. Distribuição           │
    │                      ├──────────────────────────►│
    │                      │   (Apenas Qualificados)   │
    │                      │                           │
```

### Módulos Principais

#### Módulo A: Captura
- Recebe leads de múltiplas fontes
- Normaliza dados
- Valida campos

#### Módulo B: Enriquecimento
- Consulta ReceitaWS (CNPJ)
- Valida email e telefone
- Busca dados no LinkedIn

#### Módulo C: Qualificação IA
- Analisa lead com Gemini/GPT
- Calcula score (0-100)
- Classifica como Qualificado ou Não

#### Módulo D: Distribuição
- Envia para CRM (Pipedrive, RD, etc.)
- Notifica vendedor
- Cria tarefas automaticamente

---

## 💰 Proposta de Valor

### Para o Cliente

**Antes do Nexus Sales OS:**
- 100 leads/mês
- 40% do tempo perdido com leads ruins
- Vendedor preenche CRM manualmente
- Perdas por desorganização

**Depois do Nexus Sales OS:**
- 100 leads/mês (mesmo volume)
- Apenas leads qualificados chegam ao vendedor
- CRM preenchido automaticamente
- +20% de vendas (leads que seriam perdidos)

**ROI:**
Se o ticket médio é R$ 15.000 e recuperamos 2 vendas/mês:
- Ganho: R$ 30.000/mês
- Investimento: R$ 25.000 (setup) + R$ 2.500/mês
- **Payback: 1 mês**

### Para Sua Empresa (Nexus.ai)

**Modelo de Receita:**
- Setup Fee: R$ 15k-30k (uma vez)
- Recorrência: R$ 2k-3k/mês

**Por Cliente:**
- MRR: R$ 2.500
- LTV (12 meses): R$ 30.000
- Churn esperado: <5%/mês

**Com 20 clientes:**
- MRR: R$ 50.000
- ARR: R$ 600.000

---

## 🎯 Nichos Recomendados

### 1. Energia Solar ⭐
**Por quê:** Ticket alto, gasto alto com tráfego, muitos leads curiosos

**Dores específicas:**
- Lead quer apenas saber o preço
- Não tem telhado próprio
- Conta de luz muito baixa

**Como Nexus resolve:**
- IA qualifica: tem telhado? Conta alta?
- Enriquece: CNPJ, porte da empresa
- Só chega no vendedor quem tem perfil

### 2. Consultorias B2B
**Por quê:** Precisa qualificar CNPJ, faturamento e cargo

**Dores específicas:**
- Perda de tempo pesquisando lead
- Lead não tem perfil (empresa pequena)

**Como Nexus resolve:**
- Enriquecimento automático de CNPJ
- IA verifica perfil ideal
- Vendedor recebe já sabendo tudo

### 3. Imobiliárias Alto Padrão
**Por quê:** Corretor odeia ligar para quem não tem renda

**Dores específicas:**
- Lead sem renda compatível
- Apenas curiosos

**Como Nexus resolve:**
- Enriquecimento: perfil profissional
- IA estima renda
- Qualificação por fit financeiro

### 4. SaaS B2B
**Por quê:** Precisa qualificar empresa (tamanho, setor)

**Dores específicas:**
- Leads de múltiplas fontes
- Difícil qualificar sem contexto

**Como Nexus resolve:**
- Enriquecimento de dados da empresa
- IA qualifica por fit
- Distribuição inteligente

---

## 📊 Métricas de Sucesso

### Para o Cliente

**KPIs Principais:**
- Taxa de Qualificação (% leads qualificados)
- Tempo Economizado (horas/mês)
- Taxa de Conversão (leads → vendas)
- ROI (retorno sobre investimento)

**Metas:**
- Mês 1: Setup completo
- Mês 2: ROI positivo
- Mês 3: +20% vendas

### Para Sua Empresa

**KPIs Principais:**
- Número de clientes ativos
- MRR (receita recorrente mensal)
- Churn rate (% cancelamentos)
- NPS (satisfação do cliente)

**Metas:**
- Mês 6: 10 clientes (MRR: R$ 25k)
- Ano 1: 20 clientes (MRR: R$ 50k)
- Ano 2: 50 clientes (MRR: R$ 125k)

---

## 🛠️ Stack Técnica

### Backend
- **Node.js** + TypeScript
- **Express** (API REST)
- **Prisma** (ORM)
- **PostgreSQL** (Database)
- **Bull** (Job Queue)

### Frontend
- **Next.js 14** (React)
- **TypeScript**
- **Tailwind CSS**
- **Shadcn/ui**
- **Recharts**

### Automação
- **n8n** (Workflow Automation)

### AI
- **Google Gemini** (primário)
- **OpenAI GPT** (fallback)

### Infraestrutura
- **Docker** + Docker Compose
- **AWS** ou **Hostinger**
- **GitHub Actions** (CI/CD)

---

## 📞 Suporte

### Documentação
- Este site: [docs/](.)
- API Reference: [api/README.md](./api/README.md)

### Comunidade
- GitHub Issues: [Issues](https://github.com/nexus-ai/nexus-sales-os/issues)
- Discord: [Join](https://discord.gg/nexus-sales-os)

### Comercial
- Site: [n8nexus.com.br](https://n8nexus.com.br)
- Email: contato@nexus.ai
- WhatsApp: +55 11 99999-9999

---

## 🚀 Comece Agora

1. [Instalar o Sistema](./setup/README.md)
2. [Configurar Primeira Integração](./integrations/crms.md)
3. [Importar Workflows n8n](../n8n-workflows/README.md)
4. [Capturar Primeiro Lead](#teste-rápido)

### Teste Rápido

```bash
# 1. Instalar com Docker
docker-compose up -d

# 2. Capturar um lead de teste
curl -X POST http://localhost:5678/webhook/lead-capture \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Teste",
    "email": "joao@teste.com",
    "phone": "11999999999",
    "source": "test"
  }'

# 3. Ver no dashboard
open http://localhost:3000
```

---

**Última atualização:** Novembro 2024  
**Versão:** 1.0.0  
**Mantido por:** Nexus.ai Team

