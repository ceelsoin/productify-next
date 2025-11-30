import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';

/**
 * LangChain AI Service
 * Provides AI text generation using OpenAI via LangChain
 */
class LangChainAIService {
  private model: ChatOpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('[LangChain] OpenAI API key not configured. Using mock responses.');
      console.warn('[LangChain] Set OPENAI_API_KEY in your .env file');
    } else {
      console.log('[LangChain] OpenAI API key configured');
    }

    this.model = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.8,
      maxTokens: 500,
      openAIApiKey: apiKey,
    });
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
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('[LangChain] API key not set, returning mock response');
      return this.getMockResponse(platform, productName);
    }

    try {
      console.log(`[LangChain] Generating ${platform} copy for: ${productName}`);

      const prompt = ChatPromptTemplate.fromMessages([
        [
          'system',
          `You are an expert social media copywriter specializing in creating viral, engaging content for {platform}. 
Your copy should be attention-grabbing, authentic, and optimized for {platform}'s audience and format.`,
        ],
        [
          'user',
          `Create compelling {platform} copy for this product:

Product Name: {productName}
{productDescription}

Requirements:
- Platform: {platform}
- Tone: {tone}
- Include relevant hashtags for {platform}
- Keep it concise and impactful
- Focus on benefits and value proposition
- Use emojis appropriately for {platform}

Generate the complete {platform} post now:`,
        ],
      ]);

      const chain = prompt.pipe(this.model);

      const result = await chain.invoke({
        platform,
        productName,
        productDescription: productDescription ? `Description: ${productDescription}` : '',
        tone: tone || 'engaging and exciting',
      });

      const content = result.content.toString();
      console.log(`[LangChain] Generated copy (${content.length} chars)`);

      return content;
    } catch (error) {
      console.error('[LangChain] Error:', error);
      console.log('[LangChain] Falling back to mock response');
      return this.getMockResponse(platform, productName);
    }
  }

  /**
   * Mock response for testing without API key
   */
  private getMockResponse(platform: string, productName: string): string {
    const templates: Record<string, string> = {
      instagram: `🔥 Introducing ${productName}! Your new must-have product.\n\n✨ Limited time offer - Get yours today!\n\n#${productName.replace(/\s+/g, '')} #trending #musthave`,
      facebook: `Exciting news! We're thrilled to introduce ${productName}.\n\nThis amazing product is perfect for you.\n\nClick the link to learn more and shop now!`,
      twitter: `🚀 ${productName} is here! Game-changing product you need.\n\n#${productName.replace(/\s+/g, '')} #innovation`,
      linkedin: `We're excited to announce ${productName}.\n\nA professional solution designed for excellence.\n\nLearn more about how this can benefit your business.`,
    };

    return templates[platform] || templates.instagram;
  }
}

export const langChainAIService = new LangChainAIService();
