import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

/**
 * LangChain OpenAI Service
 * Uses LangChain with OpenAI through OpenRouter
 */
class LangChainOpenAIService {
  private model: ChatOpenAI;

  constructor() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      console.warn('[LangChain] OpenRouter API key not configured');
    } else {
      console.log('[LangChain] API key configured');
    }

    this.model = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.8,
      maxTokens: 500,
      openAIApiKey: apiKey,
      configuration: {
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': 'https://productify.app',
          'X-Title': 'Productify',
        },
      },
    });
  }

  /**
   * Generate viral copy for social media using LangChain
   */
  async generateViralCopy(
    productName: string,
    productDescription: string | undefined,
    platform: string,
    tone?: string
  ): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      console.warn('[LangChain] API key not set, returning mock response');
      return this.getMockResponse(platform);
    }

    try {
      console.log(`[LangChain] Generating ${platform} copy for: ${productName}`);

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

      const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage(userPrompt),
      ];

      const response = await this.model.invoke(messages);
      const content = response.content as string;

      console.log(`[LangChain] Generated copy: ${content.length} chars`);

      return content;
    } catch (error) {
      console.error('[LangChain] Error:', error);
      throw new Error(`LangChain error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Mock response for testing
   */
  private getMockResponse(platform: string): string {
    const templates: Record<string, string> = {
      instagram: '🔥 Game-changer alert! Just discovered this amazing product and HAD to share!\n\n✨ Life just got easier\n💫 Quality you can feel\n🎯 Made for people who value excellence\n\nDon\'t sleep on this! Limited stock available.\n\n#ProductLaunch #Innovation #MustHave #LifestyleUpgrade #NewFavorite',
      facebook: 'Exciting news! We\'re thrilled to introduce an amazing new product.\n\nThis incredible solution is perfect for you.\n\nClick the link to learn more and shop now!',
      twitter: '🚀 New product alert! Game-changing innovation you need.\n\n#Innovation #MustHave',
      linkedin: 'We\'re excited to announce a new professional solution designed for excellence.\n\nLearn more about how this can benefit your business.',
    };

    return templates[platform] || templates.instagram;
  }
}

export const langChainOpenAIService = new LangChainOpenAIService();
