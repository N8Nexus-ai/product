import { Request, Response, NextFunction } from 'express';
import { WebhookService } from './webhook.service';
import { logger } from '../../utils/logger';

export class WebhookController {
  private webhookService: WebhookService;

  constructor() {
    this.webhookService = new WebhookService();
  }

  handleFacebookAds = async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info('Received webhook from Facebook Ads');
      
      const leadData = req.body;
      
      const lead = await this.webhookService.processFacebookAdsLead(leadData);

      res.json({
        status: 'success',
        data: lead
      });
    } catch (error) {
      logger.error('Error processing Facebook Ads webhook:', error);
      next(error);
    }
  };

  handleGoogleAds = async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info('Received webhook from Google Ads');
      
      const leadData = req.body;
      
      const lead = await this.webhookService.processGoogleAdsLead(leadData);

      res.json({
        status: 'success',
        data: lead
      });
    } catch (error) {
      logger.error('Error processing Google Ads webhook:', error);
      next(error);
    }
  };

  handleLinkedInAds = async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info('Received webhook from LinkedIn Ads');
      
      const leadData = req.body;
      
      const lead = await this.webhookService.processLinkedInAdsLead(leadData);

      res.json({
        status: 'success',
        data: lead
      });
    } catch (error) {
      logger.error('Error processing LinkedIn Ads webhook:', error);
      next(error);
    }
  };

  handleTypeform = async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info('Received webhook from Typeform');
      
      const leadData = req.body;
      
      const lead = await this.webhookService.processTypeformLead(leadData);

      res.json({
        status: 'success',
        data: lead
      });
    } catch (error) {
      logger.error('Error processing Typeform webhook:', error);
      next(error);
    }
  };

  handleLandingPage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info('Received webhook from Landing Page');
      
      const leadData = req.body;
      
      const lead = await this.webhookService.processLandingPageLead(leadData);

      res.json({
        status: 'success',
        data: lead
      });
    } catch (error) {
      logger.error('Error processing Landing Page webhook:', error);
      next(error);
    }
  };

  handleN8n = async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info('Received webhook from n8n');
      
      const data = req.body;
      
      const result = await this.webhookService.processN8nWebhook(data);

      res.json({
        status: 'success',
        data: result
      });
    } catch (error) {
      logger.error('Error processing n8n webhook:', error);
      next(error);
    }
  };

  verifyFacebookWebhook = (req: Request, res: Response) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN || 'nexus_verify_token';

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      logger.info('Facebook webhook verified');
      res.status(200).send(challenge);
    } else {
      logger.warn('Facebook webhook verification failed');
      res.sendStatus(403);
    }
  };
}

