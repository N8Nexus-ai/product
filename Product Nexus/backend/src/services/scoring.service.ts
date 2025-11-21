import { Lead, Company } from '@prisma/client';
import axios from 'axios';
import { config } from '../config/env';
import { logger } from '../utils/logger';

interface ScoringResult {
  score: number; // 0-100
  reason: string;
  factors: {
    name: string;
    score: number;
    weight: number;
  }[];
}

export class ScoringService {
  
  /**
   * Score a lead using AI and rule-based logic
   */
  async scoreLead(lead: Lead & { company: Company }): Promise<ScoringResult> {
    logger.info(`Starting AI scoring for lead ${lead.id}`);

    try {
      // Combine rule-based scoring with AI scoring
      const ruleBasedScore = await this.ruleBasedScoring(lead);
      const aiScore = await this.aiBasedScoring(lead);

      // Weighted combination (70% AI, 30% Rules)
      const finalScore = Math.round((aiScore.score * 0.7) + (ruleBasedScore.score * 0.3));

      const result: ScoringResult = {
        score: finalScore,
        reason: this.generateScoringReason(lead, ruleBasedScore, aiScore),
        factors: [
          ...ruleBasedScore.factors,
          {
            name: 'AI Analysis',
            score: aiScore.score,
            weight: 0.7
          }
        ]
      };

      logger.info(`Lead ${lead.id} scored: ${finalScore}/100`);

      return result;

    } catch (error) {
      logger.error(`Error scoring lead ${lead.id}:`, error);
      
      // Fallback to rule-based only if AI fails
      const ruleBasedScore = await this.ruleBasedScoring(lead);
      return {
        score: ruleBasedScore.score,
        reason: `Rule-based scoring: ${ruleBasedScore.reason}`,
        factors: ruleBasedScore.factors
      };
    }
  }

  /**
   * Rule-based scoring using predefined criteria
   */
  private async ruleBasedScoring(lead: Lead): Promise<ScoringResult> {
    const factors: { name: string; score: number; weight: number }[] = [];
    let totalScore = 0;
    let totalWeight = 0;

    // Factor 1: Email Quality (weight: 0.15)
    const emailScore = this.scoreEmail(lead);
    factors.push({ name: 'Email Quality', score: emailScore, weight: 0.15 });
    totalScore += emailScore * 0.15;
    totalWeight += 0.15;

    // Factor 2: Phone Quality (weight: 0.10)
    const phoneScore = this.scorePhone(lead);
    factors.push({ name: 'Phone Quality', score: phoneScore, weight: 0.10 });
    totalScore += phoneScore * 0.10;
    totalWeight += 0.10;

    // Factor 3: Enriched Data Availability (weight: 0.20)
    const enrichmentScore = this.scoreEnrichment(lead);
    factors.push({ name: 'Data Enrichment', score: enrichmentScore, weight: 0.20 });
    totalScore += enrichmentScore * 0.20;
    totalWeight += 0.20;

    // Factor 4: Company Data (weight: 0.25)
    const companyScore = this.scoreCompanyData(lead);
    factors.push({ name: 'Company Profile', score: companyScore, weight: 0.25 });
    totalScore += companyScore * 0.25;
    totalWeight += 0.25;

    // Factor 5: Message Quality (weight: 0.15)
    const messageScore = this.scoreMessage(lead);
    factors.push({ name: 'Message Quality', score: messageScore, weight: 0.15 });
    totalScore += messageScore * 0.15;
    totalWeight += 0.15;

    // Factor 6: Lead Source (weight: 0.15)
    const sourceScore = this.scoreSource(lead);
    factors.push({ name: 'Lead Source', score: sourceScore, weight: 0.15 });
    totalScore += sourceScore * 0.15;
    totalWeight += 0.15;

    const finalScore = Math.round(totalScore);

    return {
      score: finalScore,
      reason: this.generateRuleBasedReason(factors, finalScore),
      factors
    };
  }

