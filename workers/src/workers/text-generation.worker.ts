import dotenv from 'dotenv';
import { join } from 'path';
import { Job as BullJob } from 'bull';
import { BaseWorker } from '../core/base-worker';
import {
  WorkerJobData,
  WorkerJobResult,
  ViralCopyConfig,
} from '../core/types';
import { mongoService } from '../services/mongodb.service';
import { queueManager } from '../core/queue-manager';
import { langChainAIService } from '../services/langchain-ai.service';

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
    const textConfig = config as ViralCopyConfig;

    console.log(`[TextGenerationWorker] Processing job ${jobId}, item ${itemIndex}`);
    console.log(`[TextGenerationWorker] Config:`, textConfig);

    try {
      // Generate viral copy
      await this.updateProgress(jobId, itemIndex, 20);
      const text = await this.generateViralCopy(productInfo, textConfig);

      await this.updateProgress(jobId, itemIndex, 100);

      return {
        jobId,
        itemIndex,
        success: true,
        result: {
          text,
          platform: textConfig.platform,
          wordCount: text.split(/\s+/).length,
        },
      };
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
    console.log(`[TextGenerationWorker] Generating copy for ${config.platform} using LangChain + OpenAI...`);

    try {
      // Use LangChain with OpenAI directly
      const copy = await langChainAIService.generateViralCopy(
        productInfo.name,
        productInfo.description,
        config.platform,
        config.tone || 'engaging and exciting'
      );

      console.log(`[TextGenerationWorker] Successfully generated copy (${copy.length} chars)`);
      return copy;
    } catch (error) {
      console.error(`[TextGenerationWorker] LangChain error, falling back to template:`, error);
      
      // Fallback to template if API fails
      const platformTemplates: Record<string, string> = {
        instagram: `🔥 Introducing ${productInfo.name}! ${productInfo.description || 'Your new must-have product.'}\n\n✨ Limited time offer - Get yours today!\n\n#${productInfo.name.replace(/\s+/g, '')} #trending #musthave`,
        facebook: `Exciting news! We're thrilled to introduce ${productInfo.name}.\n\n${productInfo.description || 'This amazing product is perfect for you.'}\n\nClick the link to learn more and shop now!`,
        twitter: `🚀 ${productInfo.name} is here! ${productInfo.description || 'Game-changing product you need.'}\n\n#${productInfo.name.replace(/\s+/g, '')} #innovation`,
        linkedin: `We're excited to announce ${productInfo.name}.\n\n${productInfo.description || 'A professional solution designed for excellence.'}\n\nLearn more about how this can benefit your business.`,
      };

      return platformTemplates[config.platform] || platformTemplates.instagram;
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
