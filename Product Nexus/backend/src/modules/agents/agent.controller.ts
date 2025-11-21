import { Request, Response, NextFunction } from 'express';
import { AgentService } from './agent.service';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/auth';
import { AgentStatus } from '@prisma/client';

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
        search
      } = req.query;

      const companyId = req.user?.id; // In real app, get from user's company

      if (!companyId) {
        throw new AppError('Company ID not found', 400);
      }

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
      const companyId = req.user?.id; // In real app, get from user's company

      if (!companyId) {
        throw new AppError('Company ID not found', 400);
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

      const agent = await this.agentService.updateAgent(id, updateData);

      res.json({
        status: 'success',
        data: agent
      });
    } catch (error) {
      next(error);
    }
  };

  deleteAgent = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

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

      const agent = await this.agentService.updateAgentStatus(id, status as AgentStatus);

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
}
