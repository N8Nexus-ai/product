import { Request, Response, NextFunction } from 'express';
import { IntegrationService } from './integration.service';
import { AuthRequest } from '../../middleware/auth';
import { getCompanyIdForQuery } from '../../utils/user-helper';

export class IntegrationController {
  private integrationService: IntegrationService;

  constructor() {
    this.integrationService = new IntegrationService();
  }

  listIntegrations = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { companyId: companyIdFromQuery } = req.query;

      // Obtém o companyId baseado no role do usuário
      const companyId = await getCompanyIdForQuery(req, companyIdFromQuery as string);

      const integrations = await this.integrationService.listIntegrations(companyId);

      res.json({
        status: 'success',
        data: integrations
      });
    } catch (error) {
      next(error);
    }
  };

  configurePipedrive = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { apiToken, domain } = req.body;
      
      // ADMIN pode configurar integração para qualquer empresa (se passar companyId no body)
      // Outros usuários configuram apenas para a própria empresa
      const companyId = await getCompanyIdForQuery(req, req.body.companyId);
      
      if (!companyId) {
        return res.status(400).json({ error: 'Company ID is required' });
      }

      const integration = await this.integrationService.configureIntegration(
        companyId,
        'CRM_PIPEDRIVE',
        'Pipedrive',
        { apiToken, domain }
      );

      res.json({
        status: 'success',
        data: integration
      });
    } catch (error) {
      next(error);
    }
  };

  configureRDStation = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { accessToken } = req.body;
      const companyId = await getCompanyIdForQuery(req, req.body.companyId);
      
      if (!companyId) {
        return res.status(400).json({ error: 'Company ID is required' });
      }

      const integration = await this.integrationService.configureIntegration(
        companyId,
        'CRM_RD_STATION',
        'RD Station',
        { accessToken }
      );

      res.json({
        status: 'success',
        data: integration
      });
    } catch (error) {
      next(error);
    }
  };

  configureHubSpot = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { apiKey } = req.body;
      const companyId = await getCompanyIdForQuery(req, req.body.companyId);
      
      if (!companyId) {
        return res.status(400).json({ error: 'Company ID is required' });
      }

      const integration = await this.integrationService.configureIntegration(
        companyId,
        'CRM_HUBSPOT',
        'HubSpot',
        { apiKey }
      );

      res.json({
        status: 'success',
        data: integration
      });
    } catch (error) {
      next(error);
    }
  };

  configureSalesforce = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { clientId, clientSecret, username, password } = req.body;
      const companyId = await getCompanyIdForQuery(req, req.body.companyId);
      
      if (!companyId) {
        return res.status(400).json({ error: 'Company ID is required' });
      }

      const integration = await this.integrationService.configureIntegration(
        companyId,
        'CRM_SALESFORCE',
        'Salesforce',
        { clientId, clientSecret, username, password }
      );

      res.json({
        status: 'success',
        data: integration
      });
    } catch (error) {
      next(error);
    }
  };

  testIntegration = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { integrationId } = req.body;

      if (!integrationId) {
        return res.status(400).json({ error: 'Integration ID required' });
      }

      const result = await this.integrationService.testIntegration(integrationId);

      res.json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  removeIntegration = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      await this.integrationService.removeIntegration(id);

      res.json({
        status: 'success',
        message: 'Integration removed successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}

