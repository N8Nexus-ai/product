import axios from 'axios';
import { Lead, Integration } from '@prisma/client';
import { config } from '../config/env';
import { logger } from '../utils/logger';

interface CRMResult {
  crmId: string;
  status: string;
  url?: string;
}

export class CRMService {
  
  /**
   * Send lead to configured CRM system
   */
  async sendLeadToCRM(lead: Lead, integration: Integration): Promise<CRMResult> {
    logger.info(`Sending lead ${lead.id} to ${integration.type}`);

    switch (integration.type) {
      case 'CRM_PIPEDRIVE':
        return this.sendToPipedrive(lead, integration);
      
      case 'CRM_RD_STATION':
        return this.sendToRDStation(lead, integration);
      
      case 'CRM_HUBSPOT':
        return this.sendToHubSpot(lead, integration);
      
      case 'CRM_SALESFORCE':
        return this.sendToSalesforce(lead, integration);
      
      default:
        throw new Error(`Unsupported CRM type: ${integration.type}`);
    }
  }

  /**
   * Send lead to Pipedrive
   */
  private async sendToPipedrive(lead: Lead, integration: Integration): Promise<CRMResult> {
    try {
      const integrationConfig = integration.config as any;
      const apiToken = integrationConfig.apiToken || config.crm.pipedrive.apiToken;
      const domain = integrationConfig.domain || config.crm.pipedrive.domain;

      if (!apiToken) {
        throw new Error('Pipedrive API token not configured');
      }

      // 1. Create Person
      const personResponse = await axios.post(
        `https://${domain}/api/v1/persons`,
        {
          name: lead.name,
          email: lead.email,
          phone: lead.phone
        },
        {
          params: { api_token: apiToken },
          timeout: 10000
        }
      );

      const personId = personResponse.data.data.id;

      // 2. Create Deal
      const enrichedData = lead.enrichedData as any;
      const companyName = enrichedData?.cnpj?.nomeFantasia || enrichedData?.cnpj?.razaoSocial;

      const dealResponse = await axios.post(
        `https://${domain}/api/v1/deals`,
        {
          title: `Lead: ${lead.name || lead.email}${companyName ? ` - ${companyName}` : ''}`,
          person_id: personId,
          value: 0,
          currency: 'BRL',
          visible_to: 3, // All users
          // Custom fields
          ...(lead.score && { 
            [integrationConfig.customFields?.score || 'lead_score']: lead.score 
          })
        },
        {
          params: { api_token: apiToken },
          timeout: 10000
        }
      );

      const dealId = dealResponse.data.data.id;

      // 3. Add Note with enriched data
      if (lead.enrichedData || lead.message) {
        let noteContent = '';
        
        if (lead.message) {
          noteContent += `Mensagem: ${lead.message}\n\n`;
        }

        if (lead.score) {
          noteContent += `Score de Qualificação: ${lead.score}/100\n`;
          if (lead.scoringReason) {
            noteContent += `Motivo: ${lead.scoringReason}\n\n`;
          }
        }

        if (enrichedData) {
          noteContent += '--- Dados Enriquecidos ---\n';
          
          if (enrichedData.cnpj) {
            noteContent += `\nEmpresa: ${enrichedData.cnpj.razaoSocial}\n`;
            noteContent += `CNPJ: ${enrichedData.cnpj.cnpj}\n`;
            noteContent += `Porte: ${enrichedData.cnpj.porte}\n`;
            if (enrichedData.cnpj.capitalSocial) {
              noteContent += `Capital Social: ${enrichedData.cnpj.capitalSocial}\n`;
            }
          }

          if (enrichedData.linkedin) {
            noteContent += `\nCargo: ${enrichedData.linkedin.jobTitle}\n`;
            noteContent += `Empresa: ${enrichedData.linkedin.company}\n`;
          }
        }

        await axios.post(
          `https://${domain}/api/v1/notes`,
          {
            content: noteContent,
            deal_id: dealId,
            person_id: personId
          },
          {
            params: { api_token: apiToken },
            timeout: 10000
          }
        );
      }

      logger.info(`Lead ${lead.id} sent to Pipedrive successfully. Deal ID: ${dealId}`);

      return {
        crmId: dealId.toString(),
        status: 'open',
        url: `https://${domain}/deal/${dealId}`
      };

    } catch (error) {
      logger.error('Error sending to Pipedrive:', error);
      throw error;
    }
  }

