# Nexus Sales OS - Workflows n8n

Este diretório contém os workflows n8n prontos para serem importados na sua instância.

## 📋 Workflows Disponíveis

### 1. Lead Capture (Captura de Leads)
**Arquivo:** `01-lead-capture.json`

**Descrição:** Captura leads de múltiplas fontes (Facebook Ads, Google Ads, Landing Pages) e os envia para a API do Nexus Sales OS.

**Triggers:**
- Webhook para Facebook Ads
- Webhook para Google Ads
- Webhook para Landing Pages

**Ações:**
- Normaliza dados do lead
- Valida campos obrigatórios
- Envia para API backend
- Notifica em caso de erro

---

### 2. Lead Enrichment (Enriquecimento de Dados)
**Arquivo:** `02-lead-enrichment.json`

**Descrição:** Enriquece dados de leads automaticamente usando APIs externas.

**Triggers:**
- Webhook da API (quando novo lead é criado)

**Ações:**
1. Consulta ReceitaWS (se CNPJ disponível)
2. Valida email
3. Valida telefone
4. Atualiza lead na API com dados enriquecidos

---

### 3. AI Lead Scoring (Qualificação com IA)
**Arquivo:** `03-ai-lead-scoring.json`

**Descrição:** Qualifica leads automaticamente usando Google Gemini ou OpenAI.

**Triggers:**
- Webhook da API (após enriquecimento)

**Ações:**
1. Monta prompt com dados do lead
2. Chama API do Gemini/GPT
3. Extrai score e reasoning
4. Atualiza lead na API
5. Se qualificado, envia para CRM

---

### 4. CRM Integration (Integração com CRM)
**Arquivo:** `04-crm-integration.json`

**Descrição:** Envia leads qualificados para o CRM configurado (Pipedrive, RD Station, HubSpot).

**Triggers:**
- Webhook da API (lead qualificado)

**Ações:**
1. Verifica CRM configurado
2. Formata dados para o CRM
3. Cria contato/deal no CRM
4. Adiciona notas com dados enriquecidos
5. Atualiza status na API

---

### 5. Lead Monitoring (Monitoramento)
**Arquivo:** `05-lead-monitoring.json`

**Descrição:** Monitora leads em tempo real e envia notificações.

**Triggers:**
- Schedule (a cada 5 minutos)

**Ações:**
1. Busca leads novos ou qualificados
2. Envia notificação no WhatsApp/Telegram
3. Alerta se há leads travados no funil

---

## 🚀 Como Importar

### Método 1: Interface Web n8n

1. Acesse sua instância n8n
2. Clique em **Workflows** > **Import**
3. Selecione o arquivo JSON desejado
4. Configure as credenciais necessárias
5. Ative o workflow

### Método 2: CLI

```bash
# Copiar workflows para o container n8n
docker cp n8n-workflows/*.json nexus-n8n:/workflows/

# Importar via API
curl -X POST http://localhost:5678/api/v1/workflows/import \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "file=@01-lead-capture.json"
```

### Método 3: Volume Docker

Se você está usando o `docker-compose.yml` fornecido:

```bash
# Os workflows já estão mapeados no volume
# Basta importá-los pela interface web
```

---

## ⚙️ Configuração

### Credenciais Necessárias

Antes de ativar os workflows, configure as seguintes credenciais no n8n:

#### 1. Nexus Sales OS API
- **Tipo:** HTTP Header Auth
- **Nome:** `Authorization`
- **Valor:** `Bearer YOUR_JWT_TOKEN`

#### 2. Google Gemini API
- **Tipo:** API Key
- **Key:** `x-goog-api-key`
- **Valor:** Sua API key do Gemini

#### 3. OpenAI API (alternativa)
- **Tipo:** HTTP Header Auth
- **Nome:** `Authorization`
- **Valor:** `Bearer YOUR_OPENAI_KEY`

#### 4. ReceitaWS (opcional)
- **Tipo:** Nenhuma (API pública)
- Limite de rate: 3 requisições/minuto

#### 5. Pipedrive (se usar)
- **Tipo:** HTTP Header Auth ou Query Param
- **Param:** `api_token`
- **Valor:** Seu token do Pipedrive

