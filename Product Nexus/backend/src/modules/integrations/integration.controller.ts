import { Request, Response, NextFunction } from 'express';
import { IntegrationService } from './integration.service';
import { AuthRequest } from '../../middleware/auth';

export class IntegrationController {
  private integrationService: IntegrationService;

  constructor() {
    this.integrationService = new IntegrationService();
  }

  listIntegrations = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const companyId = req.user?.id; // In real app, get from user's company

      if (!companyId) {
        return res.status(400).json({ error: 'Company ID required' });
      }

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
      const companyId = req.user?.id;
      const { apiToken, domain } = req.body;

      if (!companyId) {
        return res.status(400).json({ error: 'Company ID required' });
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
      const companyId = req.user?.id;
      const { accessToken } = req.body;

      if (!companyId) {
        return res.status(400).json({ error: 'Company ID required' });
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
      const companyId = req.user?.id;
      const { apiKey } = req.body;

      if (!companyId) {
        return res.status(400).json({ error: 'Company ID required' });
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
      const companyId = req.user?.id;
      const { clientId, clientSecret, username, password } = req.body;

      if (!companyId) {
        return res.status(400).json({ error: 'Company ID required' });
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

