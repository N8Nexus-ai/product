import { Router } from 'express';
import { WebhookController } from '../modules/webhooks/webhook.controller';

const router = Router();
const webhookController = new WebhookController();

/**
 * POST /api/webhooks/facebook-ads
 * Receive leads from Facebook Ads
 */
router.post('/facebook-ads', webhookController.handleFacebookAds);

/**
 * POST /api/webhooks/google-ads
 * Receive leads from Google Ads
 */
router.post('/google-ads', webhookController.handleGoogleAds);

/**
 * POST /api/webhooks/linkedin-ads
 * Receive leads from LinkedIn Ads
 */
router.post('/linkedin-ads', webhookController.handleLinkedInAds);

/**
 * POST /api/webhooks/typeform
 * Receive leads from Typeform
 */
router.post('/typeform', webhookController.handleTypeform);

/**
 * POST /api/webhooks/landing-page
 * Generic webhook for landing pages
 */
router.post('/landing-page', webhookController.handleLandingPage);

/**
 * POST /api/webhooks/n8n
 * Receive data from n8n workflows
 */
router.post('/n8n', webhookController.handleN8n);

/**
 * GET /api/webhooks/facebook-ads/verify
 * Facebook webhook verification
 */
router.get('/facebook-ads/verify', webhookController.verifyFacebookWebhook);

export default router;

