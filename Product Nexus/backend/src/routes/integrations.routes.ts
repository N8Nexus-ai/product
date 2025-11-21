import { Router } from 'express';
import { IntegrationController } from '../modules/integrations/integration.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const integrationController = new IntegrationController();

// Protected routes
router.use(authenticate);

/**
 * GET /api/integrations
 * List all configured integrations
 */
router.get('/', integrationController.listIntegrations);

/**
 * POST /api/integrations/crm/pipedrive
 * Configure Pipedrive integration
 */
router.post('/crm/pipedrive', integrationController.configurePipedrive);

/**
 * POST /api/integrations/crm/rd-station
 * Configure RD Station integration
 */
router.post('/crm/rd-station', integrationController.configureRDStation);

/**
 * POST /api/integrations/crm/hubspot
 * Configure HubSpot integration
 */
router.post('/crm/hubspot', integrationController.configureHubSpot);

/**
 * POST /api/integrations/crm/salesforce
 * Configure Salesforce integration
 */
router.post('/crm/salesforce', integrationController.configureSalesforce);

/**
 * POST /api/integrations/test
 * Test an integration
 */
router.post('/test', integrationController.testIntegration);

/**
 * DELETE /api/integrations/:id
 * Remove an integration
 */
router.delete('/:id', integrationController.removeIntegration);

export default router;

