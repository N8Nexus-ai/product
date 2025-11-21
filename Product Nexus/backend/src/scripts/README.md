# 📦 Scripts de Seed e Utilitários

## 🌱 Seed de Dados Fictícios

Script completo para popular o banco de dados com dados fictícios realistas, simulando uma empresa cheia de dados.

### O que o script cria:

- ✅ **1 Empresa** fictícia (TechSolutions Brasil)
- ✅ **6 Usuários** (1 CEO, 5 usuários regulares - CLIENT/USER)
- ⚠️ **ADMIN não é criado** via seed (use `npm run create-admin` separadamente)
- ✅ **5 Integrações** (RD Station, Facebook Ads, Google Ads, Typeform, WhatsApp)
- ✅ **6 Campanhas** (Facebook, Google, LinkedIn)
- ✅ **150 Leads** com diferentes statuses e dados enriquecidos
- ✅ **Múltiplas Atividades** para cada lead (timeline completa)
- ✅ **6 Tags** de leads com cores
- ✅ **4 Agentes** (IA Gemini, Automação, Scoring, Chatbot)
- ✅ **91 dias de métricas diárias** (últimos 3 meses)
- ✅ **50 logs do sistema**

### Como usar:

#### Opção 1: Via npm script (Recomendado)

```bash
cd backend
npm run seed
```

#### Opção 2: Diretamente com tsx

```bash
cd backend
npx tsx src/scripts/seed-demo-data.ts
```

#### Opção 3: Com Docker

```bash
docker-compose exec backend npm run seed
```

### Credenciais de acesso:

Após executar o seed, você pode fazer login no dashboard com:

- **Email:** `admin@techsolutions.com`
- **Senha:** `Senha123!`

### ⚠️ Importante:

1. **O script verifica automaticamente se as migrations foram aplicadas!** 
   - Se você tentar rodar o seed sem ter rodado as migrations, o script vai avisar e parar.
   - Ele mostra instruções claras de como rodar as migrations.

2. **O script não limpa dados existentes por padrão.** Ele apenas adiciona novos dados.

3. **Se você quiser limpar tudo antes**, descomente as linhas de limpeza no início do arquivo `seed-demo-data.ts`:

   ```typescript
   // Descomente estas linhas se quiser limpar dados existentes:
   await prisma.leadActivity.deleteMany();
   await prisma.leadTag.deleteMany();
   // ... etc
   ```

4. **Fluxo recomendado:**

   ```bash
   # 1. Primeiro, rode as migrations (cria as tabelas)
   npm run migrate
   
   # 2. Depois, rode o seed (popula com dados)
   npm run seed
   ```

   Mas não se preocupe: o script vai te avisar se você esquecer de rodar as migrations primeiro! 😊

### Estrutura dos dados criados:

#### Leads
- Distribuição realista de statuses (NEW, ENRICHED, QUALIFIED, SENT_TO_CRM, CONVERTED, etc.)
- Dados enriquecidos para leads processados (empresa, cargo, LinkedIn, localização)
- Scores de 0-100 baseados no status
- Atividades completas na timeline
- Tags aleatórias associadas

#### Campanhas
- Campanhas ativas e finalizadas
- Métricas de impressões, cliques, conversões e gastos
- Associação com leads

#### Métricas Diárias
- Últimos 90 dias de métricas
- Leads recebidos, enriquecidos, qualificados
- Médias de score
- Gastos em anúncios
- CPL (Custo por Lead) e CPQL (Custo por Lead Qualificado)

### Personalização:

Você pode modificar o arquivo `seed-demo-data.ts` para:
- Alterar a quantidade de dados (número de leads, dias de métricas, etc.)
- Modificar os nomes da empresa
- Ajustar as distribuições de status
- Adicionar mais campanhas, integrações ou agentes

---

## 🔐 Criar Usuário ADMIN

**IMPORTANTE:** ADMINs só devem ser criados pela equipe interna. O registro público nunca cria ADMINs.

Script para criar um usuário ADMIN internamente:

```bash
# Opção 1: Via npm script
npm run create-admin

# Opção 2: Direto com argumentos
npx tsx src/scripts/create-admin.ts admin@nexus.ai SenhaSegura123! "Nome do Admin"

# Opção 3: Via variáveis de ambiente
ADMIN_EMAIL=admin@nexus.ai ADMIN_PASSWORD=SenhaSegura123! npm run create-admin
```

**Características do ADMIN:**
- ✅ Não tem `companyId` (acesso global a todas as empresas)
- ✅ Pode ver dados de todas as empresas
- ✅ Pode filtrar por empresa específica via query param `?companyId=xxx`
- ⚠️ Nunca é criado via registro público (`/api/auth/register`)

---

## 🤖 Criar Agente de Exemplo

Script para criar um agente de exemplo usando Gemini:

```bash
npx tsx src/scripts/create-sample-agent.ts
```

---

## 📝 Notas

- Todos os scripts usam `dotenv` para carregar variáveis de ambiente
- Certifique-se de ter o `.env` configurado com `DATABASE_URL`
- Os scripts são executados em modo TypeScript usando `tsx` (sem necessidade de build)

