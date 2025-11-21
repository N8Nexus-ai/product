import axios from 'axios';
import { Lead } from '@prisma/client';
import { config } from '../config/env';
import { logger } from '../utils/logger';

interface EnrichedData {
  cnpj?: {
    cnpj: string;
    razaoSocial: string;
    nomeFantasia: string;
    capitalSocial: string;
    porte: string;
    naturezaJuridica: string;
    dataAbertura: string;
    endereco: any;
    atividades: any[];
  };
  linkedin?: {
    company: string;
    jobTitle: string;
    industry: string;
    companySize: string;
    companyRevenue: string;
  };
  emailValidation?: {
    valid: boolean;
    disposable: boolean;
    role: boolean;
    score: number;
  };
  phoneValidation?: {
    valid: boolean;
    country: string;
    carrier: string;
    lineType: string;
  };
  additionalInfo?: any;
}

export class EnrichmentService {
  
  /**
   * Main method to enrich a lead with data from multiple sources
   */
  async enrichLead(lead: Lead): Promise<EnrichedData> {
    logger.info(`Starting enrichment for lead ${lead.id}`);

    const enrichedData: EnrichedData = {};

    try {
      // Run enrichment processes in parallel
      const enrichmentPromises = [];

      // 1. CNPJ Enrichment (if email domain suggests a company)
      if (lead.email && this.isCompanyEmail(lead.email)) {
        enrichmentPromises.push(
          this.enrichByCNPJ(lead.email).then(data => {
            if (data) enrichedData.cnpj = data;
          }).catch(err => {
            logger.warn(`CNPJ enrichment failed for lead ${lead.id}:`, err.message);
          })
        );
      }

      // 2. Email Validation
      if (lead.email) {
        enrichmentPromises.push(
          this.validateEmail(lead.email).then(data => {
            if (data) enrichedData.emailValidation = data;
          }).catch(err => {
            logger.warn(`Email validation failed for lead ${lead.id}:`, err.message);
          })
        );
      }

      // 3. Phone Validation
      if (lead.phone) {
        enrichmentPromises.push(
          this.validatePhone(lead.phone).then(data => {
            if (data) enrichedData.phoneValidation = data;
          }).catch(err => {
            logger.warn(`Phone validation failed for lead ${lead.id}:`, err.message);
          })
        );
      }

      // 4. LinkedIn Enrichment (if available)
      if (lead.customFields && (lead.customFields as any).linkedinUrl) {
        enrichmentPromises.push(
          this.enrichByLinkedIn((lead.customFields as any).linkedinUrl).then(data => {
            if (data) enrichedData.linkedin = data;
          }).catch(err => {
            logger.warn(`LinkedIn enrichment failed for lead ${lead.id}:`, err.message);
          })
        );
      }

      // Wait for all enrichment processes
      await Promise.all(enrichmentPromises);

      logger.info(`Enrichment completed for lead ${lead.id}`);

      return enrichedData;

    } catch (error) {
      logger.error(`Error enriching lead ${lead.id}:`, error);
      throw error;
    }
  }

  /**
   * Enrich data using CNPJ (Brazilian company registry)
   */
  private async enrichByCNPJ(email: string): Promise<any | null> {
    try {
      // Extract potential CNPJ from email domain
      const domain = email.split('@')[1];
      
      // Try to find company by domain or name
      // For demo, using ReceitaWS API (free, but rate-limited)
      
      logger.info(`Attempting CNPJ enrichment for domain: ${domain}`);
      
      // In production, you might want to:
      // 1. Use a paid API like Serasa, BigDataCorp
      // 2. Have a database of domain -> CNPJ mappings
      // 3. Use Google Search API to find CNPJ
      
      // For now, returning mock data structure
      return null; // Will implement actual API call in production
      
    } catch (error) {
      logger.error('Error in CNPJ enrichment:', error);
      return null;
    }
  }

