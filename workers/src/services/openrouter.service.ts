import axios, { AxiosInstance } from 'axios';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * OpenRouter API Service
 * Provides access to multiple AI models through OpenRouter
 */
class OpenRouterService {
  private client: AxiosInstance;

  constructor() {
    if (!OPENROUTER_API_KEY) {
      console.warn('[OpenRouter] API key not configured. Using mock responses.');
    }

    this.client = axios.create({
      baseURL: OPENROUTER_BASE_URL,
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://productify.app',
        'X-Title': 'Productify',
      },
    });
  }

  /**
   * Generate completion using specified model
   */
  async generateCompletion(
    model: string,
    messages: OpenRouterMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      topP?: number;
    }
  ): Promise<string> {
    if (!OPENROUTER_API_KEY) {
      console.warn('[OpenRouter] API key not set, returning mock response');
      return this.getMockResponse(messages);
    }

    try {
      console.log(`[OpenRouter] Generating completion with model: ${model}`);
      
      const response = await this.client.post<OpenRouterResponse>('/chat/completions', {
        model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 1000,
        top_p: options?.topP ?? 1,
      });

      const content = response.data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content in OpenRouter response');
      }

      console.log(`[OpenRouter] Generated ${response.data.usage.completion_tokens} tokens`);
      
      return content;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('[OpenRouter] API Error:', {
          status: error.response?.status,
          data: error.response?.data,
        });
        throw new Error(`OpenRouter API error: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Generate viral copy for social media
   */
  async generateViralCopy(
    productName: string,
    productDescription: string | undefined,
    platform: string,
    tone?: string
  ): Promise<string> {
    const systemPrompt = `You are an expert social media copywriter specializing in creating viral, engaging content for ${platform}. 
Your copy should be attention-grabbing, authentic, and optimized for ${platform}'s audience and format.`;

    const userPrompt = `Create compelling ${platform} copy for this product:

Product Name: ${productName}
${productDescription ? `Description: ${productDescription}` : ''}

Requirements:
- Platform: ${platform}
- Tone: ${tone || 'engaging and exciting'}
- Include relevant hashtags for ${platform}
- Keep it concise and impactful
- Focus on benefits and value proposition
- Use emojis appropriately for ${platform}

Generate the complete ${platform} post now:`;

    return this.generateCompletion(
      'x-ai/grok-2-1212',
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      {
        temperature: 0.8,
        maxTokens: 500,
      }
    );
  }

  /**
   * Mock response for testing without API key
   */
  private getMockResponse(messages: OpenRouterMessage[]): string {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.content.includes('instagram')) {
      return '🔥 Game-changer alert! Just discovered this amazing product and HAD to share!\n\n✨ Life just got easier\n💫 Quality you can feel\n🎯 Made for people who value excellence\n\nDon\'t sleep on this! Limited stock available.\n\n#ProductLaunch #Innovation #MustHave #LifestyleUpgrade #NewFavorite';
    }
    return 'This is an amazing product that you need to check out! Get yours today!';
  }
}

export const openRouterService = new OpenRouterService();
