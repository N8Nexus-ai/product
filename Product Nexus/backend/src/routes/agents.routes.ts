import { Router } from 'express';
import { AgentController } from '../modules/agents/agent.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const agentController = new AgentController();

// Protected routes (require authentication)
router.use(authenticate);

/**
 * GET /api/agents
 * List all agents with pagination and filters
 */
router.get('/', agentController.listAgents);

/**
 * GET /api/agents/:id
 * Get a single agent by ID
 */
router.get('/:id', agentController.getAgent);

/**
 * POST /api/agents
 * Create a new agent
 */
router.post('/', agentController.createAgent);

/**
 * PUT /api/agents/:id
 * Update an agent
 */
router.put('/:id', agentController.updateAgent);

/**
 * DELETE /api/agents/:id
 * Delete an agent
 */
router.delete('/:id', agentController.deleteAgent);

/**
 * PATCH /api/agents/:id/status
 * Update agent status (active/inactive/paused/error)
 */
router.patch('/:id/status', agentController.updateStatus);

/**
 * POST /api/agents/:id/execute
 * Trigger agent execution
 */
router.post('/:id/execute', agentController.executeAgent);

export default router;
