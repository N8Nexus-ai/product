import { PrismaClient, Agent, AgentStatus, AgentType } from '@prisma/client';
import { logger } from '../../utils/logger';
import { GeminiService } from '../../services/gemini.service';

const prisma = new PrismaClient();

interface ListAgentsParams {
  companyId?: string; // Opcional: undefined = ver todos (ADMIN), string = filtrar por empresa
  page: number;
  limit: number;
  status?: string;
  type?: string;
  search?: string;
}

interface CreateAgentData {
  name: string;
  description?: string;
  type?: AgentType | string;
  config?: any;
  triggerConfig?: any;
  n8nWorkflowId?: string;
  n8nWebhookUrl?: string;
  companyId: string;
}

export class AgentService {
  private geminiService: GeminiService;

  constructor() {
    this.geminiService = new GeminiService();
  }

  async listAgents(params: ListAgentsParams) {
    const { companyId, page, limit, status, type, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    // Se companyId for fornecido, filtra por ele (ADMIN pode ver todos se não fornecer)
    if (companyId) {
      where.companyId = companyId;
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [agents, total] = await Promise.all([
      prisma.agent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          company: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),
      prisma.agent.count({ where })
    ]);

    return {
      agents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getAgentById(id: string) {
    return prisma.agent.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            industry: true
          }
        }
      }
    });
  }

  async createAgent(data: CreateAgentData) {
    const agent = await prisma.agent.create({
      data: {
        name: data.name,
        description: data.description,
        type: (data.type as AgentType) || AgentType.N8N,
        status: AgentStatus.INACTIVE,
        config: data.config || {},
        triggerConfig: data.triggerConfig || {},
        n8nWorkflowId: data.n8nWorkflowId,
        n8nWebhookUrl: data.n8nWebhookUrl,
        companyId: data.companyId
      }
    });

    logger.info(`Agent ${agent.id} created: ${agent.name}`);

    return agent;
  }

  async updateAgent(id: string, data: Partial<CreateAgentData>) {
    const agent = await prisma.agent.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        config: data.config,
        triggerConfig: data.triggerConfig,
        n8nWorkflowId: data.n8nWorkflowId,
        n8nWebhookUrl: data.n8nWebhookUrl,
        status: data.status as AgentStatus
      }
    });

    logger.info(`Agent ${id} updated`);

    return agent;
  }

  async deleteAgent(id: string) {
    await prisma.agent.delete({
      where: { id }
    });

    logger.info(`Agent ${id} deleted`);
  }

  async updateAgentStatus(id: string, status: AgentStatus) {
    const agent = await prisma.agent.update({
      where: { id },
      data: { status }
    });

    logger.info(`Agent ${id} status updated to ${status}`);

    return agent;
  }

  async executeAgent(id: string, inputData?: any) {
    const agent = await prisma.agent.findUnique({
      where: { id }
    });

    if (!agent) {
      throw new Error('Agent not found');
    }

    if (agent.status !== AgentStatus.ACTIVE) {
      throw new Error(`Agent is not active. Current status: ${agent.status}`);
    }

    // Update execution stats
    const updatedAgent = await prisma.agent.update({
      where: { id },
      data: {
        executionCount: agent.executionCount + 1,
        lastExecutedAt: new Date(),
        lastExecutionStatus: 'running'
      }
    });

    logger.info(`Executing agent ${id} (${agent.name})`);

    try {
      let result: any = null;

      // Check if agent uses Gemini
      const config = agent.config as any;
      if (config?.provider === 'gemini') {
        // Execute Gemini-based agent
        if (inputData && inputData.leadId) {
          // Analyze lead
          const lead = await prisma.lead.findUnique({
            where: { id: inputData.leadId },
            include: { company: true }
          });

          if (lead) {
            logger.info(`Analyzing lead ${lead.id} with Gemini`);
            const analysis = await this.geminiService.analyzeLead(lead);
            result = analysis;
          }
        } else {
          // Simple text generation test
          const prompt = inputData?.prompt || 'Olá! Você está funcionando?';
          logger.info(`Testing Gemini with prompt: ${prompt}`);
          const response = await this.geminiService.generateText(prompt, {
            model: config.model || 'gemini-pro',
            temperature: config.temperature || 0.7,
            maxTokens: config.maxTokens || 2048,
            systemInstruction: config.instructions
          });
          result = { response };
        }
      }

      // Update agent with success status
      await prisma.agent.update({
        where: { id },
        data: {
          lastExecutionStatus: 'success'
        }
      });

      logger.info(`Agent ${id} executed successfully`);

      return {
        ...updatedAgent,
        executionResult: result
      };
    } catch (error: any) {
      logger.error(`Error executing agent ${id}:`, error);

      // Update agent with error status
      await prisma.agent.update({
        where: { id },
        data: {
          lastExecutionStatus: 'error'
        }
      });

      throw new Error(`Agent execution failed: ${error.message}`);
    }
  }

  async chatWithAgent(message: string, conversation: Array<{ role: string; content: string }> = []) {
    try {
      // Buscar o agente assistente padrão ativo (buscar todos e filtrar depois)
      const agents = await prisma.agent.findMany({
        where: {
          status: AgentStatus.ACTIVE
        },
        orderBy: { createdAt: 'desc' }
      });

      // Encontrar agente com provider gemini
      const agent = agents.find((a: any) => {
        const config = a.config as any;
        return config?.provider === 'gemini';
      });

      if (!agent) {
        throw new Error('No active assistant agent found');
      }

      const config = agent.config as any;

      // Construir o contexto da conversa
      let prompt = message;
      
      if (conversation.length > 0) {
        // Construir histórico de conversa para contexto
        const conversationHistory = conversation
          .slice(-5) // Últimas 5 mensagens para contexto
          .map(msg => {
            const role = msg.role === 'user' ? 'Usuário' : 'Assistente';
            return `${role}: ${msg.content}`;
          })
          .join('\n');
        
        prompt = `${conversationHistory}\nUsuário: ${message}\nAssistente:`;
      }

      logger.info(`Chat with agent ${agent.id}: ${message.substring(0, 50)}...`);

      // Gerar resposta usando Gemini
      const response = await this.geminiService.generateText(prompt, {
        model: config?.model || 'gemini-pro',
        temperature: config?.temperature || 0.7,
        maxTokens: config?.maxTokens || 2048,
        systemInstruction: config?.instructions || 'Você é um assistente útil e profissional. Responda sempre em português brasileiro de forma clara e objetiva.'
      });

      return {
        response: response.trim(),
        agentId: agent.id,
        agentName: agent.name
      };
    } catch (error: any) {
      logger.error('Error in chat with agent:', error);
      throw new Error(`Failed to chat with agent: ${error.message}`);
    }
  }
}
