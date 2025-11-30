import dotenv from 'dotenv';
import { mongoService } from './services/mongodb.service';
import { queueManager } from './core/queue-manager';
import { ImageEnhancementWorker } from './workers/image-enhancement.worker';
import { TextGenerationWorker } from './workers/text-generation.worker';
import { VoiceOverWorker } from './workers/voiceover.worker';
import { CaptionGenerationWorker } from './workers/caption-generation.worker';
import { VideoGenerationWorker } from './workers/video-generation.worker';

// Load environment variables
dotenv.config({
  path: "../.env"
});

// Track active workers
const workers: Array<{
  name: string;
  instance: ImageEnhancementWorker | TextGenerationWorker | VoiceOverWorker | CaptionGenerationWorker | VideoGenerationWorker;
}> = [];

/**
 * Start all workers
 */
async function startWorkers() {
  console.log('[Productify Workers] Starting...');
  console.log('[Productify Workers] Environment:', {
    mongoUri: process.env.MONGODB_URI ? '✓ Set' : '✗ Not set',
    redisUrl: process.env.REDIS_URL ? '✓ Set' : '✗ Not set',
  });

  try {
    // Connect to MongoDB
    await mongoService.connect();

    // Initialize workers based on environment variable or start all
    const workersToStart = process.env.WORKERS?.split(',') || [
      'images',
      'text',
      'voiceover',
      'captions',
      'video',
    ];

    console.log('[Productify Workers] Starting workers:', workersToStart);

    if (workersToStart.includes('images')) {
      const imageWorker = new ImageEnhancementWorker();
      await imageWorker.start();
      workers.push({ name: 'ImageEnhancement', instance: imageWorker });
    }

    if (workersToStart.includes('text')) {
      const textWorker = new TextGenerationWorker();
      await textWorker.start();
      workers.push({ name: 'TextGeneration', instance: textWorker });
    }

    if (workersToStart.includes('voiceover')) {
      const voiceoverWorker = new VoiceOverWorker();
      await voiceoverWorker.start();
      workers.push({ name: 'VoiceOver', instance: voiceoverWorker });
    }

    if (workersToStart.includes('captions')) {
      const captionsWorker = new CaptionGenerationWorker();
      await captionsWorker.start();
      workers.push({ name: 'CaptionGeneration', instance: captionsWorker });
    }

    if (workersToStart.includes('video')) {
      const videoWorker = new VideoGenerationWorker();
      await videoWorker.start();
      workers.push({ name: 'VideoGeneration', instance: videoWorker });
    }

    console.log(`[Productify Workers] ${workers.length} worker(s) started successfully`);
    console.log('[Productify Workers] Press Ctrl+C to stop');
  } catch (error) {
    console.error('[Productify Workers] Failed to start:', error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 */
async function shutdown() {
  console.log('\n[Productify Workers] Shutting down...');

  try {
    // Stop all workers
    await Promise.all(workers.map(w => w.instance.stop()));

    // Close queue manager
    await queueManager.closeAll();

    // Disconnect from MongoDB
    await mongoService.disconnect();

    console.log('[Productify Workers] Shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('[Productify Workers] Error during shutdown:', error);
    process.exit(1);
  }
}

// Handle shutdown signals
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('[Productify Workers] Uncaught exception:', error);
  shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Productify Workers] Unhandled rejection at:', promise, 'reason:', reason);
  shutdown();
});

// Start workers
startWorkers();
