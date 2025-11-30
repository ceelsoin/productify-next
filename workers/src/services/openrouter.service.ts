import { OpenRouter } from '@openrouter/sdk';

/**
 * OpenRouter API Service
 * Provides access to multiple AI models through OpenRouter using official SDK
 */
class OpenRouterService {
  private client: OpenRouter;

  constructor() {
    // Get API key at runtime to ensure env vars are loaded
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      console.warn('[OpenRouter] API key not configured. Using mock responses.');
      console.warn('[OpenRouter] Set OPENROUTER_API_KEY in your .env file');
    } else {
      console.log('[OpenRouter] API key configured:', apiKey.substring(0, 20) + '...');
    }

    this.client = new OpenRouter({
      apiKey: apiKey,
    });
  }

  /**
   * Generate completion using specified model
   */
  async generateCompletion(
    model: string,
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options?: {
      temperature?: number;
      maxTokens?: number;
      topP?: number;
    }
  ): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      console.warn('[OpenRouter] API key not set, returning mock response');
      return this.getMockResponse(messages);
    }

    try {
      console.log(`[OpenRouter] Generating completion with model: ${model}`);
      
      const response = await this.client.chat.send({
        model,
        messages,
        temperature: options?.temperature ?? 0.7,
        maxTokens: options?.maxTokens ?? 1000,
        topP: options?.topP ?? 1,
        stream: false,
      });

      const content = response.choices?.[0]?.message?.content;
      
      if (!content || typeof content !== 'string') {
        throw new Error('No content in OpenRouter response');
      }

      console.log(`[OpenRouter] Generated ${response.usage?.completionTokens || 0} tokens`);
      
      return content;
    } catch (error) {
      console.error('[OpenRouter] API Error:', error);
      throw new Error(`OpenRouter API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      'x-ai/grok-beta',
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
  private getMockResponse(messages: Array<{ role: string; content: string }>): string {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.content.includes('instagram')) {
      return '🔥 Game-changer alert! Just discovered this amazing product and HAD to share!\n\n✨ Life just got easier\n💫 Quality you can feel\n🎯 Made for people who value excellence\n\nDon\'t sleep on this! Limited stock available.\n\n#ProductLaunch #Innovation #MustHave #LifestyleUpgrade #NewFavorite';
    }
    return 'This is an amazing product that you need to check out! Get yours today!';
  }
}

export const openRouterService = new OpenRouterService();