  /**
   * Send lead to RD Station
   */
  private async sendToRDStation(lead: Lead, integration: Integration): Promise<CRMResult> {
    try {
      const integrationConfig = integration.config as any;
      const accessToken = integrationConfig.accessToken;

      if (!accessToken) {
        throw new Error('RD Station access token not configured');
      }

      const enrichedData = lead.enrichedData as any;

      // Create/Update Contact
      const response = await axios.post(
        'https://api.rd.services/platform/contacts',
        {
          email: lead.email,
          name: lead.name,
          mobile_phone: lead.phone,
          personal_phone: lead.phone,
          cf_lead_score: lead.score,
          cf_lead_source: lead.source,
          ...(enrichedData?.cnpj && {
            cf_company_name: enrichedData.cnpj.razaoSocial,
            cf_cnpj: enrichedData.cnpj.cnpj
          }),
          tags: ['nexus-sales-os', lead.source, lead.status]
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      const contactUuid = response.data.uuid;

      logger.info(`Lead ${lead.id} sent to RD Station successfully. Contact UUID: ${contactUuid}`);

      return {
        crmId: contactUuid,
        status: 'active',
        url: `https://crm.rdstation.com/contacts/${contactUuid}`
      };

    } catch (error) {
      logger.error('Error sending to RD Station:', error);
      throw error;
    }
  }

  /**
   * Send lead to HubSpot
   */
  private async sendToHubSpot(lead: Lead, integration: Integration): Promise<CRMResult> {
    try {
      const integrationConfig = integration.config as any;
      const apiKey = integrationConfig.apiKey || config.crm.hubspot.apiKey;

      if (!apiKey) {
        throw new Error('HubSpot API key not configured');
      }

      const enrichedData = lead.enrichedData as any;

      // Create Contact
      const response = await axios.post(
        'https://api.hubapi.com/crm/v3/objects/contacts',
        {
          properties: {
            email: lead.email,
            firstname: lead.name?.split(' ')[0],
            lastname: lead.name?.split(' ').slice(1).join(' '),
            phone: lead.phone,
            hs_lead_status: lead.status,
            lifecyclestage: 'lead',
            ...(lead.score && { lead_score: lead.score }),
            ...(lead.source && { hs_analytics_source: lead.source }),
            ...(enrichedData?.cnpj && {
              company: enrichedData.cnpj.razaoSocial,
              cnpj: enrichedData.cnpj.cnpj
            })
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      const contactId = response.data.id;

      // Create Note if there's a message
      if (lead.message || lead.scoringReason) {
        await axios.post(
          'https://api.hubapi.com/crm/v3/objects/notes',
          {
            properties: {
              hs_note_body: `${lead.message || ''}\n\n${lead.scoringReason || ''}`,
              hs_timestamp: new Date().toISOString()
            },
            associations: [
              {
                to: { id: contactId },
                types: [
                  {
                    associationCategory: 'HUBSPOT_DEFINED',
                    associationTypeId: 202 // Note to Contact
                  }
                ]
              }
            ]
          },
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        );
      }

      logger.info(`Lead ${lead.id} sent to HubSpot successfully. Contact ID: ${contactId}`);

      return {
        crmId: contactId,
        status: 'open',
        url: `https://app.hubspot.com/contacts/XXX/contact/${contactId}`
      };

    } catch (error) {
      logger.error('Error sending to HubSpot:', error);
      throw error;
    }
  }

  /**
   * Send lead to Salesforce
   */
  private async sendToSalesforce(lead: Lead, integration: Integration): Promise<CRMResult> {
    try {
      // Salesforce requires OAuth flow, which is more complex
      // This is a simplified version
      
      logger.info('Salesforce integration not yet implemented');
      
      throw new Error('Salesforce integration coming soon');

      // In production, implement:
      // 1. OAuth flow for authentication
      // 2. Create Lead object in Salesforce
      // 3. Handle custom fields mapping
      
    } catch (error) {
      logger.error('Error sending to Salesforce:', error);
      throw error;
    }
  }

  /**
   * Test CRM connection
   */
  async testConnection(integrationType: string, config: any): Promise<boolean> {
    try {
      switch (integrationType) {
        case 'CRM_PIPEDRIVE':
          await axios.get(
            `https://${config.domain}/api/v1/users/me`,
            {
              params: { api_token: config.apiToken },
              timeout: 5000
            }
          );
          return true;

        case 'CRM_RD_STATION':
          await axios.get(
            'https://api.rd.services/platform/contacts',
            {
              headers: { 'Authorization': `Bearer ${config.accessToken}` },
              timeout: 5000
            }
          );
          return true;

        case 'CRM_HUBSPOT':
          await axios.get(
            'https://api.hubapi.com/crm/v3/objects/contacts',
            {
              headers: { 'Authorization': `Bearer ${config.apiKey}` },
              params: { limit: 1 },
              timeout: 5000
            }
          );
          return true;

        default:
          return false;
      }
    } catch (error) {
      logger.error(`Error testing ${integrationType} connection:`, error);
      return false;
    }
  }
}

