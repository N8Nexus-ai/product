import { PrismaClient, LeadStatus } from '@prisma/client';
import { LeadService } from '../leads/lead.service';
import { logger } from '../../utils/logger';

const prisma = new PrismaClient();

export class WebhookService {
  private leadService: LeadService;

  constructor() {
    this.leadService = new LeadService();
  }

  async processFacebookAdsLead(data: any) {
    logger.info('Processing Facebook Ads lead');

    // Extract lead data from Facebook webhook format
    const leadData = {
      name: data.field_data?.find((f: any) => f.name === 'full_name')?.values[0] || 
            data.field_data?.find((f: any) => f.name === 'first_name')?.values[0],
      email: data.field_data?.find((f: any) => f.name === 'email')?.values[0],
      phone: data.field_data?.find((f: any) => f.name === 'phone_number')?.values[0],
      message: data.field_data?.find((f: any) => f.name === 'message')?.values[0],
      source: 'facebook',
      customFields: data.field_data || {},
      companyId: data.companyId || await this.getDefaultCompanyId(),
      campaignId: data.campaign_id
    };

    return this.leadService.createLead(leadData);
  }

  async processGoogleAdsLead(data: any) {
    logger.info('Processing Google Ads lead');

    const leadData = {
      name: data.name || data.fullName,
      email: data.email,
      phone: data.phone || data.phoneNumber,
      message: data.message || data.comments,
      source: 'google',
      customFields: data,
      companyId: data.companyId || await this.getDefaultCompanyId(),
      campaignId: data.campaignId
    };

    return this.leadService.createLead(leadData);
  }

  async processLinkedInAdsLead(data: any) {
    logger.info('Processing LinkedIn Ads lead');

    const leadData = {
      name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      email: data.emailAddress,
      phone: data.phoneNumber,
      message: data.message,
      source: 'linkedin',
      customFields: {
        ...data,
        company: data.companyName,
        jobTitle: data.jobTitle
      },
      companyId: data.companyId || await this.getDefaultCompanyId(),
      campaignId: data.campaignId
    };

    return this.leadService.createLead(leadData);
  }

  async processTypeformLead(data: any) {
    logger.info('Processing Typeform lead');

    // Extract answers from Typeform webhook
    const answers = data.form_response?.answers || [];
    
    const getName = () => {
      const nameField = answers.find((a: any) => 
        a.type === 'text' && (a.field.ref?.includes('name') || a.field.title?.toLowerCase().includes('name'))
      );
      return nameField?.text;
    };

    const getEmail = () => {
      const emailField = answers.find((a: any) => a.type === 'email');
      return emailField?.email;
    };

    const getPhone = () => {
      const phoneField = answers.find((a: any) => 
        a.type === 'phone_number' || (a.type === 'text' && a.field.title?.toLowerCase().includes('phone'))
      );
      return phoneField?.phone_number || phoneField?.text;
    };

    const leadData = {
      name: getName(),
      email: getEmail(),
      phone: getPhone(),
      source: 'typeform',
      customFields: {
        formId: data.form_response?.form_id,
        answers
      },
      companyId: data.companyId || await this.getDefaultCompanyId()
    };

    return this.leadService.createLead(leadData);
  }

  async processLandingPageLead(data: any) {
    logger.info('Processing Landing Page lead');

    const leadData = {
      name: data.name || data.fullName,
      email: data.email,
      phone: data.phone || data.phoneNumber,
      message: data.message || data.comments,
      source: data.source || 'landing-page',
      customFields: data,
      companyId: data.companyId || await this.getDefaultCompanyId()
    };

    return this.leadService.createLead(leadData);
  }

  async processN8nWebhook(data: any) {
    logger.info('Processing n8n webhook');

    // n8n can send various types of data
    const { type, payload } = data;

    switch (type) {
      case 'lead':
        return this.processLandingPageLead(payload);
      
      case 'enrichment_result':
        return this.handleEnrichmentResult(payload);
      
      case 'scoring_result':
        return this.handleScoringResult(payload);
      
      default:
        logger.warn(`Unknown n8n webhook type: ${type}`);
        return { received: true, type };
    }
  }

  private async handleEnrichmentResult(payload: any) {
    const { leadId, enrichedData } = payload;

    if (!leadId) {
      throw new Error('Lead ID is required');
    }

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        enrichedData,
        enrichedAt: new Date(),
        status: LeadStatus.ENRICHED
      }
    });

    logger.info(`Enrichment result updated for lead ${leadId}`);

    return { updated: true, leadId };
  }

  private async handleScoringResult(payload: any) {
    const { leadId, score, reason } = payload;

    if (!leadId) {
      throw new Error('Lead ID is required');
    }

    const isQualified = score >= 60;

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        score,
        scoringReason: reason,
        scoredAt: new Date(),
        status: isQualified ? LeadStatus.QUALIFIED : LeadStatus.UNQUALIFIED
      }
    });

    logger.info(`Scoring result updated for lead ${leadId}: ${score}/100`);

    return { updated: true, leadId, score, qualified: isQualified };
  }

  private async getDefaultCompanyId(): Promise<string> {
    // In production, this should be determined by the webhook source or API key
    const company = await prisma.company.findFirst({
      where: { active: true },
      orderBy: { createdAt: 'asc' }
    });

    if (!company) {
      throw new Error('No active company found');
    }

    return company.id;
  }
}

