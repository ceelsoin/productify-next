import dotenv from 'dotenv';
import { join } from 'path';
import { Job as BullJob } from 'bull';
import { BaseWorker } from '../core/base-worker';
import {
  WorkerJobData,
  WorkerJobResult,
  PromotionalVideoConfig,
} from '../core/types';
import { storageService } from '../services/storage.service';
import { mongoService } from '../services/mongodb.service';
import { Job } from '../../../lib/models/Job';
import { queueManager } from '../core/queue-manager';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { getAmbientMusicById } from '../constants/ambient-music';
import fs from 'fs/promises';
import path from 'path';

dotenv.config({ path: join(__dirname, '../../.env') });

/**
 * Video Generation Worker
 * Assembles promotional videos using Remotion
 */
export class VideoWorker extends BaseWorker {
  queueName = 'video-queue';
  concurrency = 1; // Video rendering is resource-intensive
  private bundledPath?: string;

  constructor() {
    super();
  }

  async process(job: BullJob<WorkerJobData>): Promise<WorkerJobResult> {
    this.validateJobData(job);

    const { jobId, itemIndex, config } = job.data;
    const videoConfig = config as PromotionalVideoConfig;

    console.log(`[VideoWorker] Processing job ${jobId}, item ${itemIndex}`);
    console.log(`[VideoWorker] Audio type:`, videoConfig.audioType);

    try {
      // Get enhanced images from job
      await this.updateProgress(jobId, itemIndex, 10);
      const enhancedImages = await this.getEnhancedImages(jobId, itemIndex);

      // Get audio source (voiceover or ambient music)
      await this.updateProgress(jobId, itemIndex, 20);
      const audioData = await this.getAudioSource(jobId, itemIndex, videoConfig);

      // Get captions if available
      let captionsData = null;
      if (videoConfig.includeCaptions && videoConfig.audioType === 'voiceover') {
        captionsData = await this.getCaptions(jobId, itemIndex);
      }

      // Bundle Remotion composition
      await this.updateProgress(jobId, itemIndex, 30);
      if (!this.bundledPath) {
        this.bundledPath = await this.bundleRemotionProject();
      }

      // Prepare composition input props
      const compositionProps = {
        images: enhancedImages,
        audio: audioData,
        captions: captionsData,
        transitions: videoConfig.transitions || 'fade',
        textOverlay: videoConfig.textOverlay || {},
        duration: videoConfig.duration || 30,
      };

      // Render video
      await this.updateProgress(jobId, itemIndex, 40);
      const outputPath = await this.renderVideo(
        compositionProps,
        jobId,
        itemIndex
      );

      await this.updateProgress(jobId, itemIndex, 100);

      return {
        jobId,
        itemIndex,
        success: true,
        result: {
          videoUrl: outputPath,
          duration: compositionProps.duration,
          format: 'mp4',
          resolution: '1920x1080',
          fps: 30,
        },
      };
    } catch (error) {
      console.error(`[VideoWorker] Error:`, error);
      return {
        jobId,
        itemIndex,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get enhanced images from previous job step
   */
  private async getEnhancedImages(
    jobId: string,
    itemIndex: number
  ): Promise<string[]> {
    const jobDoc = await Job.findById(jobId);

    if (!jobDoc || !jobDoc.items[itemIndex]) {
      throw new Error(`Job item not found: ${jobId}/${itemIndex}`);
    }

    const item = jobDoc.items[itemIndex];
    const enhancedStep = item.pipeline.find(
      (step: any) => step.type === 'enhanced-image'
    );

    if (!enhancedStep || !enhancedStep.result?.enhancedUrl) {
      throw new Error('Enhanced image not found');
    }

    return [enhancedStep.result.enhancedUrl];
  }

  /**
   * Get audio source (voiceover or ambient music)
   */
  private async getAudioSource(
    jobId: string,
    itemIndex: number,
    config: PromotionalVideoConfig
  ): Promise<{ url: string; type: 'voiceover' | 'ambient' }> {
    if (config.audioType === 'voiceover') {
      // Get voiceover from previous step
      const jobDoc = await Job.findById(jobId);

      if (!jobDoc || !jobDoc.items[itemIndex]) {
        throw new Error(`Job item not found: ${jobId}/${itemIndex}`);
      }

      const item = jobDoc.items[itemIndex];
      const voiceoverStep = item.pipeline.find(
        (step: any) => step.type === 'voiceover'
      );

      if (!voiceoverStep || !voiceoverStep.result?.audioUrl) {
        throw new Error('Voiceover audio not found');
      }

      return {
        url: voiceoverStep.result.audioUrl,
        type: 'voiceover',
      };
    } else {
      // Get ambient music from library
      if (!config.ambientMusicId) {
        throw new Error('Ambient music ID not specified');
      }

      const music = getAmbientMusicById(config.ambientMusicId);
      if (!music) {
        throw new Error(`Ambient music not found: ${config.ambientMusicId}`);
      }

      return {
        url: music.url,
        type: 'ambient',
      };
    }
  }

  /**
   * Get captions from previous step
   */
  private async getCaptions(
    jobId: string,
    itemIndex: number
  ): Promise<any[] | null> {
    const jobDoc = await Job.findById(jobId);

    if (!jobDoc || !jobDoc.items[itemIndex]) {
      return null;
    }

    const item = jobDoc.items[itemIndex];
    const captionsStep = item.pipeline.find(
      (step: any) => step.type === 'captions'
    );

    if (!captionsStep || !captionsStep.result?.captionsUrl) {
      return null;
    }

    // Read captions file
    const captionsPath = join(
      process.cwd(),
      '..',
      'public',
      captionsStep.result.captionsUrl
    );
    const captionsContent = await fs.readFile(captionsPath, 'utf-8');

    return JSON.parse(captionsContent);
  }

  /**
   * Bundle Remotion project
   */
  private async bundleRemotionProject(): Promise<string> {
    console.log('[VideoWorker] Bundling Remotion project...');

    const compositionPath = join(process.cwd(), '..', 'remotion', 'index.ts');

    const bundled = await bundle({
      entryPoint: compositionPath,
      webpackOverride: (config) => config,
    });

    console.log('[VideoWorker] Bundle complete:', bundled);
    return bundled;
  }

  /**
   * Render video with Remotion
   */
  private async renderVideo(
    compositionProps: any,
    jobId: string,
    itemIndex: number
  ): Promise<string> {
    if (!this.bundledPath) {
      throw new Error('Remotion project not bundled');
    }

    console.log('[VideoWorker] Rendering video...');
    console.log('[VideoWorker] Props:', JSON.stringify(compositionProps, null, 2));

    // Get composition
    const compositions = await selectComposition({
      serveUrl: this.bundledPath,
      id: 'PromotionalVideo',
      inputProps: compositionProps,
    });

    // Generate output path
    const filename = storageService.generateFilename('mp4');
    const relativePath = `videos/${filename}`;
    const outputPath = join(process.cwd(), '..', 'public', 'uploads', relativePath);

    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    // Render
    await renderMedia({
      composition: compositions,
      serveUrl: this.bundledPath,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: compositionProps,
      onProgress: ({ progress }) => {
        const percentage = Math.round(40 + progress * 60); // 40-100%
        this.updateProgress(jobId, itemIndex, percentage).catch(console.error);
      },
    });

    console.log('[VideoWorker] Video rendered:', outputPath);
    return `/uploads/${relativePath}`;
  }
}

// Run as standalone if executed directly
if (require.main === module) {
  const worker = new VideoWorker();

  async function start() {
    console.log('[VideoWorker] Starting as standalone...');
    await mongoService.connect();
    await worker.start();
    console.log('[VideoWorker] Ready to process jobs');
  }

  async function shutdown() {
    console.log('\n[VideoWorker] Shutting down...');
    await worker.stop();
    await queueManager.closeAll();
    await mongoService.disconnect();
    process.exit(0);
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  start().catch((error) => {
    console.error('[VideoWorker] Failed to start:', error);
    process.exit(1);
  });
}
