import dotenv from 'dotenv';
import { join } from 'path';
import { Job as BullJob } from 'bull';
import { BaseWorker } from '../core/base-worker';
import {
  WorkerJobData,
  WorkerJobResult,
} from '../core/types';
import { mongoService } from '../services/mongodb.service';
import { queueManager } from '../core/queue-manager';

dotenv.config({ path: join(__dirname, '../../.env') });

/**
 * Caption Generation Worker
 * Generates captions from video audio using Whisper.cpp
 */
export class CaptionGenerationWorker extends BaseWorker {
  queueName = 'captions-queue';
  concurrency = 2; // Process 2 jobs at a time

  async process(job: BullJob<WorkerJobData>): Promise<WorkerJobResult> {
    this.validateJobData(job);

    const { jobId, itemIndex, previousResults } = job.data;

    console.log(`[CaptionGenerationWorker] Processing job ${jobId}, item ${itemIndex}`);

    try {
      // Check if we have audio from voice-over generation
      if (!previousResults?.audio) {
        throw new Error('No audio file found in previous results');
      }

      // Generate captions from audio
      await this.updateProgress(jobId, itemIndex, 30);
      const captions = await this.generateCaptions(previousResults.audio);

      await this.updateProgress(jobId, itemIndex, 100);

      return {
        jobId,
        itemIndex,
        success: true,
        result: {
          captions,
          format: 'srt',
        },
      };
    } catch (error) {
      console.error(`[CaptionGenerationWorker] Error:`, error);
      return {
        jobId,
        itemIndex,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate captions using Whisper.cpp
   * TODO: Implement actual Whisper.cpp integration
   */
  private async generateCaptions(audioPath: string): Promise<string> {
    console.log(`[CaptionGenerationWorker] Generating captions from ${audioPath}...`);

    // Mock implementation - simulate Whisper processing
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Generate mock SRT format captions
    const mockCaptions = `1
00:00:00,000 --> 00:00:03,000
Welcome to our amazing product showcase

2
00:00:03,000 --> 00:00:06,000
Experience innovation like never before

3
00:00:06,000 --> 00:00:09,000
Get yours today and transform your life
`;

    return mockCaptions;
  }
}

// Run as standalone if executed directly
if (require.main === module) {
  const worker = new CaptionGenerationWorker();

  async function start() {
    console.log('[CaptionGenerationWorker] Starting as standalone...');
    await mongoService.connect();
    await worker.start();
    console.log('[CaptionGenerationWorker] Ready to process jobs');
  }

  async function shutdown() {
    console.log('\n[CaptionGenerationWorker] Shutting down...');
    await worker.stop();
    await queueManager.closeAll();
    await mongoService.disconnect();
    process.exit(0);
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  start().catch((error) => {
    console.error('[CaptionGenerationWorker] Failed to start:', error);
    process.exit(1);
  });
}
