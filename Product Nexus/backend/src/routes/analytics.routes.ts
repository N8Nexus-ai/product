import { Router } from 'express';
import { AnalyticsController } from '../modules/analytics/analytics.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const analyticsController = new AnalyticsController();

// Protected routes
router.use(authenticate);

/**
 * GET /api/analytics/dashboard
 * Get dashboard overview metrics
 */
router.get('/dashboard', analyticsController.getDashboardMetrics);

/**
 * GET /api/analytics/funnel
 * Get conversion funnel data
 */
router.get('/funnel', analyticsController.getFunnelData);

/**
 * GET /api/analytics/sources
 * Get lead sources performance
 */
router.get('/sources', analyticsController.getSourcesPerformance);

/**
 * GET /api/analytics/roi
 * Get ROI calculations
 */
router.get('/roi', analyticsController.getROI);

/**
 * GET /api/analytics/lead-quality
 * Get lead quality metrics
 */
router.get('/lead-quality', analyticsController.getLeadQuality);

/**
 * GET /api/analytics/timeline
 * Get timeline data (daily/weekly/monthly)
 */
router.get('/timeline', analyticsController.getTimelineData);

export default router;

