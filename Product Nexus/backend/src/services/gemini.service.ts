import axios from 'axios';
import { config } from '../config/env';
import { logger } from '../utils/logger';

interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface GeminiRequest {
  contents: GeminiMessage[];
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
  };
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
      role: string;
    };
    finishReason: string;
    index: number;
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor() {
    this.apiKey = config.ai.gemini.apiKey || '';
    
    if (!this.apiKey) {
      logger.warn('Gemini API key not configured. Gemini service will not work.');
    }
  }

  /**
   * Generate text using Gemini API
   */
  async generateText(
    prompt: string,
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      systemInstruction?: string;
    } = {}
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const model = options.model || 'gemini-pro';
    const temperature = options.temperature ?? 0.7;
    const maxTokens = options.maxTokens || 2048;

    try {
      const messages: GeminiMessage[] = [];

      // Add system instruction if provided
      if (options.systemInstruction) {
        messages.push({
          role: 'user',
          parts: [{ text: `System: ${options.systemInstruction}` }]
        });
        messages.push({
          role: 'model',
          parts: [{ text: 'Entendido. Como posso ajudar?' }]
        });
      }

      // Add user prompt
      messages.push({
        role: 'user',
        parts: [{ text: prompt }]
      });

      const requestBody: GeminiRequest = {
        contents: messages,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
          topP: 0.8,
          topK: 40
        }
      };

      const url = `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`;

      logger.info(`Calling Gemini API with model: ${model}`);

      const response = await axios.post<GeminiResponse>(url, requestBody, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 seconds timeout
      });

      if (!response.data.candidates || response.data.candidates.length === 0) {
        throw new Error('No response from Gemini API');
      }

      const candidate = response.data.candidates[0];
      const text = candidate.content.parts[0]?.text || '';

      if (!text) {
        throw new Error('Empty response from Gemini API');
      }

      logger.info('Gemini API response received successfully');

      return text;
    } catch (error: any) {
      logger.error('Error calling Gemini API:', error.response?.data || error.message);
      
      if (error.response?.status === 400) {
        throw new Error(`Gemini API error: ${error.response.data.error?.message || 'Invalid request'}`);
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('Gemini API key is invalid or unauthorized');
      } else if (error.response?.status === 429) {
        throw new Error('Gemini API rate limit exceeded. Please try again later.');
      }
      
      throw new Error(`Failed to call Gemini API: ${error.message}`);
    }
  }

  /**
   * Analyze a lead using Gemini
   */
  async analyzeLead(leadData: any): Promise<{
    analysis: string;
    recommendations: string[];
    score?: number;
  }> {
    const prompt = `Analise o seguinte lead e forneça uma análise detalhada, recomendações de abordagem e uma pontuação de 0-100:

Dados do Lead:
- Nome: ${leadData.name || 'Não informado'}
- Email: ${leadData.email || 'Não informado'}
- Telefone: ${leadData.phone || 'Não informado'}
- Mensagem: ${leadData.message || 'Não informada'}
- Fonte: ${leadData.source || 'Não informada'}
${leadData.enrichedData ? `- Dados Enriquecidos: ${JSON.stringify(leadData.enrichedData)}` : ''}
${leadData.score ? `- Score Atual: ${leadData.score}` : ''}

Por favor, forneça:
1. Uma análise detalhada do lead
2. Pelo menos 3 recomendações de abordagem
3. Uma pontuação de 0-100 baseada no potencial de conversão

Responda em formato JSON:
{
  "analysis": "análise detalhada aqui",
  "recommendations": ["recomendação 1", "recomendação 2", "recomendação 3"],
  "score": 75
}`;

    try {
      const response = await this.generateText(prompt, {
        temperature: 0.7,
        maxTokens: 2048,
        systemInstruction: 'Você é um assistente especializado em análise de leads e vendas B2B. Responda sempre em português brasileiro e no formato JSON solicitado.'
      });

      // Try to parse JSON response
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            analysis: parsed.analysis || response,
            recommendations: parsed.recommendations || [],
            score: parsed.score
          };
        }
      } catch (parseError) {
        logger.warn('Failed to parse Gemini JSON response, using raw text');
      }

      // Fallback to raw response
      return {
        analysis: response,
        recommendations: [],
        score: undefined
      };
    } catch (error: any) {
      logger.error('Error analyzing lead with Gemini:', error);
      throw error;
    }
  }

  /**
   * Generate personalized message for a lead
   */
  async generatePersonalizedMessage(leadData: any, context?: string): Promise<string> {
    const prompt = `Gere uma mensagem personalizada de follow-up para o seguinte lead:

Dados do Lead:
- Nome: ${leadData.name || 'Cliente'}
- Email: ${leadData.email || 'Não informado'}
- Mensagem Original: ${leadData.message || 'Não informada'}
${context ? `- Contexto: ${context}` : ''}

Crie uma mensagem profissional, personalizada e persuasiva em português brasileiro, focada em criar conexão e demonstrar valor. A mensagem deve ser concisa (máximo 200 palavras).`;

    try {
      const message = await this.generateText(prompt, {
        temperature: 0.8,
        maxTokens: 500,
        systemInstruction: 'Você é um especialista em copywriting e vendas B2B. Suas mensagens são profissionais, personalizadas e focadas em resultados.'
      });

      return message.trim();
    } catch (error: any) {
      logger.error('Error generating personalized message with Gemini:', error);
      throw error;
    }
  }

  /**
   * Test the Gemini API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.generateText('Responda apenas com "OK" se você está funcionando.', {
        temperature: 0.1,
        maxTokens: 10
      });
      
      return response.toLowerCase().includes('ok');
    } catch (error) {
      logger.error('Gemini API connection test failed:', error);
      return false;
    }
  }
}
