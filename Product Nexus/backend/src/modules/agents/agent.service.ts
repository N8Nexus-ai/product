import { PrismaClient, Agent, AgentStatus, AgentType } from '@prisma/client';
import { logger } from '../../utils/logger';
import { GeminiService } from '../../services/gemini.service';

const prisma = new PrismaClient();

interface ListAgentsParams {
  companyId: string;
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

    const where: any = { companyId };

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
}
