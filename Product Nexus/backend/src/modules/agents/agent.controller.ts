import { Request, Response, NextFunction } from 'express';
import { AgentService } from './agent.service';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/auth';
import { AgentStatus } from '@prisma/client';
import { getCompanyIdForQuery, ensureCompanyAccess } from '../../utils/user-helper';

export class AgentController {
  private agentService: AgentService;

  constructor() {
    this.agentService = new AgentService();
  }

  listAgents = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        type,
        search,
        companyId: companyIdFromQuery
      } = req.query;

      // Obtém o companyId baseado no role do usuário
      const companyId = await getCompanyIdForQuery(req, companyIdFromQuery as string);

      const result = await this.agentService.listAgents({
        companyId,
        page: Number(page),
        limit: Number(limit),
        status: status as string,
        type: type as string,
        search: search as string
      });

      res.json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  getAgent = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const agent = await this.agentService.getAgentById(id);

      if (!agent) {
        throw new AppError('Agent not found', 404);
      }

      // Verifica se o usuário tem acesso a este agente
      await ensureCompanyAccess(req, agent.companyId);

      res.json({
        status: 'success',
        data: agent
      });
    } catch (error) {
      next(error);
    }
  };

  createAgent = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const agentData = req.body;
      
      // ADMIN pode criar agente para qualquer empresa (se passar companyId no body)
      // Outros usuários criam apenas para a própria empresa
      const companyId = await getCompanyIdForQuery(req, agentData.companyId);
      
      if (!companyId) {
        throw new AppError('Company ID is required', 400);
      }

      const agent = await this.agentService.createAgent({
        ...agentData,
        companyId
      });

      res.status(201).json({
        status: 'success',
        data: agent
      });
    } catch (error) {
      next(error);
    }
  };

  updateAgent = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Verifica acesso antes de atualizar
      const agent = await this.agentService.getAgentById(id);
      if (!agent) {
        throw new AppError('Agent not found', 404);
      }
      await ensureCompanyAccess(req, agent.companyId);

      const updatedAgent = await this.agentService.updateAgent(id, updateData);

      res.json({
        status: 'success',
        data: updatedAgent
      });
    } catch (error) {
      next(error);
    }
  };

  deleteAgent = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      // Verifica acesso antes de deletar
      const agent = await this.agentService.getAgentById(id);
      if (!agent) {
        throw new AppError('Agent not found', 404);
      }
      await ensureCompanyAccess(req, agent.companyId);

      await this.agentService.deleteAgent(id);

      res.json({
        status: 'success',
        message: 'Agent deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!Object.values(AgentStatus).includes(status)) {
        throw new AppError('Invalid status', 400);
      }

      // Verifica acesso antes de atualizar status
      const agent = await this.agentService.getAgentById(id);
      if (!agent) {
        throw new AppError('Agent not found', 404);
      }
      await ensureCompanyAccess(req, agent.companyId);

      const updatedAgent = await this.agentService.updateAgentStatus(id, status as AgentStatus);

      res.json({
        status: 'success',
        data: agent
      });
    } catch (error) {
      next(error);
    }
  };

  executeAgent = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const inputData = req.body; // Can include leadId, prompt, etc.

      const agent = await this.agentService.executeAgent(id, inputData);

      res.json({
        status: 'success',
        data: agent,
        message: 'Agent executed successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  chatWithAgent = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { message, conversation = [] } = req.body;

      if (!message || typeof message !== 'string') {
        throw new AppError('Message is required', 400);
      }

      const result = await this.agentService.chatWithAgent(message, conversation);

      res.json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };
}