  /**
   * AI-based scoring using Gemini/GPT
   */
  private async aiBasedScoring(lead: Lead): Promise<{ score: number; reason: string }> {
    try {
      const prompt = this.buildScoringPrompt(lead);

      // Try Gemini first (cheaper)
      if (config.ai.gemini.apiKey) {
        return await this.scoreWithGemini(prompt);
      }

      // Fallback to OpenAI
      if (config.ai.openai.apiKey) {
        return await this.scoreWithOpenAI(prompt);
      }

      throw new Error('No AI API keys configured');

    } catch (error) {
      logger.error('Error in AI scoring:', error);
      // Return neutral score if AI fails
      return {
        score: 50,
        reason: 'AI scoring unavailable'
      };
    }
  }

  /**
   * Score using Google Gemini
   */
  private async scoreWithGemini(prompt: string): Promise<{ score: number; reason: string }> {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${config.ai.gemini.apiKey}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const text = response.data.candidates[0]?.content?.parts[0]?.text || '';
      return this.parseAIResponse(text);

    } catch (error) {
      logger.error('Error calling Gemini API:', error);
      throw error;
    }
  }

  /**
   * Score using OpenAI GPT
   */
  private async scoreWithOpenAI(prompt: string): Promise<{ score: number; reason: string }> {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a lead qualification expert. Analyze leads and provide a score from 0-100.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.ai.openai.apiKey}`
          },
          timeout: 30000
        }
      );

      const text = response.data.choices[0]?.message?.content || '';
      return this.parseAIResponse(text);

    } catch (error) {
      logger.error('Error calling OpenAI API:', error);
      throw error;
    }
  }

  /**
   * Build prompt for AI scoring
   */
  private buildScoringPrompt(lead: Lead): string {
    return `Analyze this lead and provide a qualification score from 0-100.

Lead Information:
- Name: ${lead.name || 'N/A'}
- Email: ${lead.email || 'N/A'}
- Phone: ${lead.phone || 'N/A'}
- Source: ${lead.source}
- Message: ${lead.message || 'N/A'}
- Enriched Data: ${lead.enrichedData ? JSON.stringify(lead.enrichedData) : 'N/A'}
- Custom Fields: ${lead.customFields ? JSON.stringify(lead.customFields) : 'N/A'}

Scoring Criteria:
- Is this a real person with genuine interest? (not spam/bot)
- Does the email look professional?
- Is there enough information to qualify the lead?
- Does the message show buying intent?
- If enriched data is available, does the company profile match ideal customer?

Respond in this exact format:
SCORE: [number 0-100]
REASON: [brief explanation in Portuguese]

