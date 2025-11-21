import { PrismaClient, Role, LeadStatus, IntegrationType, AgentType, AgentStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Arrays de dados fictícios
const FIRST_NAMES = [
  'João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Fernanda', 'Ricardo', 'Juliana',
  'Lucas', 'Patrícia', 'Marcos', 'Camila', 'Rafael', 'Beatriz', 'Bruno', 'Larissa',
  'Thiago', 'Gabriela', 'Felipe', 'Mariana', 'André', 'Amanda', 'Roberto', 'Vanessa',
  'Daniel', 'Carla', 'Gustavo', 'Tatiana', 'Rodrigo', 'Renata'
];

const LAST_NAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira',
  'Lima', 'Gomes', 'Ribeiro', 'Carvalho', 'Martins', 'Almeida', 'Lopes', 'Costa',
  'Freitas', 'Rocha', 'Nascimento', 'Araújo', 'Mendes', 'Barbosa', 'Dias', 'Moreira',
  'Monteiro', 'Cardoso', 'Ramos', 'Campos', 'Azevedo', 'Fernandes'
];

const COMPANY_NAMES = [
  'TechSolutions Brasil', 'Inovação Digital', 'StartupHub', 'EmpresaXYZ',
  'Digital Ventures', 'Smart Business', 'Agência Criativa', 'Consultoria Premium'
];

const INDUSTRIES = [
  'Tecnologia', 'Marketing Digital', 'Consultoria', 'E-commerce',
  'Saúde', 'Educação', 'Fintech', 'Imobiliário'
];

const LEAD_SOURCES = ['facebook', 'google', 'linkedin', 'typeform', 'website', 'referral', 'email'];
const MESSAGES = [
  'Gostaria de saber mais sobre seus serviços',
  'Tenho interesse em uma proposta comercial',
  'Quero agendar uma reunião',
  'Preciso de informações sobre preços',
  'Já vi algumas coisas sobre vocês, quero conhecer melhor',
  'Recebi uma indicação e gostaria de conhecer',
  'Vi seu anúncio e fiquei interessado',
  'Estou procurando uma solução como essa'
];