  /**
   * Enrich data using CNPJ number directly
   */
  async enrichByCNPJNumber(cnpj: string): Promise<any | null> {
    try {
      // Remove formatting
      const cleanCnpj = cnpj.replace(/\D/g, '');

      if (cleanCnpj.length !== 14) {
        throw new Error('Invalid CNPJ format');
      }

      // Using ReceitaWS (free API)
      const response = await axios.get(
        `https://www.receitaws.com.br/v1/cnpj/${cleanCnpj}`,
        {
          timeout: 10000,
          headers: {
            'User-Agent': 'Nexus Sales OS'
          }
        }
      );

      if (response.data.status === 'ERROR') {
        throw new Error(response.data.message);
      }

      return {
        cnpj: response.data.cnpj,
        razaoSocial: response.data.nome,
        nomeFantasia: response.data.fantasia,
        capitalSocial: response.data.capital_social,
        porte: response.data.porte,
        naturezaJuridica: response.data.natureza_juridica,
        dataAbertura: response.data.abertura,
        endereco: {
          logradouro: response.data.logradouro,
          numero: response.data.numero,
          complemento: response.data.complemento,
          bairro: response.data.bairro,
          municipio: response.data.municipio,
          uf: response.data.uf,
          cep: response.data.cep
        },
        atividades: [
          response.data.atividade_principal,
          ...response.data.atividades_secundarias
        ]
      };

    } catch (error) {
      logger.error('Error enriching by CNPJ number:', error);
      return null;
    }
  }

  /**
   * Validate email address
   */
  private async validateEmail(email: string): Promise<any | null> {
    try {
      // Simple validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValidFormat = emailRegex.test(email);

      // Check if disposable domain
      const disposableDomains = ['tempmail.com', 'guerrillamail.com', '10minutemail.com'];
      const domain = email.split('@')[1];
      const isDisposable = disposableDomains.includes(domain);

      // Check if role-based email
      const rolePrefixes = ['admin', 'info', 'support', 'sales', 'contact'];
      const prefix = email.split('@')[0].toLowerCase();
      const isRole = rolePrefixes.some(role => prefix.includes(role));

      return {
        valid: isValidFormat,
        disposable: isDisposable,
        role: isRole,
        score: isValidFormat && !isDisposable && !isRole ? 100 : 50
      };

      // In production, use services like:
      // - ZeroBounce
      // - Hunter.io
      // - NeverBounce

    } catch (error) {
      logger.error('Error validating email:', error);
      return null;
    }
  }

  /**
   * Validate phone number
   */
  private async validatePhone(phone: string): Promise<any | null> {
    try {
      // Remove formatting
      const cleanPhone = phone.replace(/\D/g, '');

      // Basic Brazilian phone validation
      const isBrazilian = cleanPhone.startsWith('55');
      const isValid = cleanPhone.length >= 10 && cleanPhone.length <= 13;

      return {
        valid: isValid,
        country: isBrazilian ? 'BR' : 'unknown',
        carrier: 'unknown',
        lineType: cleanPhone.length === 11 || cleanPhone.length === 13 ? 'mobile' : 'landline'
      };

      // In production, use services like:
      // - Twilio Lookup API
      // - Numverify

    } catch (error) {
      logger.error('Error validating phone:', error);
      return null;
    }
  }

  /**
   * Enrich data from LinkedIn
   */
  private async enrichByLinkedIn(linkedinUrl: string): Promise<any | null> {
    try {
      // In production, integrate with:
      // - LinkedIn API (requires OAuth)
      // - Proxycurl API
      // - RocketReach
      
      logger.info(`LinkedIn enrichment for: ${linkedinUrl}`);
      
      return null; // Placeholder
      
    } catch (error) {
      logger.error('Error enriching by LinkedIn:', error);
      return null;
    }
  }

  /**
   * Check if email is from a company (not free email provider)
   */
  private isCompanyEmail(email: string): boolean {
    const freeEmailDomains = [
      'gmail.com', 
      'yahoo.com', 
      'hotmail.com', 
      'outlook.com',
      'live.com',
      'icloud.com',
      'uol.com.br',
      'bol.com.br',
      'ig.com.br'
    ];

    const domain = email.split('@')[1]?.toLowerCase();
    return !freeEmailDomains.includes(domain);
  }
}

