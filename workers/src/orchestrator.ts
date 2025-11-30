import dotenv from 'dotenv';
import { join } from 'path';
import { Job as BullJob, Queue } from 'bull';
import { mongoService } from './services/mongodb.service';
import { queueManager } from './core/queue-manager';
import { orchestrator } from './core/orchestrator';
import { getPipeline } from './core/pipelines';

dotenv.config({ path: join(__dirname, '../.env') });

interface OrchestratorJobData {
  jobId: string;
  pipelineName: string;
}

/**
 * Orchestrator Worker
 * Listens to orchestrator-queue and manages pipeline executions
 */
class OrchestratorWorker {
  private queue: Queue | null = null;
  private readonly queueName = 'orchestrator-queue';

  async start() {
    console.log('[Orchestrator] Starting...');

    // Connect to MongoDB
    await mongoService.connect();

    // Get orchestrator queue
    this.queue = queueManager.getQueue(this.queueName);

    // Process orchestrator jobs
    this.queue.process(async (job: BullJob<OrchestratorJobData>) => {
      console.log(`[Orchestrator] Processing job ${job.id}`);
      const { jobId, pipelineName } = job.data;

      try {
        // Get pipeline definition
        const pipeline = getPipeline(pipelineName);
        if (!pipeline) {
          throw new Error(`Pipeline "${pipelineName}" not found`);
        }

        console.log(`[Orchestrator] Starting pipeline "${pipeline.name}" for job ${jobId}`);

        // Start pipeline execution
        await orchestrator.startPipeline(jobId, pipeline);

        return { success: true, jobId, pipeline: pipeline.name };
      } catch (error) {
        console.error(`[Orchestrator] Error processing job:`, error);
        throw error;
      }
    });

    // Listen to worker result queues to track completions
    this.setupWorkerListeners();

    console.log('[Orchestrator] Ready to orchestrate pipelines');
  }

  /**
   * Setup listeners for worker completion events
   */
  private setupWorkerListeners() {
    // Listen to orchestrator-result queue for worker completions
    const resultQueue = queueManager.getQueue('orchestrator-result');

    resultQueue.process(async (job: BullJob) => {
      console.log(`[Orchestrator] Received worker result:`, job.data);
      
      // Notify orchestrator of completion
      await orchestrator.handleStepComplete(job.data);
      
      return { success: true };
    });

    console.log('[Orchestrator] Listening to worker results on orchestrator-result queue');
  }

  async stop() {
    console.log('[Orchestrator] Stopping...');
    
    if (this.queue) {
      await this.queue.close();
    }

    console.log('[Orchestrator] Stopped');
  }
}

/**
 * Start orchestrator worker
 */
async function start() {
  const worker = new OrchestratorWorker();

  try {
    await worker.start();
  } catch (error) {
    console.error('[Orchestrator] Failed to start:', error);
    process.exit(1);
  }

  // Graceful shutdown
  async function shutdown() {
    console.log('\n[Orchestrator] Shutting down...');
    
    try {
      await worker.stop();
      await queueManager.closeAll();
      await mongoService.disconnect();
      console.log('[Orchestrator] Shutdown complete');
      process.exit(0);
    } catch (error) {
      console.error('[Orchestrator] Error during shutdown:', error);
      process.exit(1);
    }
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

// Run as standalone if executed directly
if (require.main === module) {
  start();
}
