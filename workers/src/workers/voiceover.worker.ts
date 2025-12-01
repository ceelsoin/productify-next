import dotenv from 'dotenv';
import { join } from 'path';
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
import { OpenAI } from 'openai';
import { Job as JobModel } from '../models/job.model';

dotenv.config({ path: join(__dirname, '../../.env') });

/**
 * Voice-Over Generation Worker
 * Generates voice-overs using OpenAI TTS
 */
export class VoiceOverWorker extends BaseWorker {
  queueName = 'voiceover-queue';
  concurrency = 3; // Process 3 jobs at a time
  private openai: OpenAI;

  constructor() {
    super();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async process(job: BullJob<WorkerJobData>): Promise<WorkerJobResult> {
    this.validateJobData(job);

    const { jobId, itemIndex, config, previousResults } = job.data;
    const voiceConfig = config as VoiceOverConfig;

    console.log(`[VoiceOverWorker] Processing job ${jobId}, item ${itemIndex}`);
    console.log(`[VoiceOverWorker] Config:`, voiceConfig);

    try {
      // Get job from database
      const jobDoc = await JobModel.findById(jobId);
      if (!jobDoc) {
        throw new Error('Job not found');
      }

      // Get or generate script
      let script = voiceConfig.scriptText;
      
      if (!script) {
        console.log('[VoiceOverWorker] Generating script...');
        await this.updateProgress(jobId, itemIndex, 20);
        script = await this.generateScript(
          jobDoc.productInfo.name,
          jobDoc.productInfo.description
        );
      }

      // Generate voice-over with OpenAI TTS
      await this.updateProgress(jobId, itemIndex, 50);
      const audioBuffer = await this.generateVoiceOver(script, voiceConfig);

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
          script,
          duration: this.estimateAudioDuration(script),
          format: 'mp3',
          voice: voiceConfig.voice || 'nova',
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
   * Generate script for voice-over using GPT-4
   */
  private async generateScript(
    productName: string,
    productDescription: string
  ): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `Você é um roteirista especializado em criar scripts para narrações de vídeos promocionais de produtos.
Crie um script curto, envolvente e persuasivo de 30-45 segundos.
O script deve:
- Começar com um gancho atraente
- Destacar os principais benefícios do produto
- Incluir um call-to-action no final
- Ser natural para narração em voz
- Ser em português do Brasil`,
        },
        {
          role: 'user',
          content: `Produto: ${productName}\nDescrição: ${productDescription}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    return completion.choices[0].message.content || '';
  }

  /**
   * Generate voice-over using OpenAI TTS
   */
  private async generateVoiceOver(
    text: string,
    config: VoiceOverConfig
  ): Promise<Buffer> {
    const voice = config.voice || 'nova';
    const model = config.model || 'tts-1-hd';
    const speed = config.speed || 1.0;

    console.log(`[VoiceOverWorker] Generating voice-over with OpenAI TTS...`);
    console.log(`[VoiceOverWorker] Text length: ${text.length} characters`);
    console.log(`[VoiceOverWorker] Voice: ${voice}, Model: ${model}, Speed: ${speed}`);

    const mp3 = await this.openai.audio.speech.create({
      model,
      voice,
      input: text,
      speed,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    console.log(`[VoiceOverWorker] Generated audio buffer: ${buffer.length} bytes`);

    return buffer;
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
