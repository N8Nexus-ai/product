import { Request, Response, NextFunction } from 'express';
import { LeadService } from './lead.service';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/auth';
import { getCompanyIdForQuery, ensureCompanyAccess } from '../../utils/user-helper';

export class LeadController {
  private leadService: LeadService;

  constructor() {
    this.leadService = new LeadService();
  }

  listLeads = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        source,
        search,
        companyId: companyIdFromQuery // ADMIN pode passar companyId no query para filtrar
      } = req.query;

      // Obtém o companyId baseado no role do usuário
      // ADMIN: undefined (ver todos) ou o companyId do query (se fornecido)
      // Outros: companyId do próprio usuário
      const companyId = await getCompanyIdForQuery(req, companyIdFromQuery as string);

      const result = await this.leadService.listLeads({
        companyId,
        page: Number(page),
        limit: Number(limit),
        status: status as string,
        source: source as string,
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

  getLead = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const lead = await this.leadService.getLeadById(id);

      if (!lead) {
        throw new AppError('Lead not found', 404);
      }

      // Verifica se o usuário tem acesso a este lead (valida companyId)
      await ensureCompanyAccess(req, lead.companyId);

      res.json({
        status: 'success',
        data: lead
      });
    } catch (error) {
      next(error);
    }
  };

  createLead = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const leadData = req.body;
      
      // ADMIN pode criar lead para qualquer empresa (se passar companyId no body)
      // Outros usuários criam apenas para a própria empresa
      const companyId = await getCompanyIdForQuery(req, leadData.companyId);
      
      if (!companyId) {
        throw new AppError('Company ID is required', 400);
      }

      const lead = await this.leadService.createLead({
        ...leadData,
        companyId
      });

      res.status(201).json({
        status: 'success',
        data: lead
      });
    } catch (error) {
      next(error);
    }
  };

  updateLead = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const lead = await this.leadService.updateLead(id, updateData);

      res.json({
        status: 'success',
        data: lead
      });
    } catch (error) {
      next(error);
    }
  };

  deleteLead = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      await this.leadService.deleteLead(id);

      res.json({
        status: 'success',
        message: 'Lead deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  enrichLead = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const lead = await this.leadService.enrichLead(id);

      res.json({
        status: 'success',
        data: lead,
        message: 'Lead enrichment triggered'
      });
    } catch (error) {
      next(error);
    }
  };

  scoreLead = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const lead = await this.leadService.scoreLead(id);

      res.json({
        status: 'success',
        data: lead,
        message: 'Lead scoring triggered'
      });
    } catch (error) {
      next(error);
    }
  };

  sendToCrm = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { crmType } = req.body;

      const lead = await this.leadService.sendToCrm(id, crmType);

      res.json({
        status: 'success',
        data: lead,
        message: 'Lead sent to CRM'
      });
    } catch (error) {
      next(error);
    }
  };
}

