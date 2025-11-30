# Workers Package

This directory contains the Bull queue workers for processing Productify jobs.

## Architecture

The worker system is designed to be:
- **Modular**: Each worker handles a specific type of job
- **Scalable**: Workers can run on separate machines
- **Resilient**: Built-in retry logic and error handling
- **Observable**: Comprehensive logging and progress tracking

## Workers

### 1. Image Enhancement Worker
- **Queue**: `images-queue`
- **Concurrency**: 2
- **Purpose**: Enhance product images using Google Nano Banana API
- **Input**: Original product image
- **Output**: Multiple enhanced images

### 2. Text Generation Worker
- **Queue**: `text-queue`
- **Concurrency**: 3
- **Purpose**: Generate viral copy for social media platforms using Grok AI
- **Model**: x-ai/grok-2-1212 (via OpenRouter)
- **Input**: Product info, platform, tone
- **Output**: Platform-specific marketing text with hashtags and emojis

### 3. Voice-Over Worker
- **Queue**: `voiceover-queue`
- **Concurrency**: 3
- **Purpose**: Generate voice-overs using Google TTS
- **Input**: Text from text generation
- **Output**: Audio file (MP3)

### 4. Caption Generation Worker
- **Queue**: `captions-queue`
- **Concurrency**: 2
- **Purpose**: Generate captions from audio using Whisper.cpp
- **Input**: Audio from voice-over generation
- **Output**: SRT caption file

### 5. Video Generation Worker
- **Queue**: `video-queue`
- **Concurrency**: 1 (CPU intensive)
- **Purpose**: Generate promotional videos using Remotion
- **Input**: Enhanced images, text, captions, audio
- **Output**: MP4 video file

## Setup

### Prerequisites
- Node.js 18+
- MongoDB running
- Redis running
- Access to project root (for file storage)

### Installation

```bash
cd workers
npm install
cp .env.example .env
# Edit .env with your configuration
```

### Environment Variables

```bash
MONGODB_URI=mongodb://localhost:27017/productify
REDIS_URL=redis://localhost:6379
OPENROUTER_API_KEY=sk-or-v1-... # Get from https://openrouter.ai/keys
WORKERS=images,text,voiceover,captions,video
```

### Getting OpenRouter API Key

1. Visit [https://openrouter.ai](https://openrouter.ai)
2. Sign up or log in
3. Go to [API Keys](https://openrouter.ai/keys)
4. Create a new API key
5. Add credits to your account (pay-as-you-go)
6. Copy the key and add to your `.env` file

The text generation worker uses **Grok 2 (x-ai/grok-2-1212)** model for generating viral social media copy.

## Running Workers

### Start All Workers
```bash
npm run dev
```

### Start Specific Workers
```bash
# Only image enhancement
npm run worker:images

# Only text generation
npm run worker:text

# Only captions
npm run worker:captions

# Only video generation
npm run worker:video
```

### Start Multiple Workers on Different Machines
```bash
# Machine 1: Image and text workers
WORKERS=images,text npm run dev

# Machine 2: Video worker (CPU intensive)
WORKERS=video npm run dev

# Machine 3: Captions and voice-over
WORKERS=captions,voiceover npm run dev
```

## Production

### Build
```bash
npm run build
```

### Run
```bash
npm start
```

## Pipeline Flow

Jobs can be orchestrated in pipelines:

1. **Enhanced Images Only**
   - images-queue → Complete

2. **Viral Copy Only**
   - text-queue → Complete

3. **Voice-Over Only**
   - text-queue → voiceover-queue → Complete

4. **Full Video Pipeline**
   - images-queue → text-queue → voiceover-queue → captions-queue → video-queue → Complete

## Monitoring

Workers log comprehensive information:
- Job start/completion
- Progress updates
- Errors and retries
- Queue statistics

You can also use Bull Board for visual monitoring (to be added).

## Error Handling

- **Retries**: Jobs automatically retry 3 times with exponential backoff
- **Failed Jobs**: Kept for 7 days for debugging
- **Completed Jobs**: Kept for 24 hours

## Development

### Adding a New Worker

1. Create `src/workers/your-worker.worker.ts`:
```typescript
import { Job as BullJob } from 'bull';
import { BaseWorker } from '../core/base-worker';
import { WorkerJobData, WorkerJobResult } from '../core/types';

export class YourWorker extends BaseWorker {
  queueName = 'your-queue';
  concurrency = 2;

  async process(job: BullJob<WorkerJobData>): Promise<WorkerJobResult> {
    // Implement your logic
  }
}
```

2. Register in `src/index.ts`:
```typescript
import { YourWorker } from './workers/your-worker.worker';

// In startWorkers()
if (workersToStart.includes('your-worker')) {
  const yourWorker = new YourWorker();
  await yourWorker.start();
  workers.push({ name: 'YourWorker', instance: yourWorker });
}
```

3. Add script to `package.json`:
```json
"worker:your-worker": "ts-node-dev --respawn src/index.ts -- WORKERS=your-worker"
```

## Integration with Main App

The main Next.js app adds jobs to queues via:
```typescript
import { queueManager } from '@/lib/queue-manager';

await queueManager.addJob('images-queue', {
  jobId: job._id.toString(),
  itemIndex: 0,
  type: 'enhanced-images',
  config: { count: 3 },
  originalImage: job.originalImage,
  productInfo: job.productInfo,
});
```

## TODO

- [ ] Implement actual AI service integrations
- [ ] Add Bull Board for monitoring
- [ ] Implement health checks
- [ ] Add metrics collection
- [ ] Docker support
- [ ] Kubernetes manifests
