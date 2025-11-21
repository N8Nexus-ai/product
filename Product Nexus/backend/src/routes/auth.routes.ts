import { Router } from 'express';
import { AuthController } from '../modules/auth/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

/**
 * POST /api/auth/register
 * Register a new user/client
 */
router.post('/register', authController.register);

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', authController.login);

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', authenticate, authController.getCurrentUser);

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', authController.refreshToken);

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', authenticate, authController.logout);

export default router;