const CAMPAIGN_NAMES = [
  'Campanha Facebook Q1 2024',
  'Google Ads - Produto Principal',
  'LinkedIn B2B - Empresas',
  'Campanha Inverno 2024',
  'Landing Page - Novo Produto',
  'Email Marketing - Base Ativa',
  'Re-engajamento - Leads Frios',
  'Webinar - Educação de Mercado'
];

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomEmail(firstName: string, lastName: string): string {
  const domains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com.br', 'empresa.com.br'];
  const randomNum = randomInt(1, 9999);
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomNum}@${randomElement(domains)}`;
}

function randomPhone(): string {
  return `(${randomInt(11, 99)}) ${randomInt(90000, 99999)}-${randomInt(1000, 9999)}`;
}

function randomCNPJ(): string {
  return `${randomInt(10, 99)}.${randomInt(100, 999)}.${randomInt(100, 999)}/${randomInt(1000, 9999)}-${randomInt(10, 99)}`;
}

async function checkMigrations() {
  try {
    // Tentar fazer uma query simples para verificar se as tabelas existem
    // Se a tabela companies não existe, as migrations não foram rodadas
    await prisma.company.findFirst({ take: 1 });
    return true;
  } catch (error: any) {
    // Se a tabela não existe, as migrations não foram rodadas
    const errorMessage = error?.message || '';
    const errorCode = error?.code || '';
    
    if (
      errorCode === '42P01' || // PostgreSQL: relation does not exist
      errorMessage.includes('does not exist') ||
      errorMessage.includes('Relation') ||
      errorMessage.includes('table') ||
      errorMessage.includes('P1001') || // Prisma: Can't reach database
      errorMessage.includes('P2021') || // Prisma: Table does not exist
      errorMessage.includes('P2025')    // Prisma: Record not found (mas tabela não existe)
    ) {
      return false;
    }
    // Se for outro tipo de erro (conexão, etc), ainda assim assumir que precisa de migrations
    // O erro real será mostrado depois quando tentar inserir dados
    return false;
  }
}

async function seedDemoData() {
  try {
    console.log('🌱 Iniciando seed de dados fictícios...\n');

    // Verificar se as migrations foram rodadas
    console.log('🔍 Verificando se as migrations foram aplicadas...');
    const migrationsOk = await checkMigrations();
    
    if (!migrationsOk) {
      console.error('\n❌ ERRO: As migrations não foram aplicadas ainda!');
      console.error('\n📋 Antes de rodar o seed, você precisa executar as migrations:');
      console.error('\n   Opção 1 (npm):');
      console.error('   cd backend');
      console.error('   npm run migrate\n');
      console.error('   Opção 2 (Docker):');
      console.error('   docker-compose exec backend npm run migrate\n');
      console.error('   Opção 3 (prisma direto):');
      console.error('   cd backend');
      console.error('   npx prisma migrate dev\n');
      process.exit(1);
    }
    
    console.log('✅ Migrations verificadas! As tabelas existem.\n');

    // Limpar dados existentes (opcional - descomente se quiser limpar)
    // console.log('⚠️  Limpando dados existentes...');
    // await prisma.leadActivity.deleteMany();
    // await prisma.leadTag.deleteMany();
    // await prisma.lead.deleteMany();
    // await prisma.dailyMetric.deleteMany();
    // await prisma.agent.deleteMany();
    // await prisma.campaign.deleteMany();
    // await prisma.integration.deleteMany();
    // await prisma.user.deleteMany();
    // await prisma.company.deleteMany();
    // await prisma.systemLog.deleteMany();

    // 1. Criar Empresa
    console.log('📦 Criando empresa...');
    const hashedPassword = await bcrypt.hash('Senha123!', 10);
    
    const company = await prisma.company.create({
      data: {
        name: 'TechSolutions Brasil',
        cnpj: randomCNPJ(),
        industry: randomElement(INDUSTRIES),
        active: true,
        setupStatus: 'completed',
        config: {
          timezone: 'America/Sao_Paulo',
          currency: 'BRL',
          language: 'pt-BR'
        }
      }
    });
    console.log(`✅ Empresa criada: ${company.name} (${company.id})\n`);

    // 2. Criar Usuários
    console.log('👥 Criando usuários...');
    const users = [];
    
    // ADMIN: Criado separadamente, SEM companyId (apenas para uso interno)
    // NOTA: ADMIN não deve ser criado via registro público, apenas internamente
    console.log('⚠️  ADMIN não é criado automaticamente via seed.');
    console.log('   ADMINs devem ser criados manualmente por equipe interna.');
    console.log('   Use Prisma Studio ou um script específico para criar ADMINs.\n');

    // Dono/CEO da empresa (primeiro usuário CLIENT)
    const ceo = await prisma.user.create({
      data: {
        email: 'ceo@techsolutions.com',
        password: hashedPassword,
        name: 'Carlos Eduardo Oliveira',
        role: Role.CLIENT,
        companyId: company.id,
        active: true
      }
    });
    users.push(ceo);
    console.log(`✅ CEO criado: ${ceo.email} (role: CLIENT)`);

    // Mais usuários
    for (let i = 0; i < 5; i++) {
      const firstName = randomElement(FIRST_NAMES);
      const lastName = randomElement(LAST_NAMES);
      const user = await prisma.user.create({
        data: {
          email: randomEmail(firstName, lastName),
          password: hashedPassword,
          name: `${firstName} ${lastName}`,
          role: i < 2 ? Role.CLIENT : Role.USER,
          companyId: company.id,
          active: true
        }
      });
      users.push(user);
    }
    console.log(`✅ Total de ${users.length} usuários criados (todos com role CLIENT/USER)\n`);

    // 3. Criar Integrações
    console.log('🔌 Criando integrações...');
    const integrations = [];
    const integrationTypes: IntegrationType[] = [
      IntegrationType.CRM_RD_STATION,
      IntegrationType.ADS_FACEBOOK,
      IntegrationType.ADS_GOOGLE,
      IntegrationType.FORM_TYPEFORM,
      IntegrationType.MESSAGING_WHATSAPP
    ];

    for (const type of integrationTypes) {
      const integration = await prisma.integration.create({
        data: {
          type,
          name: `${type} - Principal`,
          active: true,
          companyId: company.id,
          config: {
            connected: true,
            lastSync: new Date().toISOString()
          },
          lastSync: new Date()
        }
      });
      integrations.push(integration);
      console.log(`✅ Integração criada: ${integration.name}`);
    }
    console.log(`✅ Total de ${integrations.length} integrações criadas\n`);

    // 4. Criar Campanhas
    console.log('📢 Criando campanhas...');
    const campaigns = [];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);
    
    for (let i = 0; i < 6; i++) {
      const campaignStart = randomDate(startDate, new Date());
      const campaignEnd = new Date(campaignStart);
      campaignEnd.setDate(campaignEnd.getDate() + randomInt(30, 90));
      
      const impressions = randomInt(10000, 500000);
      const clicks = randomInt(100, impressions * 0.1);
      const conversions = randomInt(10, clicks * 0.2);
      const spend = randomFloat(500, 50000);

      const campaign = await prisma.campaign.create({
        data: {
          name: CAMPAIGN_NAMES[i] || `Campanha ${i + 1}`,
          source: randomElement(['facebook', 'google', 'linkedin']),
          status: i < 4 ? 'active' : 'completed',
          budget: spend * 1.5,
          startDate: campaignStart,
          endDate: campaignEnd,
          impressions,
          clicks,
          conversions,
          spend,
          companyId: company.id
        }
      });
      campaigns.push(campaign);
      console.log(`✅ Campanha criada: ${campaign.name}`);
    }
    console.log(`✅ Total de ${campaigns.length} campanhas criadas\n`);

    // 5. Criar Tags de Leads
    console.log('🏷️  Criando tags...');
    const tags = [];
    const tagNames = ['Alto Potencial', 'Qualificado', 'Urgente', 'Follow-up', 'Oportunidade', 'Cliente Potencial'];
    const tagColors = ['#FF5733', '#33FF57', '#3357FF', '#FF33F5', '#F5FF33', '#33FFF5'];

    for (let i = 0; i < tagNames.length; i++) {
      const tag = await prisma.leadTag.create({
        data: {
          name: tagNames[i],
          color: tagColors[i]
        }
      });
      tags.push(tag);
    }
    console.log(`✅ Total de ${tags.length} tags criadas\n`);

    // 6. Criar Leads (150 leads)
    console.log('📝 Criando leads...');
    const leads = [];
    const leadStatuses: LeadStatus[] = [
      LeadStatus.NEW,
      LeadStatus.ENRICHED,
      LeadStatus.QUALIFIED,
      LeadStatus.UNQUALIFIED,
      LeadStatus.SENT_TO_CRM,
      LeadStatus.CONVERTED,
      LeadStatus.LOST
    ];

    const statusDistribution = [0.1, 0.15, 0.25, 0.15, 0.15, 0.15, 0.05]; // Distribuição percentual

    for (let i = 0; i < 150; i++) {
      const firstName = randomElement(FIRST_NAMES);
      const lastName = randomElement(LAST_NAMES);
      const email = randomEmail(firstName, lastName);
      const createdAt = randomDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date());
      
      // Selecionar status baseado na distribuição
      let rand = Math.random();
      let statusIndex = 0;
      let cumulative = 0;
      for (let j = 0; j < statusDistribution.length; j++) {
        cumulative += statusDistribution[j];
        if (rand <= cumulative) {
          statusIndex = j;
          break;
        }
      }
      const status = leadStatuses[statusIndex];

      // Dados enriquecidos (para leads ENRICHED ou acima)
      let enrichedData = null;
      let enrichedAt = null;
      if ([LeadStatus.ENRICHED, LeadStatus.QUALIFIED, LeadStatus.UNQUALIFIED, LeadStatus.SENT_TO_CRM, LeadStatus.CONVERTED].includes(status)) {
        enrichedData = {
          company: `${randomElement(COMPANY_NAMES)} ${randomElement(['Ltda', 'S.A.', 'EIRELI'])}`,
          jobTitle: randomElement(['CEO', 'Diretor', 'Gerente', 'Analista', 'Coordenador', 'Especialista']),
          linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
          location: randomElement(['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Porto Alegre', 'Brasília']),
          companySize: randomElement(['1-10', '11-50', '51-200', '201-500', '501+'])
        };
        enrichedAt = new Date(createdAt.getTime() + randomInt(1, 24) * 60 * 60 * 1000);
      }

      // Score (para leads qualificados ou não qualificados)
      let score = null;
      let scoredAt = null;
      let scoringReason = null;
      if ([LeadStatus.QUALIFIED, LeadStatus.UNQUALIFIED, LeadStatus.SENT_TO_CRM, LeadStatus.CONVERTED].includes(status)) {
        score = status === LeadStatus.QUALIFIED ? randomInt(60, 95) : randomInt(20, 59);
        scoredAt = new Date((enrichedAt || createdAt).getTime() + randomInt(1, 6) * 60 * 60 * 1000);
        scoringReason = score > 60 
          ? 'Lead com alto potencial: empresa de grande porte, cargo de decisão, histórico de compras similar'
          : 'Lead com baixo potencial: empresa pequena, sem cargo de decisão ou orçamento limitado';
      }

      // CRM data (para leads SENT_TO_CRM ou CONVERTED)
      let sentToCrm = false;
      let crmId = null;
      let crmStatus = null;
      let sentToCrmAt = null;
      if ([LeadStatus.SENT_TO_CRM, LeadStatus.CONVERTED].includes(status)) {
        sentToCrm = true;
        crmId = `CRM-${randomInt(10000, 99999)}`;
        crmStatus = status === LeadStatus.CONVERTED ? 'won' : 'in_progress';
        sentToCrmAt = new Date((scoredAt || createdAt).getTime() + randomInt(1, 12) * 60 * 60 * 1000);
      }

      const campaign = Math.random() > 0.3 ? randomElement(campaigns) : null;

      const lead = await prisma.lead.create({
        data: {
          name: `${firstName} ${lastName}`,
          email,
          phone: randomPhone(),
          message: randomElement(MESSAGES),
          source: randomElement(LEAD_SOURCES),
          status,
          companyId: company.id,
          campaignId: campaign?.id,
          enrichedData,
          enrichedAt,
          score,
          scoringReason,
          scoredAt,
          sentToCrm,
          crmId,
          crmStatus,
          sentToCrmAt,
          customFields: {
            utm_source: randomElement(['google', 'facebook', 'direct', 'email']),
            utm_medium: randomElement(['cpc', 'social', 'email', 'organic']),
            utm_campaign: campaign?.name || 'organic'
          }
        }
      });
      leads.push(lead);

      // Adicionar tags aleatórias a alguns leads
      if (Math.random() > 0.5) {
        const selectedTags = tags.sort(() => 0.5 - Math.random()).slice(0, randomInt(1, 3));
        await prisma.lead.update({
          where: { id: lead.id },
          data: {
            tags: {
              connect: selectedTags.map(tag => ({ id: tag.id }))
            }
          }
        });
      }

      // Criar atividades para o lead
      const activities = [];
      
      // Atividade de criação
      activities.push({
        type: 'creation',
        description: `Lead criado via ${lead.source}`,
        data: { source: lead.source },
        createdAt: lead.createdAt
      });

      // Atividade de enriquecimento
      if (enrichedAt) {
        activities.push({
          type: 'enrichment',
          description: 'Dados enriquecidos com sucesso',
          data: enrichedData,
          createdAt: enrichedAt
        });
      }

      // Atividade de scoring
      if (scoredAt) {
        activities.push({
          type: 'scoring',
          description: `Lead pontuado: ${score} pontos`,
          data: { score, reason: scoringReason },
          createdAt: scoredAt
        });
      }

      // Atividade de envio ao CRM
      if (sentToCrmAt) {
        activities.push({
          type: 'crm_sync',
          description: `Enviado para CRM: ${crmId}`,
          data: { crmId, crmStatus },
          createdAt: sentToCrmAt
        });
      }

      // Atividade de status change
      if (status !== LeadStatus.NEW) {
        activities.push({
          type: 'status_change',
          description: `Status alterado para: ${status}`,
          data: { status },
          createdAt: new Date(sentToCrmAt || scoredAt || enrichedAt || createdAt.getTime() + randomInt(1, 24) * 60 * 60 * 1000)
        });
      }

      // Criar todas as atividades
      for (const activity of activities) {
        await prisma.leadActivity.create({
          data: {
            type: activity.type,
            description: activity.description,
            data: activity.data,
            leadId: lead.id,
            createdAt: activity.createdAt
          }
        });
      }

      if ((i + 1) % 30 === 0) {
        console.log(`   ✅ ${i + 1} leads criados...`);
      }
    }
    console.log(`✅ Total de ${leads.length} leads criados\n`);

    // 7. Criar Agentes
    console.log('🤖 Criando agentes...');
    const agents = [];

    const agentConfigs = [
      {
        name: 'Assistente IA - Gemini',
        description: 'Assistente inteligente usando API do Google Gemini para análise e processamento de leads',
        type: AgentType.N8N,
        status: AgentStatus.ACTIVE
      },
      {
        name: 'Automação de Enriquecimento',
        description: 'Workflow automático para enriquecimento de leads',
        type: AgentType.AUTOMATION,
        status: AgentStatus.ACTIVE
      },
      {
        name: 'Scoring Automático',
        description: 'Agente que pontua leads automaticamente baseado em critérios de IA',
        type: AgentType.AUTOMATION,
        status: AgentStatus.ACTIVE
      },
      {
        name: 'Chatbot de Atendimento',
        description: 'Bot conversacional para atendimento inicial de leads',
        type: AgentType.CHATBOT,
        status: AgentStatus.ACTIVE
      }
    ];

    for (const agentConfig of agentConfigs) {
      const agent = await prisma.agent.create({
        data: {
          ...agentConfig,
          companyId: company.id,
          executionCount: randomInt(10, 500),
          lastExecutedAt: randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()),
          lastExecutionStatus: randomElement(['success', 'success', 'success', 'error']), // 75% success
          config: {
            provider: 'gemini',
            model: 'gemini-pro'
          },
          triggerConfig: {
            triggerType: 'webhook',
            events: ['lead.created', 'lead.enriched']
          }
        }
      });
      agents.push(agent);
      console.log(`✅ Agente criado: ${agent.name}`);
    }
    console.log(`✅ Total de ${agents.length} agentes criados\n`);

    // 8. Criar Métricas Diárias (últimos 90 dias)
    console.log('📊 Criando métricas diárias...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 90; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Calcular métricas baseadas nos leads criados nesse dia
      const dayLeads = leads.filter(lead => {
        const leadDate = new Date(lead.createdAt);
        leadDate.setHours(0, 0, 0, 0);
        return leadDate.getTime() === date.getTime();
      });

      const leadsReceived = dayLeads.length;
      const leadsEnriched = dayLeads.filter(l => l.enrichedAt).length;
      const leadsQualified = dayLeads.filter(l => l.status === LeadStatus.QUALIFIED).length;
      const leadsUnqualified = dayLeads.filter(l => l.status === LeadStatus.UNQUALIFIED).length;
      const leadsSentToCrm = dayLeads.filter(l => l.sentToCrm).length;
      const leadsConverted = dayLeads.filter(l => l.status === LeadStatus.CONVERTED).length;

      const scores = dayLeads.filter(l => l.score !== null).map(l => l.score!);
      const averageScore = scores.length > 0 
        ? scores.reduce((a, b) => a + b, 0) / scores.length 
        : null;

      // Calcular spend das campanhas ativas nesse dia
      const activeCampaigns = campaigns.filter(c => {
        const start = new Date(c.startDate);
        const end = c.endDate ? new Date(c.endDate) : new Date();
        return date >= start && date <= end;
      });
      const adSpend = activeCampaigns.reduce((sum, c) => sum + (c.spend / 90), 0); // Dividir spend total pelos dias

      const costPerLead = leadsReceived > 0 ? adSpend / leadsReceived : null;
      const costPerQualifiedLead = leadsQualified > 0 ? adSpend / leadsQualified : null;

      await prisma.dailyMetric.create({
        data: {
          date,
          companyId: company.id,
          leadsReceived: Math.max(leadsReceived, randomInt(0, 10)), // Garantir alguns leads mesmo em dias vazios
          leadsEnriched,
          leadsQualified,
          leadsUnqualified,
          leadsSentToCrm,
          leadsConverted,
          averageScore: averageScore || randomFloat(45, 75),
          adSpend: adSpend || randomFloat(100, 1000),
          costPerLead,
          costPerQualifiedLead
        }
      });

      if ((90 - i) % 30 === 0) {
        console.log(`   ✅ Métricas criadas para ${90 - i} dias...`);
      }
    }
    console.log(`✅ Métricas diárias criadas para 91 dias\n`);

    // 9. Criar alguns logs do sistema
    console.log('📋 Criando logs do sistema...');
    const logMessages = [
      'Sistema iniciado com sucesso',
      'Processamento de leads em lote concluído',
      'Integração RD Station sincronizada',
      'Agente de enriquecimento executado',
      'Workflow n8n processado',
      'Erro temporário na API do Facebook (resolvido)',
      'Backup automático realizado',
      'Nova campanha configurada',
      'Limpeza de leads antigos concluída'
    ];

    for (let i = 0; i < 50; i++) {
      const logDate = randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date());
      await prisma.systemLog.create({
        data: {
          level: randomElement(['info', 'info', 'info', 'warn', 'error']),
          message: randomElement(logMessages),
          context: {
            userId: randomElement(users).id,
            timestamp: logDate.toISOString()
          },
          createdAt: logDate
        }
      });
    }
    console.log(`✅ 50 logs do sistema criados\n`);

    // Resumo final
    console.log('═══════════════════════════════════════════════════════');
    console.log('✨ SEED CONCLUÍDO COM SUCESSO!');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('📊 Resumo dos dados criados:');
    console.log(`   🏢 Empresas: 1`);
    console.log(`   👥 Usuários: ${users.length}`);
    console.log(`   🔌 Integrações: ${integrations.length}`);
    console.log(`   📢 Campanhas: ${campaigns.length}`);
    console.log(`   📝 Leads: ${leads.length}`);
    console.log(`   🏷️  Tags: ${tags.length}`);
    console.log(`   🤖 Agentes: ${agents.length}`);
    console.log(`   📊 Métricas Diárias: 91 dias`);
    console.log(`   📋 Logs do Sistema: 50\n`);
    console.log('🔑 Credenciais de acesso:');
    console.log(`   Email: ceo@techsolutions.com`);
    console.log(`   Senha: Senha123!\n`);
    console.log('⚠️  IMPORTANTE: ADMIN não foi criado via seed.');
    console.log('   ADMINs devem ser criados apenas internamente pela equipe.\n');
    console.log('🎯 Próximos passos:');
    console.log('   1. Acesse o dashboard em http://localhost:3000');
    console.log('   2. Faça login com as credenciais acima');
    console.log('   3. Explore todos os dados fictícios criados!\n');

  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar seed
seedDemoData()
  .then(() => {
    console.log('✅ Processo finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
