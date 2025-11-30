import dotenv from 'dotenv';
import { Job as BullJob } from 'bull';
import { BaseWorker } from '../core/base-worker';
import {
  WorkerJobData,
  WorkerJobResult,
  PromotionalVideoConfig,
} from '../core/types';
import { storageService } from '../services/storage.service';
import { mongoService } from '../services/mongodb.service';
import { queueManager } from '../core/queue-manager';

dotenv.config();

/**
 * Video Generation Worker
 * Generates promotional videos using Remotion
 */
export class VideoGenerationWorker extends BaseWorker {
  queueName = 'video-queue';
  concurrency = 1; // Process 1 job at a time (video rendering is CPU intensive)

  async process(job: BullJob<WorkerJobData>): Promise<WorkerJobResult> {
    this.validateJobData(job);

    const { jobId, itemIndex, config, productInfo, previousResults } = job.data;
    const videoConfig = config as PromotionalVideoConfig;

    console.log(`[VideoGenerationWorker] Processing job ${jobId}, item ${itemIndex}`);
    console.log(`[VideoGenerationWorker] Config:`, videoConfig);

    try {
      // Collect all assets needed for video
      await this.updateProgress(jobId, itemIndex, 10);
      const assets = {
        images: previousResults?.enhancedImages || [],
        text: previousResults?.text || '',
        captions: previousResults?.captions || '',
        audio: previousResults?.audio || '',
      };

      // Render video with Remotion
      await this.updateProgress(jobId, itemIndex, 30);
      const videoBuffer = await this.renderVideo(productInfo, videoConfig, assets);

      // Save video
      await this.updateProgress(jobId, itemIndex, 90);
      const videoPath = await this.saveVideo(videoBuffer);

      await this.updateProgress(jobId, itemIndex, 100);

      return {
        jobId,
        itemIndex,
        success: true,
        result: {
          videoUrl: videoPath,
          duration: videoConfig.duration,
          format: 'mp4',
        },
      };
    } catch (error) {
      console.error(`[VideoGenerationWorker] Error:`, error);
      return {
        jobId,
        itemIndex,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Render video using Remotion
   * TODO: Implement actual Remotion integration
   */
  private async renderVideo(
    productInfo: { name: string; description?: string },
    config: PromotionalVideoConfig,
    assets: {
      images: string[];
      text: string;
      captions: string;
      audio: string;
    }
  ): Promise<Buffer> {
    console.log(`[VideoGenerationWorker] Rendering video...`);
    console.log(`[VideoGenerationWorker] Assets:`, {
      images: assets.images.length,
      hasText: !!assets.text,
      hasCaptions: !!assets.captions,
      hasAudio: !!assets.audio,
    });

    // Mock implementation - simulate video rendering
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Return mock video buffer (empty for now)
    return Buffer.from([]);
  }

  /**
   * Save rendered video to storage
   */
  private async saveVideo(videoBuffer: Buffer): Promise<string> {
    const filename = storageService.generateFilename('mp4');
    const relativePath = `videos/${filename}`;
    await storageService.writeFile(relativePath, videoBuffer);

    console.log(`[VideoGenerationWorker] Saved video to ${relativePath}`);
    return `/uploads/${relativePath}`;
  }
}

// Run as standalone if executed directly
if (require.main === module) {
  const worker = new VideoGenerationWorker();

  async function start() {
    console.log('[VideoGenerationWorker] Starting as standalone...');
    await mongoService.connect();
    await worker.start();
    console.log('[VideoGenerationWorker] Ready to process jobs');
  }

  async function shutdown() {
    console.log('\n[VideoGenerationWorker] Shutting down...');
    await worker.stop();
    await queueManager.closeAll();
    await mongoService.disconnect();
    process.exit(0);
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  start().catch((error) => {
    console.error('[VideoGenerationWorker] Failed to start:', error);
    process.exit(1);
  });
}
