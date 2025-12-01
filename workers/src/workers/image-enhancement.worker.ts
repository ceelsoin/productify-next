import dotenv from 'dotenv';
import { join } from 'path';
import { Job as BullJob } from 'bull';
import { BaseWorker } from '../core/base-worker';
import {
  WorkerJobData,
  WorkerJobResult,
  EnhancedImagesConfig,
} from '../core/types';
import { storageService } from '../services/storage.service';
import { mongoService } from '../services/mongodb.service';
import { queueManager } from '../core/queue-manager';
import { openAIImageService } from '../services/openai-image.service';

dotenv.config({ path: join(__dirname, '../../.env') });

/**
 * Image Enhancement Worker
 * Processes enhanced-images generation using OpenAI DALL-E 3
 */
export class ImageEnhancementWorker extends BaseWorker {
  queueName = 'images-queue';
  concurrency = 2; // Process 2 jobs at a time

  async process(job: BullJob<WorkerJobData>): Promise<WorkerJobResult> {
    this.validateJobData(job);

    const { jobId, itemIndex, config, productInfo, originalImage } = job.data;
    const enhancedConfig = config as EnhancedImagesConfig;

    console.log(`[ImageEnhancementWorker] Processing job ${jobId}, item ${itemIndex}`);
    console.log(`[ImageEnhancementWorker] Product: ${productInfo.name}`);
    console.log(`[ImageEnhancementWorker] Original image: ${originalImage?.url}`);
    console.log(`[ImageEnhancementWorker] Config:`, enhancedConfig);

    try {
      // Check if original image exists
      if (!originalImage || !originalImage.url) {
        throw new Error('Original image is required for enhancement');
      }

      // Check if OpenAI is configured
      if (!openAIImageService.isConfigured()) {
        console.warn('[ImageEnhancementWorker] OpenAI not configured, using mock implementation');
        return await this.processMock(jobId, itemIndex, enhancedConfig);
      }

      await this.updateProgress(jobId, itemIndex, 10);

      // Generate enhanced variations from original image
      // Always generates 3 images: 1 catalog + 2 styled variations
      const scenario = enhancedConfig.scenario || 'table';
      const orientation = enhancedConfig.orientation || 'portrait';

      // Build full URL for original image
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const originalImageUrl = originalImage.url.startsWith('http') 
        ? originalImage.url 
        : `${baseUrl}${originalImage.url}`;

      console.log(`[ImageEnhancementWorker] Creating 3 enhanced variations (1 catalog + 2 ${scenario})`);
      console.log(`[ImageEnhancementWorker] From original image: ${originalImageUrl}`);
      console.log(`[ImageEnhancementWorker] Orientation: ${orientation}`);
      
      await this.updateProgress(jobId, itemIndex, 20);
      
      const imageUrls = await openAIImageService.generateEnhancedImages(
        productInfo.name,
        productInfo.description || '',
        scenario,
        originalImageUrl,
        orientation
      );

      // Download and save images
      await this.updateProgress(jobId, itemIndex, 60);
      const savedImages = await this.downloadAndSaveImages(imageUrls);

      await this.updateProgress(jobId, itemIndex, 100);

      console.log(`[ImageEnhancementWorker] Successfully generated ${savedImages.length} images`);

      return {
        jobId,
        itemIndex,
        success: true,
        result: {
          images: savedImages,
          count: savedImages.length,
        },
      };
    } catch (error) {
      console.error(`[ImageEnhancementWorker] Error:`, error);
      return {
        jobId,
        itemIndex,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Download images from URLs and save to storage
   */
  private async downloadAndSaveImages(imageUrls: string[]): Promise<string[]> {
    const savedPaths: string[] = [];

    for (let i = 0; i < imageUrls.length; i++) {
      try {
        console.log(`[ImageEnhancementWorker] Downloading image ${i + 1}/${imageUrls.length}`);
        
        // Download image from OpenAI URL
        const imageBuffer = await openAIImageService.downloadImage(imageUrls[i]);
        
        // Save to storage
        const filename = storageService.generateFilename('png');
        const relativePath = `enhanced/${filename}`;
        await storageService.writeFile(relativePath, imageBuffer);
        
        const savedPath = `/uploads/${relativePath}`;
        savedPaths.push(savedPath);
        
        console.log(`[ImageEnhancementWorker] Saved image ${i + 1}: ${savedPath}`);
      } catch (error) {
        console.error(`[ImageEnhancementWorker] Error downloading image ${i + 1}:`, error);
        // Continue with other images even if one fails
      }
    }

    console.log(`[ImageEnhancementWorker] Successfully saved ${savedPaths.length}/${imageUrls.length} images`);
    return savedPaths;
  }

  /**
   * Mock implementation when OpenAI is not configured
   */
  private async processMock(
    jobId: string,
    itemIndex: number,
    config: EnhancedImagesConfig
  ): Promise<WorkerJobResult> {
    console.log(`[ImageEnhancementWorker] Using mock implementation`);
    
    await this.updateProgress(jobId, itemIndex, 50);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await this.updateProgress(jobId, itemIndex, 100);

    // Return mock result (always 3 images: 1 catalog + 2 scenario)
    const mockImages = Array.from({ length: 3 }, (_, i) => 
      `/uploads/enhanced/mock-${Date.now()}-${i}.png`
    );

    return {
      jobId,
      itemIndex,
      success: true,
      result: {
        images: mockImages,
        count: mockImages.length,
      },
    };
  }
}

// Run as standalone if executed directly
if (require.main === module) {
  const worker = new ImageEnhancementWorker();

  async function start() {
    console.log('[ImageEnhancementWorker] Starting as standalone...');
    await mongoService.connect();
    await worker.start();
    console.log('[ImageEnhancementWorker] Ready to process jobs');
  }

  async function shutdown() {
    console.log('\n[ImageEnhancementWorker] Shutting down...');
    await worker.stop();
    await queueManager.closeAll();
    await mongoService.disconnect();
    process.exit(0);
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  start().catch((error) => {
    console.error('[ImageEnhancementWorker] Failed to start:', error);
    process.exit(1);
  });
}
