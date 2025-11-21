import { Router } from 'express';
import { LeadController } from '../modules/leads/lead.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const leadController = new LeadController();

// Protected routes (require authentication)
router.use(authenticate);

/**
 * GET /api/leads
 * List all leads with pagination and filters
 */
router.get('/', leadController.listLeads);

/**
 * GET /api/leads/:id
 * Get a single lead by ID
 */
router.get('/:id', leadController.getLead);

/**
 * POST /api/leads
 * Create a new lead manually
 */
router.post('/', leadController.createLead);

/**
 * PUT /api/leads/:id
 * Update a lead
 */
router.put('/:id', leadController.updateLead);

/**
 * DELETE /api/leads/:id
 * Delete a lead
 */
router.delete('/:id', leadController.deleteLead);

/**
 * POST /api/leads/:id/enrich
 * Manually trigger enrichment for a lead
 */
router.post('/:id/enrich', leadController.enrichLead);

/**
 * POST /api/leads/:id/score
 * Manually trigger AI scoring for a lead
 */
router.post('/:id/score', leadController.scoreLead);

/**
 * POST /api/leads/:id/send-to-crm
 * Manually send a lead to CRM
 */
router.post('/:id/send-to-crm', leadController.sendToCrm);

export default router;

