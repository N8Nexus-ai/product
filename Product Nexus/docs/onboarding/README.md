# Guia de Onboarding para Clientes - Nexus Sales OS

## 👋 Bem-vindo ao Nexus Sales OS!

Este guia vai te levar do zero até ter sua máquina de vendas funcionando em **30-45 dias**.

---

## 📅 Cronograma de Implantação

### **Semana 1: Kickoff & Configuração Inicial**

#### Dia 1-2: Kickoff Meeting
- ✅ Reunião de alinhamento (2h)
- ✅ Entender seu processo comercial atual
- ✅ Definir objetivos e KPIs
- ✅ Mapear fontes de leads
- ✅ Escolher CRM (se ainda não tiver)

#### Dia 3-5: Setup Técnico
- ✅ Criar infraestrutura (servidores, banco de dados)
- ✅ Configurar domínios e SSL
- ✅ Instalar Nexus Sales OS
- ✅ Criar usuários de acesso
- ✅ Configurar credenciais de APIs

**Entregável:** Sistema instalado e acessível

---

### **Semana 2: Integração com Fontes de Leads**

#### Dia 6-8: Integração Facebook Ads
- ✅ Conectar Facebook Business Manager
- ✅ Configurar webhook de Lead Ads
- ✅ Testar captura de leads
- ✅ Mapear campos customizados

#### Dia 9-10: Integração Google Ads
- ✅ Conectar Google Ads API
- ✅ Configurar conversões offline
- ✅ Testar captura de leads
- ✅ Configurar tracking

#### Dia 11-12: Outras Fontes
- ✅ Landing pages (webhook)
- ✅ Formulários Typeform/Jotform
- ✅ Site institucional
- ✅ LinkedIn Ads (se aplicável)

**Entregável:** Todos os leads chegando no sistema

---

### **Semana 3: Configuração de Regras de Qualificação**

#### Dia 13-15: Definir Perfil Ideal de Cliente (ICP)

**Workshop de 2 horas para definir:**

1. **Características demográficas:**
   - B2B ou B2C?
   - Tamanho da empresa (faturamento, funcionários)
   - Setor/indústria
   - Localização geográfica

2. **Características comportamentais:**
   - Mensagem mostra urgência?
   - Já conhece o produto/serviço?
   - Budget disponível?

3. **Sinais de qualificação:**
   - Email corporativo vs. pessoal
   - CNPJ ativo há X anos
   - Cargo do lead (decisor?)

**Exemplo: Energia Solar**

```
ICP:
- PJ com faturamento > R$ 500k/ano
- Conta de luz > R$ 1.000/mês
- Possui imóvel próprio
- Localização: SP, RJ, MG (boa insolação)

Desqualificadores:
- Email genérico (@gmail, @hotmail)
- Imóvel alugado
- Conta de luz < R$ 300
```

#### Dia 16-18: Configurar Regras no Sistema

- ✅ Configurar enriquecimento de dados
- ✅ Configurar score de qualificação (IA)
- ✅ Definir threshold de qualificação (ex: score > 60)
- ✅ Configurar fluxos de leads qualificados vs. não qualificados

**Entregável:** Regras de qualificação ativas

---

### **Semana 4: Integração com CRM**

#### Dia 19-21: Conectar CRM

**Escolha seu CRM:**

- [ ] Pipedrive
- [ ] RD Station
- [ ] HubSpot
- [ ] Salesforce
- [ ] Outro: _______

**Configuração:**
- ✅ Conectar API do CRM
- ✅ Mapear campos (nome, email, telefone, score, etc.)
- ✅ Definir pipeline/funil no CRM
- ✅ Configurar proprietários (vendedores)
- ✅ Testar envio de lead

#### Dia 22-24: Configurar Notificações

- ✅ WhatsApp para vendedor (lead qualificado)
- ✅ Email para gestor (resumo diário)
- ✅ Slack/Discord (time comercial)
- ✅ Dashboard em tempo real

**Entregável:** CRM recebendo leads qualificados automaticamente

---

### **Semana 5: Treinamento & Testes**

#### Dia 25-27: Treinamento do Time

**Workshop de 3 horas:**

1. **Como funciona o sistema**
   - Visão geral do funil
   - Dashboard e métricas
   - Como os leads são qualificados

2. **Hands-on**
   - Login no dashboard
   - Visualizar leads
   - Entender score e dados enriquecidos
   - Ver histórico de atividades

3. **CRM Integration**
   - Como os leads chegam no CRM
   - O que fazer com lead qualificado
   - O que fazer com lead não qualificado

4. **Notificações**
   - WhatsApp: como funciona
   - Email: relatórios diários

#### Dia 28-30: Testes com Leads Reais

- ✅ Capturar 10-20 leads reais
- ✅ Verificar qualidade do enriquecimento
- ✅ Validar score da IA
- ✅ Confirmar envio ao CRM
- ✅ Ajustar regras se necessário

**Entregável:** Sistema validado com leads reais

---

### **Semana 6: Go Live & Ajustes**

#### Dia 31-35: Go Live 🚀