#### 6. RD Station (se usar)
- **Tipo:** OAuth2
- **Client ID:** Seu client ID
- **Client Secret:** Seu client secret
- **Token URL:** `https://api.rd.services/auth/token`

#### 7. HubSpot (se usar)
- **Tipo:** HTTP Header Auth
- **Nome:** `Authorization`
- **Valor:** `Bearer YOUR_HUBSPOT_KEY`

---

## 🔧 Personalização

### Variáveis de Ambiente

Cada workflow usa variáveis de ambiente que devem ser configuradas:

```env
# API Backend
NEXUS_API_URL=http://backend:3001/api

# Gemini AI
GEMINI_API_KEY=your_key_here

# OpenAI (alternativa)
OPENAI_API_KEY=your_key_here

# CRM Credentials
PIPEDRIVE_API_TOKEN=your_token
PIPEDRIVE_DOMAIN=your-company.pipedrive.com

RD_STATION_ACCESS_TOKEN=your_token

HUBSPOT_API_KEY=your_key
```

### Ajustar para Seu Nicho

Os workflows vêm pré-configurados com regras genéricas. Para ajustá-los ao seu nicho:

#### Exemplo: Energia Solar

No workflow `03-ai-lead-scoring.json`, ajuste o prompt:

```json
{
  "parameters": {
    "prompt": "Analise este lead para empresa de Energia Solar. Critérios importantes:\n- Tem telhado próprio?\n- Conta de luz acima de R$ 500?\n- É PJ ou PF?\n- Localização tem boa insolação?\n\nLead:\n{{$json.data}}"
  }
}
```

#### Exemplo: Consultorias B2B

```json
{
  "parameters": {
    "prompt": "Analise este lead para consultoria B2B. Critérios:\n- Empresa ativa há mais de 2 anos?\n- Faturamento acima de R$ 1M?\n- Cargo de decisão?\n- Setor compatível?\n\nLead:\n{{$json.data}}"
  }
}
```

---

## 📊 Monitoramento

### Logs

Todos os workflows geram logs que podem ser visualizados:

1. Na interface do n8n: **Executions**
2. Nos logs do Docker: `docker logs nexus-n8n`
3. Na API backend: endpoint `/api/leads/:id` mostra histórico de atividades

### Alertas

Configure alertas para:
- Workflows com falha
- Leads travados no funil
- APIs externas fora do ar

---

## 🐛 Troubleshooting

### Workflow não está capturando leads

**Problema:** Webhook não recebe dados

**Solução:**
1. Verifique se o webhook URL está correto nas plataformas de ads
2. Teste com ferramentas como Postman
3. Verifique os logs do n8n

### Enriquecimento falhando

**Problema:** ReceitaWS retorna erro

**Solução:**
1. Verifique rate limit (máx 3 req/min)
2. Valide formato do CNPJ
3. Use API paga se necessário

### IA não está qualificando

**Problema:** Gemini/GPT não responde

**Solução:**
1. Verifique se a API key está correta
2. Verifique quota de uso
3. Teste o prompt manualmente
4. Use fallback para regras fixas

---

## 🔄 Atualizações

Para atualizar os workflows:

```bash
# Backup dos workflows atuais
docker exec nexus-n8n n8n export:workflow --all --output=/backup/

# Importar versões atualizadas
# Via interface web ou API
```

---

## 📚 Documentação Adicional

- [n8n Documentation](https://docs.n8n.io/)
- [API Backend Docs](../docs/api/README.md)
- [Integration Guides](../docs/integrations/README.md)

---

## 💡 Exemplos de Uso

### Teste Manual de Captura

```bash
curl -X POST http://localhost:5678/webhook/lead-capture \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@empresa.com.br",
    "phone": "(11) 99999-9999",
    "source": "facebook",
    "message": "Quero orçamento"
  }'
```

### Teste de Enriquecimento

```bash
curl -X POST http://localhost:3001/api/leads/:leadId/enrich \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Teste de Scoring

```bash
curl -X POST http://localhost:3001/api/leads/:leadId/score \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

**Última atualização:** Novembro 2024  
**Versão:** 1.0.0  
**Compatível com:** n8n v1.x

