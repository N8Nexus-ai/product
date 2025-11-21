import { PrismaClient, IntegrationType } from '@prisma/client';
import { CRMService } from '../../services/crm.service';
import { AppError } from '../../middleware/errorHandler';
import { logger } from '../../utils/logger';

const prisma = new PrismaClient();

export class IntegrationService {
  private crmService: CRMService;

  constructor() {
    this.crmService = new CRMService();
  }

  async listIntegrations(companyId: string) {
    return prisma.integration.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async configureIntegration(
    companyId: string,
    type: string,
    name: string,
    config: any
  ) {
    // Test connection first
    const isValid = await this.crmService.testConnection(type, config);

    if (!isValid) {
      throw new AppError('Invalid credentials or connection failed', 400);
    }

    // Check if integration already exists
    const existing = await prisma.integration.findFirst({
      where: {
        companyId,
        type: type as IntegrationType
      }
    });

    if (existing) {
      // Update existing
      const updated = await prisma.integration.update({
        where: { id: existing.id },
        data: {
          name,
          config,
          active: true,
          lastSync: new Date()
        }
      });

      logger.info(`Integration updated: ${type} for company ${companyId}`);
      return updated;
    }

    // Create new
    const integration = await prisma.integration.create({
      data: {
        companyId,
        type: type as IntegrationType,
        name,
        config,
        active: true,
        lastSync: new Date()
      }
    });

    logger.info(`Integration created: ${type} for company ${companyId}`);

    return integration;
  }

  async testIntegration(integrationId: string) {
    const integration = await prisma.integration.findUnique({
      where: { id: integrationId }
    });

    if (!integration) {
      throw new AppError('Integration not found', 404);
    }

    const isValid = await this.crmService.testConnection(
      integration.type,
      integration.config as any
    );

    return {
      valid: isValid,
      message: isValid 
        ? 'Connection successful' 
        : 'Connection failed. Please check your credentials.'
    };
  }

  async removeIntegration(integrationId: string) {
    await prisma.integration.delete({
      where: { id: integrationId }
    });

    logger.info(`Integration removed: ${integrationId}`);
  }
}

