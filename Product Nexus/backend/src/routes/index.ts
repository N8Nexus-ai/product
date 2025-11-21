import { Router } from 'express';
import leadsRouter from './leads.routes';
import webhooksRouter from './webhooks.routes';
import analyticsRouter from './analytics.routes';
import integrationsRouter from './integrations.routes';
import agentsRouter from './agents.routes';
import authRouter from './auth.routes';
import usersRouter from './users.routes';
import companiesRouter from './companies.routes';

const router = Router();

// API version info
router.get('/', (req, res) => {
  res.json({
    name: 'Nexus Sales OS API',
    version: '1.0.0',
    status: 'active',
      endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      companies: '/api/companies',
      leads: '/api/leads',
      webhooks: '/api/webhooks',
      analytics: '/api/analytics',
      integrations: '/api/integrations',
      agents: '/api/agents'
    }
  });
});

// Mount routes
router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/companies', companiesRouter);
router.use('/leads', leadsRouter);
router.use('/webhooks', webhooksRouter);
router.use('/analytics', analyticsRouter);
router.use('/integrations', integrationsRouter);
router.use('/agents', agentsRouter);

export default router;

