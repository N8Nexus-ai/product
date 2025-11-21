# 🚀 Getting Started - Nexus Sales OS

**Bem-vindo!** Este guia te levará do zero ao seu primeiro lead processado em **menos de 30 minutos**.

---

## ⚡ Quick Start (5 minutos)

### Pré-requisitos
- Docker & Docker Compose instalados
- Node.js 18+ (se rodar sem Docker)

### Passo 1: Clone e Configure

```bash
# Clone o repositório
cd /Users/marco/Downloads/Automation/Product\ Nexus

# Copie o arquivo de exemplo de variáveis de ambiente
# (Você precisará criar o .env manualmente, veja abaixo)

# Inicie todos os serviços com Docker
docker-compose up -d

# Aguarde 30-60 segundos para os serviços iniciarem
```

### Passo 2: Configure Variáveis de Ambiente Mínimas

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Backend
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nexus_sales_os
JWT_SECRET=seu-secret-super-seguro-minimo-32-caracteres

# Redis
REDIS_URL=redis://localhost:6379

# n8n
N8N_URL=http://localhost:5678
N8N_API_KEY=

# AI (obtenha uma key gratuita em https://makersuite.google.com/)
GEMINI_API_KEY=sua-gemini-api-key-aqui

# CRM (configure ao menos um)
PIPEDRIVE_API_TOKEN=
PIPEDRIVE_DOMAIN=sua-empresa.pipedrive.com
```

### Passo 3: Inicialize o Banco de Dados

```bash
# Execute as migrations
docker-compose exec backend npm run migrate

# Ou, se rodando localmente:
cd backend
npm run migrate
```

### Passo 4: Crie Seu Primeiro Usuário

```bash
# Via API
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu@email.com",
    "password": "SuaSenhaSegura123!",
    "name": "Seu Nome",
    "companyName": "Sua Empresa"
  }'

# Copie o token JWT retornado
```

### Passo 5: Acesse o Dashboard

1. Abra: http://localhost:3000
2. Faça login com as credenciais criadas
3. Explore o dashboard! 📊

---

## 🌱 Seed de Dados Fictícios (Opcional)

**Quer simular uma empresa cheia de dados para testes ou demonstrações?**

Execute o script de seed que cria:
- ✅ 1 empresa fictícia
- ✅ 7 usuários (admin + usuários)
- ✅ 5 integrações (RD Station, Facebook, Google, Typeform, WhatsApp)
- ✅ 6 campanhas ativas
- ✅ 150 leads com diferentes statuses e dados enriquecidos
- ✅ Atividades completas na timeline de cada lead
- ✅ 6 tags de leads
- ✅ 4 agentes (IA, Automação, Scoring, Chatbot)
- ✅ 91 dias de métricas diárias (últimos 3 meses)
- ✅ 50 logs do sistema

### Como usar:

```bash
# Via npm script (recomendado)
cd backend
npm run seed

# Ou via Docker
docker-compose exec backend npm run seed
```

**Credenciais após o seed:**
- Email: `admin@techsolutions.com`
- Senha: `Senha123!`

📖 Veja a [documentação completa do seed](./backend/src/scripts/README.md) para mais detalhes.

---

## 🧪 Teste Rápido - Capture Seu Primeiro Lead

### Opção 1: Via Interface n8n

1. Acesse: http://localhost:5678
2. Importe o workflow `n8n-workflows/01-lead-capture-example.md`
3. Ative o workflow
4. Use o webhook URL para testar

### Opção 2: Via cURL (Direto na API)

```bash
# Criar um lead de teste
curl -X POST http://localhost:3001/api/leads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{
    "name": "João Teste Silva",
    "email": "joao.teste@empresa.com.br",
    "phone": "11999999999",
    "message": "Quero saber mais sobre seus serviços",
    "source": "test",
    "customFields": {
      "company": "Teste Ltda",
      "position": "Diretor"
    }
  }'
```

### Opção 3: Via Dashboard

1. Acesse: http://localhost:3000/dashboard/leads
2. Clique em "Novo Lead"
3. Preencha os campos
4. Salve

### Verificar o Resultado

```bash
# Ver o lead no dashboard
open http://localhost:3000/dashboard/leads

# Ou via API
curl http://localhost:3001/api/leads \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

---

## 📂 Estrutura do Projeto

```
nexus-sales-os/
├── backend/              # API Node.js + TypeScript
│   ├── src/
│   │   ├── modules/      # Módulos (leads, webhooks, analytics)
│   │   ├── services/     # Serviços (enrichment, scoring, crm)
│   │   ├── integrations/ # Integrações com CRMs
│   │   └── database/     # Prisma (ORM)
│   └── prisma/           # Database schemas
│
├── dashboard/            # Frontend Next.js 14
│   ├── app/              # Páginas (login, dashboard, leads, analytics)
│   ├── components/       # Componentes React
│   └── lib/              # Utils e API client
│
├── n8n-workflows/        # Templates de workflows n8n
│   ├── README.md         # Documentação completa
│   └── 01-lead-capture-example.md
│
├── docs/                 # Documentação completa
│   ├── setup/            # Guia de instalação
│   ├── onboarding/       # Onboarding de clientes
│   ├── integrations/     # Guias de integração
│   └── api/              # API Reference
│
├── docker-compose.yml    # Configuração Docker
├── README.md             # README principal
└── GETTING_STARTED.md    # Este arquivo
```

---

## 🔑 Funcionalidades Principais

### ✅ O Que Já Está Implementado

