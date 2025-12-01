import dotenv from 'dotenv';
import { join } from 'path';
import { Job as BullJob } from 'bull';
import { BaseWorker } from '../core/base-worker';
import {
  WorkerJobData,
  WorkerJobResult,
  CaptionsConfig,
} from '../core/types';
import { storageService } from '../services/storage.service';
import { mongoService } from '../services/mongodb.service';
import { queueManager } from '../core/queue-manager';
import { transcribe } from '@remotion/install-whisper-cpp';
import { downloadWhisperModel } from '@remotion/install-whisper-cpp';
import fs from 'fs/promises';
import path from 'path';

dotenv.config({ path: join(__dirname, '../../.env') });

/**
 * Captions Generation Worker
 * Generates captions/subtitles using Whisper.cpp
 */
export class CaptionsWorker extends BaseWorker {
  queueName = 'captions-queue';
  concurrency = 2; // Process 2 jobs at a time
  private whisperModelPath?: string;

  constructor() {
    super();
    this.initializeWhisperModel();
  }

  /**
   * Initialize Whisper model (download if needed)
   */
  private async initializeWhisperModel() {
    try {
      console.log('[CaptionsWorker] Initializing Whisper model...');
      
      // Download base model (ggml-base.bin - ~140MB)
      const modelPath = await downloadWhisperModel({
        model: 'base',
        folder: join(process.cwd(), 'whisper-models'),
      });

      this.whisperModelPath = modelPath;
      console.log('[CaptionsWorker] Whisper model ready:', modelPath);
    } catch (error) {
      console.error('[CaptionsWorker] Failed to initialize Whisper model:', error);
    }
  }

  async process(job: BullJob<WorkerJobData>): Promise<WorkerJobResult> {
    this.validateJobData(job);

    const { jobId, itemIndex, config } = job.data;
    const captionsConfig = config as CaptionsConfig;

    console.log(`[CaptionsWorker] Processing job ${jobId}, item ${itemIndex}`);
    console.log(`[CaptionsWorker] Audio URL:`, captionsConfig.audioUrl);

    try {
      if (!this.whisperModelPath) {
        throw new Error('Whisper model not initialized');
      }

      // Download audio file temporarily
      await this.updateProgress(jobId, itemIndex, 20);
      const audioPath = await this.downloadAudio(captionsConfig.audioUrl);

      // Transcribe audio with Whisper
      await this.updateProgress(jobId, itemIndex, 50);
      const transcription = await this.transcribeAudio(audioPath, captionsConfig);

      // Clean up temporary audio file
      await fs.unlink(audioPath);

      // Save captions file
      await this.updateProgress(jobId, itemIndex, 80);
      const captionsPath = await this.saveCaptions(transcription, captionsConfig.format || 'json');

      await this.updateProgress(jobId, itemIndex, 100);

      return {
        jobId,
        itemIndex,
        success: true,
        result: {
          captionsUrl: captionsPath,
          transcription,
          format: captionsConfig.format || 'json',
          language: captionsConfig.language || 'pt',
        },
      };
    } catch (error) {
      console.error(`[CaptionsWorker] Error:`, error);
      return {
        jobId,
        itemIndex,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Download audio file to temporary location
   */
  private async downloadAudio(audioUrl: string): Promise<string> {
    // If it's a local file, get the full path
    if (audioUrl.startsWith('/uploads/')) {
      const publicDir = join(process.cwd(), '..', 'public');
      return join(publicDir, audioUrl);
    }

    // If it's a remote URL, download it
    const response = await fetch(audioUrl);
    if (!response.ok) {
      throw new Error(`Failed to download audio: ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const tempPath = join(process.cwd(), 'temp', `audio-${Date.now()}.mp3`);
    
    await fs.mkdir(path.dirname(tempPath), { recursive: true });
    await fs.writeFile(tempPath, buffer);

    return tempPath;
  }

  /**
   * Transcribe audio using Whisper.cpp
   */
  private async transcribeAudio(
    audioPath: string,
    config: CaptionsConfig
  ): Promise<any> {
    console.log('[CaptionsWorker] Transcribing audio with Whisper...');

    if (!this.whisperModelPath) {
      throw new Error('Whisper model not initialized');
    }

    const result = await transcribe({
      inputPath: audioPath,
      whisperPath: this.whisperModelPath,
      model: 'base',
      tokenLevelTimestamps: true, // For word-level timing
    });

    console.log('[CaptionsWorker] Transcription complete');
    console.log('[CaptionsWorker] Segments:', result.transcription.length);

    return result.transcription;
  }

  /**
   * Save captions in requested format
   */
  private async saveCaptions(
    transcription: any[],
    format: string
  ): Promise<string> {
    const filename = storageService.generateFilename(format);
    const relativePath = `captions/${filename}`;

    let content: string;

    if (format === 'srt') {
      content = this.formatSRT(transcription);
    } else if (format === 'vtt') {
      content = this.formatVTT(transcription);
    } else {
      // JSON format (for Remotion)
      content = JSON.stringify(transcription, null, 2);
    }

    await storageService.writeFile(relativePath, Buffer.from(content, 'utf-8'));

    console.log(`[CaptionsWorker] Saved captions to ${relativePath}`);
    return `/uploads/${relativePath}`;
  }

  /**
   * Format transcription as SRT
   */
  private formatSRT(transcription: any[]): string {
    return transcription
      .map((segment, index) => {
        const start = this.formatTimestamp(segment.timestamps.from);
        const end = this.formatTimestamp(segment.timestamps.to);
        return `${index + 1}\n${start} --> ${end}\n${segment.text.trim()}\n`;
      })
      .join('\n');
  }

  /**
   * Format transcription as WebVTT
   */
  private formatVTT(transcription: any[]): string {
    const header = 'WEBVTT\n\n';
    const content = transcription
      .map((segment) => {
        const start = this.formatTimestamp(segment.timestamps.from);
        const end = this.formatTimestamp(segment.timestamps.to);
        return `${start} --> ${end}\n${segment.text.trim()}\n`;
      })
      .join('\n');
    return header + content;
  }

  /**
   * Format timestamp for SRT/VTT (HH:MM:SS,mmm)
   */
  private formatTimestamp(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms
      .toString()
      .padStart(3, '0')}`;
  }
}

// Run as standalone if executed directly
if (require.main === module) {
  const worker = new CaptionsWorker();

  async function start() {
    console.log('[CaptionsWorker] Starting as standalone...');
    await mongoService.connect();
    await worker.start();
    console.log('[CaptionsWorker] Ready to process jobs');
  }

  async function shutdown() {
    console.log('\n[CaptionsWorker] Shutting down...');
    await worker.stop();
    await queueManager.closeAll();
    await mongoService.disconnect();
    process.exit(0);
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  start().catch((error) => {
    console.error('[CaptionsWorker] Failed to start:', error);
    process.exit(1);
  });
}
