import { PrismaClient, Lead, LeadStatus } from '@prisma/client';
import { EnrichmentService } from '../../services/enrichment.service';
import { ScoringService } from '../../services/scoring.service';
import { CRMService } from '../../services/crm.service';
import { logger } from '../../utils/logger';

const prisma = new PrismaClient();

interface ListLeadsParams {
  companyId: string;
  page: number;
  limit: number;
  status?: string;
  source?: string;
  search?: string;
}

export class LeadService {
  private enrichmentService: EnrichmentService;
  private scoringService: ScoringService;
  private crmService: CRMService;

  constructor() {
    this.enrichmentService = new EnrichmentService();
    this.scoringService = new ScoringService();
    this.crmService = new CRMService();
  }

  async listLeads(params: ListLeadsParams) {
    const { companyId, page, limit, status, source, search } = params;
    const skip = (page - 1) * limit;

    const where: any = { companyId };

    if (status) {
      where.status = status;
    }

    if (source) {
      where.source = source;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          campaign: true,
          activities: {
            take: 5,
            orderBy: { createdAt: 'desc' }
          },
          tags: true
        }
      }),
      prisma.lead.count({ where })
    ]);

    return {
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getLeadById(id: string) {
    return prisma.lead.findUnique({
      where: { id },
      include: {
        campaign: true,
        activities: {
          orderBy: { createdAt: 'desc' }
        },
        tags: true,
        company: {
          select: {
            id: true,
            name: true,
            industry: true
          }
        }
      }
    });
  }

  async createLead(data: any) {
    const lead = await prisma.lead.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        source: data.source || 'manual',
        customFields: data.customFields || {},
        status: LeadStatus.NEW,
        companyId: data.companyId,
        campaignId: data.campaignId
      }
    });

    // Create activity
    await this.createActivity(lead.id, 'lead_created', 'Lead created manually');

    // Trigger enrichment and scoring in background
    this.processLeadAsync(lead.id);

    return lead;
  }

  async updateLead(id: string, data: any) {
    const lead = await prisma.lead.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        status: data.status,
        customFields: data.customFields
      }
    });

    await this.createActivity(id, 'lead_updated', 'Lead updated');

    return lead;
  }

  async deleteLead(id: string) {
    return prisma.lead.delete({
      where: { id }
    });
  }

  async enrichLead(id: string) {
    const lead = await prisma.lead.findUnique({ where: { id } });

    if (!lead) {
      throw new Error('Lead not found');
    }

    // Update status
    await prisma.lead.update({
      where: { id },
      data: { status: LeadStatus.ENRICHING }
    });

    await this.createActivity(id, 'enrichment_started', 'Enrichment process started');

    try {
      const enrichedData = await this.enrichmentService.enrichLead(lead);

      const updatedLead = await prisma.lead.update({
        where: { id },
        data: {
          enrichedData,
          enrichedAt: new Date(),
          status: LeadStatus.ENRICHED
        }
      });

      await this.createActivity(id, 'enrichment_completed', 'Lead enrichment completed', {
        enrichedFields: Object.keys(enrichedData)
      });

      logger.info(`Lead ${id} enriched successfully`);

      // Trigger scoring after enrichment
      await this.scoreLead(id);

      return updatedLead;
    } catch (error) {
      logger.error(`Error enriching lead ${id}:`, error);
      
      await prisma.lead.update({
        where: { id },
        data: { status: LeadStatus.NEW }
      });

      await this.createActivity(id, 'enrichment_failed', 'Lead enrichment failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  async scoreLead(id: string) {
    const lead = await prisma.lead.findUnique({ 
      where: { id },
      include: { company: true }
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    await prisma.lead.update({
      where: { id },
      data: { status: LeadStatus.SCORING }
    });

    await this.createActivity(id, 'scoring_started', 'AI scoring started');

    try {
      const scoringResult = await this.scoringService.scoreLead(lead);

      const isQualified = scoringResult.score >= 60; // Threshold

      const updatedLead = await prisma.lead.update({
        where: { id },
        data: {
          score: scoringResult.score,
          scoringReason: scoringResult.reason,
          scoredAt: new Date(),
          status: isQualified ? LeadStatus.QUALIFIED : LeadStatus.UNQUALIFIED
        }
      });

      await this.createActivity(id, 'scoring_completed', 
        `Lead scored: ${scoringResult.score}/100 - ${isQualified ? 'Qualified' : 'Unqualified'}`,
        { score: scoringResult.score, reason: scoringResult.reason }
      );

      logger.info(`Lead ${id} scored: ${scoringResult.score}/100`);

      // If qualified, send to CRM
      if (isQualified) {
        await this.sendToCrm(id);
      }

      return updatedLead;
    } catch (error) {
      logger.error(`Error scoring lead ${id}:`, error);
      
      await this.createActivity(id, 'scoring_failed', 'AI scoring failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  async sendToCrm(id: string, crmType?: string) {
    const lead = await prisma.lead.findUnique({ 
      where: { id },
      include: { 
        company: {
          include: {
            integrations: {
              where: {
                active: true,
                type: crmType ? crmType as any : undefined
              }
            }
          }
        }
      }
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    if (lead.sentToCrm) {
      logger.warn(`Lead ${id} already sent to CRM`);
      return lead;
    }

    const crmIntegration = lead.company.integrations[0];

    if (!crmIntegration) {
      throw new Error('No active CRM integration found');
    }

    await this.createActivity(id, 'crm_sync_started', `Sending to ${crmIntegration.type}`);

    try {
      const crmResult = await this.crmService.sendLeadToCRM(lead, crmIntegration);

      const updatedLead = await prisma.lead.update({
        where: { id },
        data: {
          sentToCrm: true,
          crmId: crmResult.crmId,
          crmStatus: crmResult.status,
          sentToCrmAt: new Date(),
          status: LeadStatus.SENT_TO_CRM
        }
      });

      await this.createActivity(id, 'crm_sync_completed', 
        `Successfully sent to ${crmIntegration.type}`,
        { crmId: crmResult.crmId }
      );

      logger.info(`Lead ${id} sent to CRM successfully`);

      return updatedLead;
    } catch (error) {
      logger.error(`Error sending lead ${id} to CRM:`, error);
      
      await this.createActivity(id, 'crm_sync_failed', 'Failed to send to CRM', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  private async createActivity(leadId: string, type: string, description: string, data?: any) {
    return prisma.leadActivity.create({
      data: {
        leadId,
        type,
        description,
        data
      }
    });
  }

  private async processLeadAsync(leadId: string) {
    // In production, this should be queued (Bull, etc.)
    setTimeout(async () => {
      try {
        await this.enrichLead(leadId);
      } catch (error) {
        logger.error(`Error processing lead ${leadId}:`, error);
      }
    }, 1000);
  }
}

