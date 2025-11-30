import dotenv from 'dotenv';
import { Job as BullJob } from 'bull';
import { BaseWorker } from '../core/base-worker';
import {
  WorkerJobData,
  WorkerJobResult,
  VoiceOverConfig,
} from '../core/types';
import { storageService } from '../services/storage.service';
import { mongoService } from '../services/mongodb.service';
import { queueManager } from '../core/queue-manager';

dotenv.config();

/**
 * Voice-Over Generation Worker
 * Generates voice-overs using Google TTS
 */
export class VoiceOverWorker extends BaseWorker {
  queueName = 'voiceover-queue';
  concurrency = 3; // Process 3 jobs at a time

  async process(job: BullJob<WorkerJobData>): Promise<WorkerJobResult> {
    this.validateJobData(job);

    const { jobId, itemIndex, config, previousResults } = job.data;
    const voiceConfig = config as VoiceOverConfig;

    console.log(`[VoiceOverWorker] Processing job ${jobId}, item ${itemIndex}`);
    console.log(`[VoiceOverWorker] Config:`, voiceConfig);

    try {
      // Get text to convert to speech
      const text = previousResults?.text || '';
      if (!text) {
        throw new Error('No text found for voice-over generation');
      }

      // Generate voice-over with Google TTS
      await this.updateProgress(jobId, itemIndex, 30);
      const audioBuffer = await this.generateVoiceOver(text, voiceConfig);

      // Save audio file
      await this.updateProgress(jobId, itemIndex, 80);
      const audioPath = await this.saveAudio(audioBuffer);

      await this.updateProgress(jobId, itemIndex, 100);

      return {
        jobId,
        itemIndex,
        success: true,
        result: {
          audioUrl: audioPath,
          duration: this.estimateAudioDuration(text),
          format: 'mp3',
          language: voiceConfig.language,
        },
      };
    } catch (error) {
      console.error(`[VoiceOverWorker] Error:`, error);
      return {
        jobId,
        itemIndex,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate voice-over using Google TTS
   * TODO: Implement actual Google TTS integration
   */
  private async generateVoiceOver(
    text: string,
    config: VoiceOverConfig
  ): Promise<Buffer> {
    console.log(`[VoiceOverWorker] Generating voice-over...`);
    console.log(`[VoiceOverWorker] Text length: ${text.length} characters`);
    console.log(`[VoiceOverWorker] Language: ${config.language}`);

    // Mock implementation - simulate TTS API call
    await new Promise(resolve => setTimeout(resolve, 4000));

    // Return mock audio buffer (empty for now)
    return Buffer.from([]);
  }

  /**
   * Save audio to storage
   */
  private async saveAudio(audioBuffer: Buffer): Promise<string> {
    const filename = storageService.generateFilename('mp3');
    const relativePath = `audio/${filename}`;
    await storageService.writeFile(relativePath, audioBuffer);

    console.log(`[VoiceOverWorker] Saved audio to ${relativePath}`);
    return `/uploads/${relativePath}`;
  }

  /**
   * Estimate audio duration based on text length
   * Rough estimate: ~150 words per minute
   */
  private estimateAudioDuration(text: string): number {
    const words = text.split(/\s+/).length;
    const minutes = words / 150;
    return Math.ceil(minutes * 60); // Return seconds
  }
}

// Run as standalone if executed directly
if (require.main === module) {
  const worker = new VoiceOverWorker();

  async function start() {
    console.log('[VoiceOverWorker] Starting as standalone...');
    await mongoService.connect();
    await worker.start();
    console.log('[VoiceOverWorker] Ready to process jobs');
  }

  async function shutdown() {
    console.log('\n[VoiceOverWorker] Shutting down...');
    await worker.stop();
    await queueManager.closeAll();
    await mongoService.disconnect();
    process.exit(0);
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  start().catch((error) => {
    console.error('[VoiceOverWorker] Failed to start:', error);
    process.exit(1);
  });
}
