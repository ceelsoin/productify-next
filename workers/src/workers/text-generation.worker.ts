import dotenv from 'dotenv';
import { join } from 'path';
import { Job as BullJob } from 'bull';
import { BaseWorker } from '../core/base-worker';
import {
  WorkerJobData,
  WorkerJobResult,
  JobType,
} from '../core/types';
import { mongoService } from '../services/mongodb.service';
import { queueManager } from '../core/queue-manager';
import { langChainAIService } from '../services/langchain-ai.service';
import { getPromptConfigForJobType } from '../core/pipelines';
import { PromptTemplateService } from '../services/prompt-template.service';

dotenv.config({ path: join(__dirname, '../../.env') });

/**
 * Text Generation Worker (Generic)
 * Generates text content based on pipeline prompt configuration
 * Supports: viral copy, product descriptions, voice-over scripts, etc.
 */
export class TextGenerationWorker extends BaseWorker {
  queueName = 'text-queue';
  concurrency = 3; // Process 3 jobs at a time

  async process(job: BullJob<WorkerJobData>): Promise<WorkerJobResult> {
    this.validateJobData(job);

    const { jobId, itemIndex, config, productInfo, pipelineName, itemType } = job.data;

    console.log(`\n======== [TextGenerationWorker] START ========`);
    console.log(`[TextGenerationWorker] Job ID: ${jobId}, Item Index: ${itemIndex}`);
    console.log(`[TextGenerationWorker] Type: ${itemType}`);
    console.log(`[TextGenerationWorker] Pipeline: ${pipelineName}`);
    console.log(`[TextGenerationWorker] Product Info:`, JSON.stringify(productInfo, null, 2));
    console.log(`[TextGenerationWorker] Config received from orchestrator:`, JSON.stringify(config, null, 2));

    try {
      await this.updateProgress(jobId, itemIndex, 20);

      // Get prompt configuration for this job type
      const promptConfig = getPromptConfigForJobType(itemType as JobType);
      
      if (!promptConfig) {
        throw new Error(`No prompt configuration found for job type: ${itemType}`);
      }

      console.log(`[TextGenerationWorker] Using prompt config for ${itemType}`);

      // Generate text using prompt configuration
      const text = await this.generateText(productInfo, config, promptConfig);
      
      console.log(`[TextGenerationWorker] Generated text (${text.split(/\s+/).length} words):`);
      console.log(text.substring(0, 200) + '...');
      console.log(`======== [TextGenerationWorker] END ========\n`);
      
      await this.updateProgress(jobId, itemIndex, 100);

      return {
        jobId,
        itemIndex,
        success: true,
        result: {
          type: itemType as string,
          text,
          wordCount: text.split(/\s+/).length,
          ...this.extractResultMetadata(itemType as JobType, config),
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
   * Extract metadata for result based on job type
   */
  private extractResultMetadata(jobType: JobType, config: any): Record<string, any> {
    switch (jobType) {
      case JobType.VIRAL_COPY:
        return {
          platform: config.platform || 'instagram',
        };
      case JobType.PRODUCT_DESCRIPTION:
        return {
          style: config.style || 'marketplace',
          targetAudience: config.targetAudience || 'general',
        };
      default:
        return {};
    }
  }

  /**
   * Generate text using pipeline prompt configuration (Generic)
   */
  private async generateText(
    productInfo: { name: string; description?: string },
    config: any,
    promptConfig: { systemPrompt: string; userPromptTemplate: string; variables: string[] }
  ): Promise<string> {
    console.log(`[TextGenerationWorker] Generating text with prompt template...`);
    console.log(`[TextGenerationWorker] Config received:`, JSON.stringify(config, null, 2));

    try {
      // Prepare variables for template rendering
      const variables = {
        productName: productInfo.name,
        productDescription: productInfo.description || '',
        ...config, // Merge all config values as variables
      };

      console.log(`[TextGenerationWorker] Variables for template:`, JSON.stringify(variables, null, 2));

      // Render prompts using template engine
      const systemPrompt = PromptTemplateService.render(promptConfig.systemPrompt, variables);
      const userPrompt = PromptTemplateService.render(promptConfig.userPromptTemplate, variables);

      console.log(`[TextGenerationWorker] System Prompt:\n${systemPrompt}`);
      console.log(`[TextGenerationWorker] User Prompt:\n${userPrompt}`);

      // Use LangChain service to generate text
      const text = await langChainAIService.generateText(systemPrompt, userPrompt);

      console.log(`[TextGenerationWorker] Successfully generated text (${text.length} chars)`);
      return text;
    } catch (error) {
      console.error(`[TextGenerationWorker] LangChain error:`, error);
      
      // Fallback to simple template if API fails
      return this.getFallbackTemplate(productInfo, config);
    }
  }

  /**
   * Get fallback template when AI generation fails
   */
  private getFallbackTemplate(
    productInfo: { name: string; description?: string },
    config: any
  ): string {
    const emoji = config.includeEmojis !== false ? '✨ ' : '';
    return `${emoji}${productInfo.name}\n\n${productInfo.description || 'Premium quality product.'}\n\nDiscover more about this amazing product!`;
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
