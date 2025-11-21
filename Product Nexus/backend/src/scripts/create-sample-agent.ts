import { PrismaClient, AgentType, AgentStatus } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function createSampleAgent() {
  try {
    // Buscar a primeira empresa ativa
    const company = await prisma.company.findFirst({
      where: { active: true },
      orderBy: { createdAt: 'asc' }
    });

    if (!company) {
      console.error('❌ Nenhuma empresa encontrada. Crie uma empresa primeiro.');
      process.exit(1);
    }

    console.log(`📋 Empresa encontrada: ${company.name} (${company.id})`);

    // Verificar se já existe um agente com esse nome
    const existingAgent = await prisma.agent.findFirst({
      where: {
        name: 'Assistente IA - Gemini',
        companyId: company.id
      }
    });

    if (existingAgent) {
      console.log('✅ Agente "Assistente IA - Gemini" já existe!');
      console.log(JSON.stringify(existingAgent, null, 2));
      return;
    }

    // Criar o agente assistente
    const agent = await prisma.agent.create({
      data: {
        name: 'Assistente IA - Gemini',
        description: 'Assistente inteligente usando API do Google Gemini para análise e processamento de leads. Pode ser integrado com n8n para automações.',
        type: AgentType.N8N,
        status: AgentStatus.ACTIVE,
        companyId: company.id,
        config: {
          provider: 'gemini',
          model: 'gemini-pro',
          temperature: 0.7,
          maxTokens: 2048,
          instructions: 'Você é um assistente especializado em análise de leads e vendas.'
        },
        triggerConfig: {
          triggerType: 'webhook',
          events: ['lead.created', 'lead.enriched'],
          conditions: {
            minScore: 60
          }
        },
        n8nWorkflowId: null,
        n8nWebhookUrl: null,
        executionCount: 0
      },
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log('✅ Agente criado com sucesso!');
    console.log('\n📊 Detalhes do Agente:');
    console.log(`   ID: ${agent.id}`);
    console.log(`   Nome: ${agent.name}`);
    console.log(`   Descrição: ${agent.description}`);
    console.log(`   Tipo: ${agent.type}`);
    console.log(`   Status: ${agent.status}`);
    console.log(`   Empresa: ${agent.company.name}`);
    console.log(`   Criado em: ${agent.createdAt}`);
    console.log('\n🎯 Você pode visualizar este agente no dashboard em /dashboard/agents');
  } catch (error) {
    console.error('❌ Erro ao criar agente:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleAgent();
