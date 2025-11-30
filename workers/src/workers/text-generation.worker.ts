import dotenv from 'dotenv';
import { join } from 'path';
import { Job as BullJob } from 'bull';
import { BaseWorker } from '../core/base-worker';
import {
  WorkerJobData,
  WorkerJobResult,
  ViralCopyConfig,
  ProductDescriptionConfig,
} from '../core/types';
import { mongoService } from '../services/mongodb.service';
import { queueManager } from '../core/queue-manager';
import { langChainAIService } from '../services/langchain-ai.service';
import { buildViralCopyPrompt } from '../prompts/viral-copy.prompt';
import { buildProductDescriptionPrompt } from '../prompts/product-description.prompt';

dotenv.config({ path: join(__dirname, '../../.env') });

/**
 * Text Generation Worker (VST)
 * Generates viral copy for social media platforms
 */
export class TextGenerationWorker extends BaseWorker {
  queueName = 'text-queue';
  concurrency = 3; // Process 3 jobs at a time

  async process(job: BullJob<WorkerJobData>): Promise<WorkerJobResult> {
    this.validateJobData(job);

    const { jobId, itemIndex, config, productInfo } = job.data;

    console.log(`[TextGenerationWorker] Processing job ${jobId}, item ${itemIndex}`);
    console.log(`[TextGenerationWorker] Config:`, config);

    try {
      await this.updateProgress(jobId, itemIndex, 20);

      let text: string;
      let resultType: string;

      // Check if it's viral copy or product description
      if ('platform' in config) {
        // Viral Copy
        const viralConfig = config as ViralCopyConfig;
        text = await this.generateViralCopy(productInfo, viralConfig);
        resultType = 'viral_copy';
        
        await this.updateProgress(jobId, itemIndex, 100);

        return {
          jobId,
          itemIndex,
          success: true,
          result: {
            type: resultType,
            text,
            platform: viralConfig.platform,
            wordCount: text.split(/\s+/).length,
          },
        };
      } else {
        // Product Description
        const descConfig = config as ProductDescriptionConfig;
        text = await this.generateProductDescription(productInfo, descConfig);
        resultType = 'product_description';
        
        await this.updateProgress(jobId, itemIndex, 100);

        return {
          jobId,
          itemIndex,
          success: true,
          result: {
            type: resultType,
            text,
            style: descConfig.style || 'marketplace',
            wordCount: text.split(/\s+/).length,
          },
        };
      }
    } catch (error) {
      console.error(`[TextGenerationWorker] Error:`, error);
      return {
        jobId,
        itemIndex,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate viral copy using LangChain with OpenAI
   */
  private async generateViralCopy(
    productInfo: { name: string; description?: string },
    config: ViralCopyConfig
  ): Promise<string> {
    console.log(`[TextGenerationWorker] Generating viral copy for ${config.platform}...`);

    try {
      // Build prompt using dedicated prompt builder
      const { system, user } = buildViralCopyPrompt({
        productName: productInfo.name,
        productDescription: productInfo.description,
        platform: config.platform,
        tone: config.tone,
        includeEmojis: config.includeEmojis,
        includeHashtags: config.includeHashtags,
        language: config.language,
      });

      // Use generic LangChain service
      const copy = await langChainAIService.generateText(system, user);

      console.log(`[TextGenerationWorker] Successfully generated viral copy (${copy.length} chars)`);
      return copy;
    } catch (error) {
      console.error(`[TextGenerationWorker] LangChain error, falling back to template:`, error);
      
      // Fallback to template if API fails
      const emoji = config.includeEmojis !== false ? '🔥 ' : '';
      const hashtag = config.includeHashtags !== false ? `#${productInfo.name.replace(/\s+/g, '')}` : '';
      
      const platformTemplates: Record<string, string> = {
        instagram: `${emoji}Introducing ${productInfo.name}! ${productInfo.description || 'Your new must-have product.'}\n\n✨ Limited time offer - Get yours today!\n\n${hashtag} #trending #musthave`,
        facebook: `Exciting news! We're thrilled to introduce ${productInfo.name}.\n\n${productInfo.description || 'This amazing product is perfect for you.'}\n\nClick the link to learn more and shop now!`,
        twitter: `${emoji}${productInfo.name} is here! ${productInfo.description || 'Game-changing product you need.'}\n\n${hashtag} #innovation`,
        linkedin: `We're excited to announce ${productInfo.name}.\n\n${productInfo.description || 'A professional solution designed for excellence.'}\n\nLearn more about how this can benefit your business.`,
      };

      return platformTemplates[config.platform] || platformTemplates.instagram;
    }
  }

  /**
   * Generate product description using LangChain with OpenAI
   */
  private async generateProductDescription(
    productInfo: { name: string; description?: string },
    config: ProductDescriptionConfig
  ): Promise<string> {
    console.log(`[TextGenerationWorker] Generating product description (${config.style || 'marketplace'})...`);

    try {
      // Build prompt using dedicated prompt builder
      const { system, user } = buildProductDescriptionPrompt({
        productName: productInfo.name,
        productDescription: productInfo.description,
        targetAudience: config.targetAudience,
        includeEmojis: config.includeEmojis,
        language: config.language,
        style: config.style,
      });

      // Use generic LangChain service
      const description = await langChainAIService.generateText(system, user);

      console.log(`[TextGenerationWorker] Successfully generated description (${description.length} chars)`);
      return description;
    } catch (error) {
      console.error(`[TextGenerationWorker] LangChain error, falling back to template:`, error);
      
      // Fallback to simple template if API fails
      const emoji = config.includeEmojis ? '✨ ' : '';
      return `${emoji}${productInfo.name}\n\n${productInfo.description || 'Premium quality product designed for your needs.'}\n\nKey Features:\n• High quality materials\n• Professional design\n• Great value\n\nOrder now and experience the difference!`;
    }
  }
}

// Run as standalone if executed directly
if (require.main === module) {
  const worker = new TextGenerationWorker();

  async function start() {
    console.log('[TextGenerationWorker] Starting as standalone...');
    await mongoService.connect();
    await worker.start();
    console.log('[TextGenerationWorker] Ready to process jobs');
  }

  async function shutdown() {
    console.log('\n[TextGenerationWorker] Shutting down...');
    await worker.stop();
    await queueManager.closeAll();
    await mongoService.disconnect();
    process.exit(0);
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  start().catch((error) => {
    console.error('[TextGenerationWorker] Failed to start:', error);
    process.exit(1);
  });
}
