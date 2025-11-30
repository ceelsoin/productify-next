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
   * Generate text using a custom prompt
   * This is a generic method that can be used for any text generation task
   */
  async generateText(systemPrompt: string, userPrompt: string): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('[LangChain] API key not set, cannot generate text');
      throw new Error('OpenAI API key not configured');
    }

    try {
      console.log('[LangChain] Generating text with custom prompt');

      const prompt = ChatPromptTemplate.fromMessages([
        ['system', systemPrompt],
        ['user', userPrompt],
      ]);

      const chain = prompt.pipe(this.model);
      const result = await chain.invoke({});

      const content = result.content.toString();
      console.log(`[LangChain] Generated text (${content.length} chars)`);

      return content;
    } catch (error) {
      console.error('[LangChain] Error:', error);
      throw new Error(`LangChain error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

}

export const langChainAIService = new LangChainAIService();