#### Backend (API)
- ✅ Autenticação JWT
- ✅ CRUD completo de Leads
- ✅ Webhooks para captura de leads
- ✅ Enriquecimento de dados (ReceitaWS, email, phone)
- ✅ Lead Scoring com IA (Gemini/GPT)
- ✅ Integrações com CRMs (Pipedrive, RD Station, HubSpot)
- ✅ Analytics completo (dashboard, funnel, ROI)
- ✅ Histórico de atividades por lead

#### Frontend (Dashboard)
- ✅ Login/Autenticação
- ✅ Dashboard com métricas principais
- ✅ Lista de leads (com filtros e busca)
- ✅ Analytics com gráficos interativos
- ✅ Gestão de integrações

#### Automação (n8n)
- ✅ Templates de workflows documentados
- ✅ Exemplos de captura de leads
- ✅ Exemplos de enriquecimento
- ✅ Exemplos de scoring com IA
- ✅ Exemplos de integração com CRM

#### Documentação
- ✅ Guia completo de instalação
- ✅ Guia de onboarding para clientes
- ✅ Documentação de workflows n8n
- ✅ Estratégia de produto completa

---

## 🎯 Próximos Passos

### Imediato (Hoje)

1. **Testar o Sistema Localmente**
   - Siga o Quick Start acima
   - Capture alguns leads de teste
   - Explore o dashboard

2. **Configurar Primeira Integração**
   - Escolha: Pipedrive, RD Station ou HubSpot
   - Configure as credenciais no `.env`
   - Teste o envio de um lead

3. **Importar Workflows n8n**
   - Acesse http://localhost:5678
   - Importe os workflows de exemplo
   - Configure os webhooks

### Curto Prazo (Esta Semana)

1. **Personalizar para Seu Nicho**
   - Ajustar regras de qualificação
   - Configurar prompt da IA
   - Definir threshold de score

2. **Conectar Fontes de Leads Reais**
   - Facebook Ads
   - Google Ads
   - Landing Pages

3. **Treinar Seu Time**
   - Mostrar o dashboard
   - Explicar o fluxo
   - Definir processos

### Médio Prazo (Próximas 2 Semanas)

1. **Primeiro Cliente Piloto**
   - Escolher cliente ideal
   - Fazer onboarding completo
   - Coletar feedback

2. **Otimizar Baseado em Dados**
   - Analisar métricas
   - Ajustar regras
   - Melhorar integrações

3. **Documentar Seus Processos**
   - Criar runbooks
   - Documentar casos de uso
   - Preparar materiais de venda

---

## 📖 Recursos Importantes

### Documentação
- [README Principal](./README.md) - Visão geral do produto
- [Guia de Instalação](./docs/setup/README.md) - Instalação detalhada
- [Guia de Onboarding](./docs/onboarding/README.md) - Para clientes
- [Workflows n8n](./n8n-workflows/README.md) - Automação

### Código-Fonte
- [Backend](./backend/) - API REST
- [Dashboard](./dashboard/) - Interface web
- [Database Schema](./backend/prisma/schema.prisma) - Modelo de dados

### Exemplos
- [Workflow de Captura](./n8n-workflows/01-lead-capture-example.md)
- Mais exemplos em breve!

---

## 🐛 Troubleshooting Rápido

### Problema: Docker não inicia

```bash
# Verificar se Docker está rodando
docker ps

# Verificar logs
docker-compose logs -f

# Reiniciar todos os serviços
docker-compose down
docker-compose up -d
```

### Problema: Backend não conecta ao banco

```bash
# Verificar se PostgreSQL está rodando
docker-compose ps postgres

# Verificar variável DATABASE_URL no .env
cat .env | grep DATABASE_URL

# Recriar banco de dados
docker-compose down -v
docker-compose up -d
docker-compose exec backend npm run migrate
```

### Problema: Dashboard mostra erro 401

```bash
# Verificar se o token JWT é válido
# Faça login novamente para obter novo token

# Verificar se a API está rodando
curl http://localhost:3001/health
```

### Problema: n8n não acessa a API

```bash
# No Docker, use o nome do serviço
# Não: http://localhost:3001
# Sim: http://backend:3001

# Ou, se n8n está fora do Docker
# Use: http://host.docker.internal:3001
```

---

## 💡 Dicas Importantes

### Segurança
- ⚠️ **NUNCA** commite o arquivo `.env` com credenciais reais
- ⚠️ Troque o `JWT_SECRET` para produção (32+ caracteres aleatórios)
- ⚠️ Use HTTPS em produção
- ⚠️ Configure firewall e rate limiting

### Performance
- 💡 Configure Redis para cache e filas
- 💡 Use CDN para o frontend
- 💡 Configure índices no banco de dados
- 💡 Monitore com Sentry ou similar

### Manutenção
- 📅 Faça backup do banco diariamente
- 📅 Monitore logs de erro
- 📅 Atualize dependências regularmente
- 📅 Teste antes de fazer deploy

---

## 🤝 Precisa de Ajuda?

### Suporte Técnico
- **Email:** suporte@nexus.ai
- **WhatsApp:** +55 11 99999-9999
- **GitHub Issues:** [Abrir Issue](https://github.com/nexus-ai/nexus-sales-os/issues)

### Comercial
- **Site:** [n8nexus.com.br](https://n8nexus.com.br)
- **Email:** contato@nexus.ai
- **Agendar Demo:** [Calendly](https://calendly.com/nexus-ai)

---

## 🎉 Parabéns!

Você agora tem a infraestrutura completa do **Nexus Sales OS** pronta para transformar leads em vendas automaticamente!

**Próximo passo:** [Configurar sua primeira integração](./docs/setup/README.md)

---

**Última atualização:** Novembro 2024  
**Versão:** 1.0.0  
**Criado por:** Nexus.ai Team com ❤️

