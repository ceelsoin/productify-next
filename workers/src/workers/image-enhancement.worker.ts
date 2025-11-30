import dotenv from 'dotenv';
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

dotenv.config();

/**
 * Image Enhancement Worker
 * Processes enhanced-images generation using Google Nano Banana API
 */
export class ImageEnhancementWorker extends BaseWorker {
  queueName = 'images-queue';
  concurrency = 2; // Process 2 jobs at a time

  async process(job: BullJob<WorkerJobData>): Promise<WorkerJobResult> {
    this.validateJobData(job);

    const { jobId, itemIndex, config, originalImage } = job.data;
    const enhancedConfig = config as EnhancedImagesConfig;

    console.log(`[ImageEnhancementWorker] Processing job ${jobId}, item ${itemIndex}`);
    console.log(`[ImageEnhancementWorker] Config:`, enhancedConfig);

    try {
      // Read original image
      await this.updateProgress(jobId, itemIndex, 10);
      const imagePath = originalImage.url.replace('/uploads/', '');
      const imageBuffer = await storageService.readFile(imagePath);

      // Process image with Google Nano Banana (mock for now)
      await this.updateProgress(jobId, itemIndex, 30);
      const enhancedImages = await this.enhanceImages(
        imageBuffer,
        enhancedConfig
      );

      // Save enhanced images
      await this.updateProgress(jobId, itemIndex, 80);
      const savedImages = await this.saveEnhancedImages(enhancedImages);

      await this.updateProgress(jobId, itemIndex, 100);

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
   * Enhance images using Google Nano Banana API
   * TODO: Implement actual API integration
   */
  private async enhanceImages(
    imageBuffer: Buffer,
    config: EnhancedImagesConfig
  ): Promise<Buffer[]> {
    console.log(`[ImageEnhancementWorker] Enhancing ${config.count} images...`);

    // Mock implementation - simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Return mock enhanced images (same as original for now)
    const enhancedImages: Buffer[] = [];
    for (let i = 0; i < config.count; i++) {
      enhancedImages.push(imageBuffer);
    }

    return enhancedImages;
  }

  /**
   * Save enhanced images to storage
   */
  private async saveEnhancedImages(images: Buffer[]): Promise<string[]> {
    const savedPaths: string[] = [];

    for (let i = 0; i < images.length; i++) {
      const filename = storageService.generateFilename('jpg');
      const relativePath = `enhanced/${filename}`;
      await storageService.writeFile(relativePath, images[i]);
      savedPaths.push(`/uploads/${relativePath}`);
    }

    console.log(`[ImageEnhancementWorker] Saved ${savedPaths.length} images`);
    return savedPaths;
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
