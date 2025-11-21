# Workflow 01: Lead Capture (Captura de Leads)

## Visão Geral

Este workflow captura leads de múltiplas fontes e os centraliza na API do Nexus Sales OS.

## Estrutura do Workflow

```
┌─────────────────┐
│  Webhook Node   │ ◄── Facebook Ads
│  (Trigger)      │ ◄── Google Ads
│                 │ ◄── Landing Pages
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Function Node  │ ── Normaliza dados
│  (Transform)    │ ── Valida campos
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  HTTP Request   │ ── POST /api/leads
│  (API Call)     │
└────────┬────────┘
         │
         ├──► Success ──► ✅ Log
         │
         └──► Error ──► ❌ Notificação
```

## Nodes Detalhados

### 1. Webhook Trigger

**Type:** Webhook  
**Method:** POST  
**Path:** `/webhook/lead-capture`

**Headers esperados:**
```json
{
  "Content-Type": "application/json",
  "X-Source": "facebook|google|landing-page"
}
```

**Body esperado:**
```json
{
  "name": "João Silva",
  "email": "joao@empresa.com.br",
  "phone": "(11) 99999-9999",
  "message": "Quero saber mais sobre o produto",
  "source": "facebook",
  "customFields": {
    "campaign": "Solar 2024",
    "ad_id": "123456789",
    "utm_source": "facebook",
    "utm_campaign": "solar-promo"
  }
}
```

### 2. Data Transformation

**Type:** Function  
**Code:**

```javascript
// Normalizar dados do lead
const items = $input.all();

return items.map(item => {
  const data = item.json;
  
  // Extrair nome completo ou dividir
  let firstName = '';
  let lastName = '';
  
  if (data.name) {
    const nameParts = data.name.trim().split(' ');
    firstName = nameParts[0];
    lastName = nameParts.slice(1).join(' ');
  }
  
  // Normalizar telefone (remover formatação)
  const phone = data.phone ? 
    data.phone.replace(/\D/g, '') : null;
  
  // Normalizar email (lowercase)
  const email = data.email ? 
    data.email.toLowerCase().trim() : null;
  
  // Validações básicas
  const isValidEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = phone && phone.length >= 10;
  
  // Detectar fonte se não fornecida
  const source = data.source || 
    $node["Webhook"].json.headers['x-source'] || 
    'unknown';
  
  return {
    json: {
      name: data.name || `${firstName} ${lastName}`.trim(),
      firstName,
      lastName,
      email: isValidEmail ? email : null,
      phone: isValidPhone ? phone : null,
      message: data.message || null,
      source,
      customFields: {
        ...data.customFields,
        originalData: data,
        capturedAt: new Date().toISOString(),
        userAgent: $node["Webhook"].json.headers['user-agent']
      },
      validation: {
        email: isValidEmail,
        phone: isValidPhone,
        score: (isValidEmail ? 50 : 0) + (isValidPhone ? 30 : 0) + (data.message ? 20 : 0)
      }
    }
  };
});
```

### 3. API Call

**Type:** HTTP Request  
**Method:** POST  
**URL:** `{{$env.NEXUS_API_URL}}/leads`

**Authentication:** Bearer Token

**Body:**
```json
{
  "name": "={{$json.name}}",
  "email": "={{$json.email}}",
  "phone": "={{$json.phone}}",
  "message": "={{$json.message}}",
  "source": "={{$json.source}}",
  "customFields": "={{$json.customFields}}"
}
```

### 4. Success Handler

**Type:** Function  
**Code:**

```javascript
const response = $input.first().json;

console.log('✅ Lead capturado com sucesso:', {
  leadId: response.data.id,
  name: response.data.name,
  email: response.data.email
});

return [{
  json: {
    success: true,
    leadId: response.data.id,
    message: 'Lead captured successfully'
  }
}];
```

### 5. Error Handler

**Type:** HTTP Request (Webhook para notificação)  
**Trigger:** On error

**URL:** Slack/Discord/WhatsApp webhook

**Body:**
```json
{
  "text": "⚠️ Erro ao capturar lead",
  "error": "={{$json.error.message}}",
  "timestamp": "={{$now.toISO()}}"
}
```

## Configuração

### 1. Variáveis de Ambiente

No n8n, configure:

```env
NEXUS_API_URL=http://backend:3001/api
NEXUS_API_TOKEN=your_jwt_token_here
```

### 2. Credenciais

Crie uma credencial "Nexus API" do tipo "Header Auth":
- Nome: `Authorization`
- Valor: `Bearer ${NEXUS_API_TOKEN}`

### 3. Webhook URL

Após criar o workflow, copie a URL do webhook:

```
https://your-n8n-domain.com/webhook/lead-capture
```

Configure esta URL em:
- Facebook Ads: Lead Ads > Webhook
- Google Ads: Conversions API
- Landing Pages: Formulário > Action URL

## Testes

### Teste Local com cURL

```bash
curl -X POST http://localhost:5678/webhook/lead-capture \
  -H "Content-Type: application/json" \
  -H "X-Source: test" \
  -d '{
    "name": "João Teste",
    "email": "joao.teste@example.com",
    "phone": "11999999999",
    "message": "Teste de captura",
    "source": "manual-test"
  }'
```

### Resposta Esperada

```json
{
  "success": true,
  "leadId": "uuid-123-456",
  "message": "Lead captured successfully"
}
```

## Monitoramento

### Métricas a Acompanhar

- Taxa de sucesso de captura (% de 200 OK)
- Tempo médio de processamento
- Erros por fonte (Facebook, Google, etc.)
- Leads com dados incompletos

### Logs

Verifique no n8n:
1. **Executions** > Ver todas as execuções
2. Filtrar por status (success/error)
3. Ver detalhes de cada node

## Troubleshooting

### Problema: Leads não estão sendo capturados

**Possíveis causas:**
1. Webhook URL incorreta
2. Token de autenticação expirado
3. Backend fora do ar

**Solução:**
```bash
# Testar backend
curl http://localhost:3001/health

# Testar webhook
curl -X POST http://localhost:5678/webhook-test/lead-capture \
  -d '{"test": true}'
```

### Problema: Dados incompletos

**Causa:** Formato diferente entre fontes

**Solução:** Ajustar o Function node para mapear corretamente cada fonte.

## Próximos Passos

Após captura, o lead passa automaticamente para:
1. **Workflow 02:** Lead Enrichment (enriquecimento)
2. **Workflow 03:** AI Lead Scoring (qualificação)
3. **Workflow 04:** CRM Integration (envio ao CRM)

---

**Status:** ✅ Pronto para uso  
**Última atualização:** Novembro 2024  
**Versão:** 1.0.0