- ✅ Ativar todos os workflows
- ✅ Ativar todas as integrações
- ✅ Monitorar primeiras 48h de perto
- ✅ Ajustar regras conforme feedback

#### Dia 36-40: Otimização

- ✅ Análise de dados dos primeiros dias
- ✅ Ajustar threshold de qualificação
- ✅ Otimizar prompt da IA
- ✅ Melhorar integração com CRM

#### Dia 41-45: Review & Handoff

- ✅ Reunião de review (2h)
- ✅ Apresentar métricas iniciais
- ✅ Documentação personalizada
- ✅ Treinamento final
- ✅ Handoff para suporte contínuo

**Entregável:** Sistema 100% operacional

---

## 📋 Checklist Completo

### Pré-Requisitos
- [ ] Conta Google (para Gemini AI)
- [ ] Acesso ao Facebook Business Manager
- [ ] Acesso ao Google Ads
- [ ] Acesso ao CRM (ou criar conta)
- [ ] Domínio próprio (para emails e dashboard)

### Configuração Inicial
- [ ] Sistema instalado
- [ ] Usuários criados
- [ ] Domínio configurado
- [ ] SSL/HTTPS ativo

### Integrações
- [ ] Facebook Ads conectado
- [ ] Google Ads conectado
- [ ] Landing pages conectadas
- [ ] CRM conectado
- [ ] WhatsApp conectado (opcional)

### Regras de Negócio
- [ ] ICP definido
- [ ] Regras de qualificação configuradas
- [ ] Score threshold definido
- [ ] Fluxos de leads configurados

### Treinamento
- [ ] Time comercial treinado
- [ ] Gestores treinados
- [ ] Documentação entregue
- [ ] Suporte configurado

---

## 📊 KPIs para Acompanhar

### Métricas de Captura
- **Total de Leads:** Quantos leads entraram no sistema
- **Taxa de Captura:** % de leads capturados vs. perdidos
- **Leads por Fonte:** Facebook, Google, Landing Page, etc.

### Métricas de Qualificação
- **Taxa de Qualificação:** % de leads qualificados
- **Score Médio:** Score médio dos leads
- **Tempo de Qualificação:** Quanto tempo leva para qualificar

### Métricas de CRM
- **Taxa de Envio:** % de leads enviados ao CRM
- **Taxa de Erro:** % de erros na integração
- **Tempo de Resposta:** Quanto tempo até o vendedor contatar

### Métricas de Negócio
- **Taxa de Conversão:** % de leads que viraram venda
- **ROI:** Retorno sobre investimento
- **Custo por Lead Qualificado:** Quanto custa cada lead bom
- **Receita Gerada:** Quanto de receita foi atribuída ao sistema

---

## 🎯 Objetivos de Sucesso

### Mês 1 (Setup)
- ✅ Sistema 100% operacional
- ✅ Todas as integrações ativas
- ✅ Time treinado

### Mês 2 (Otimização)
- 📈 Taxa de qualificação > 30%
- 📈 Redução de 40% no tempo do time comercial
- 📈 ROI positivo

### Mês 3 (Escala)
- 📈 Taxa de qualificação > 40%
- 📈 Aumento de 20% nas vendas
- 📈 ROI > 150%

---

## 🆘 Suporte Durante Onboarding

### Canal Prioritário
- **WhatsApp:** +55 11 99999-9999
- **Email:** onboarding@nexus.ai
- **Horário:** Seg-Sex, 9h-18h

### Reuniões Semanais
- **Toda segunda-feira, 10h**
- **Duração:** 30 minutos
- **Objetivo:** Acompanhar progresso, resolver blockers

### Suporte Técnico 24/7
- Para emergências críticas
- **Email:** suporte-urgente@nexus.ai

---

## 🎓 Recursos de Treinamento

### Vídeos
- [x] Visão Geral do Sistema (15min)
- [x] Como Usar o Dashboard (20min)
- [x] Entendendo o Score de Leads (10min)
- [x] Integração com CRM (15min)
- [x] Análise de Métricas (20min)

### Documentação
- [Guia Completo](../README.md)
- [API Documentation](../api/README.md)
- [Troubleshooting](../troubleshooting/README.md)

### Webinars
- **Toda quarta-feira, 14h**
- **Tema:** Melhores práticas de qualificação de leads

---

## ✅ Próximos Passos

Após o onboarding:

1. **Mês 2-3:** Otimização contínua
   - Ajustar regras com base em dados
   - Treinar IA com seus dados
   - Expandir integrações

2. **Mês 4+:** Escala e Automação
   - Adicionar mais fontes de leads
   - Automatizar follow-ups
   - Integrar com outras ferramentas

---

## 📞 Fale Conosco

Dúvidas sobre o onboarding?

- **WhatsApp:** +55 11 99999-9999
- **Email:** onboarding@nexus.ai
- **Site:** [n8nexus.com.br](https://n8nexus.com.br)

---

**Bem-vindo à transformação da sua operação comercial!** 🚀

---

**Última atualização:** Novembro 2024  
**Versão:** 1.0.0  
**Autor:** Nexus.ai Team