Example:
SCORE: 85
REASON: Lead qualificado com email corporativo, mensagem clara demonstrando interesse, e dados enriquecidos indicam empresa de médio porte no setor-alvo.`;
  }

  /**
   * Parse AI response to extract score and reason
   */
  private parseAIResponse(text: string): { score: number; reason: string } {
    try {
      const scoreMatch = text.match(/SCORE:\s*(\d+)/i);
      const reasonMatch = text.match(/REASON:\s*(.+)/is);

      const score = scoreMatch ? parseInt(scoreMatch[1]) : 50;
      const reason = reasonMatch ? reasonMatch[1].trim() : 'AI analysis completed';

      return {
        score: Math.min(100, Math.max(0, score)),
        reason
      };
    } catch (error) {
      logger.error('Error parsing AI response:', error);
      return {
        score: 50,
        reason: 'Could not parse AI response'
      };
    }
  }

  // Individual scoring factors

  private scoreEmail(lead: Lead): number {
    if (!lead.email) return 0;

    const enrichedData = lead.enrichedData as any;
    const emailValidation = enrichedData?.emailValidation;

    if (emailValidation) {
      if (!emailValidation.valid) return 0;
      if (emailValidation.disposable) return 20;
      if (emailValidation.role) return 60;
      return 100;
    }

    // Basic validation if no enrichment
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(lead.email) ? 70 : 0;
  }

  private scorePhone(lead: Lead): number {
    if (!lead.phone) return 0;

    const enrichedData = lead.enrichedData as any;
    const phoneValidation = enrichedData?.phoneValidation;

    if (phoneValidation) {
      return phoneValidation.valid ? 100 : 30;
    }

    // Basic validation
    const cleanPhone = lead.phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 ? 70 : 30;
  }

  private scoreEnrichment(lead: Lead): number {
    if (!lead.enrichedData) return 0;

    const enrichedData = lead.enrichedData as any;
    let score = 0;

    if (enrichedData.cnpj) score += 40;
    if (enrichedData.linkedin) score += 30;
    if (enrichedData.emailValidation) score += 15;
    if (enrichedData.phoneValidation) score += 15;

    return Math.min(100, score);
  }

  private scoreCompanyData(lead: Lead): number {
    const enrichedData = lead.enrichedData as any;
    const cnpjData = enrichedData?.cnpj;

    if (!cnpjData) return 50; // Neutral if no company data

    let score = 0;

    // Company size (Porte)
    if (cnpjData.porte === 'MEDIO' || cnpjData.porte === 'GRANDE') {
      score += 50;
    } else if (cnpjData.porte === 'PEQUENO') {
      score += 30;
    } else {
      score += 10;
    }

    // Capital Social
    if (cnpjData.capitalSocial) {
      const capital = parseFloat(cnpjData.capitalSocial.replace(/[^\d,]/g, '').replace(',', '.'));
      if (capital > 1000000) score += 30;
      else if (capital > 100000) score += 20;
      else score += 10;
    }

    // Company age
    if (cnpjData.dataAbertura) {
      const yearsSinceOpening = new Date().getFullYear() - new Date(cnpjData.dataAbertura).getFullYear();
      if (yearsSinceOpening > 5) score += 20;
      else if (yearsSinceOpening > 2) score += 10;
    }

    return Math.min(100, score);
  }

  private scoreMessage(lead: Lead): number {
    if (!lead.message) return 50; // Neutral if no message

    const message = lead.message.toLowerCase();
    const length = message.length;

    // Too short
    if (length < 10) return 30;

    // Good length
    if (length >= 20 && length <= 500) {
      let score = 70;

      // Check for buying intent keywords
      const buyingKeywords = ['quero', 'preciso', 'orçamento', 'quanto custa', 'contratar', 'comprar'];
      if (buyingKeywords.some(keyword => message.includes(keyword))) {
        score += 20;
      }

      // Check for urgency
      const urgencyKeywords = ['urgente', 'rápido', 'hoje', 'agora'];
      if (urgencyKeywords.some(keyword => message.includes(keyword))) {
        score += 10;
      }

      return Math.min(100, score);
    }

    // Too long might be spam
    if (length > 1000) return 40;

    return 60;
  }

  private scoreSource(lead: Lead): number {
    const sourceScores: { [key: string]: number } = {
      'linkedin': 90,
      'google': 80,
      'facebook': 70,
      'landing-page': 75,
      'typeform': 85,
      'manual': 60,
      'other': 50
    };

    return sourceScores[lead.source.toLowerCase()] || 50;
  }

  private generateRuleBasedReason(factors: any[], score: number): string {
    const topFactors = factors
      .sort((a, b) => (b.score * b.weight) - (a.score * a.weight))
      .slice(0, 3);

    if (score >= 80) {
      return `Lead altamente qualificado. Destaques: ${topFactors.map(f => f.name).join(', ')}`;
    } else if (score >= 60) {
      return `Lead qualificado. Bons indicadores em: ${topFactors.map(f => f.name).join(', ')}`;
    } else if (score >= 40) {
      return `Lead com potencial moderado. Requer validação adicional.`;
    } else {
      return `Lead com baixa qualificação. Dados insuficientes ou perfil não adequado.`;
    }
  }

  private generateScoringReason(lead: Lead, ruleScore: ScoringResult, aiScore: { score: number; reason: string }): string {
    return `${aiScore.reason}\n\nAnálise técnica: ${ruleScore.reason}`;
  }
}

