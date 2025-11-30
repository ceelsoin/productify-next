import { Job as BullJob, Queue } from 'bull';
import {
  IWorker,
  WorkerJobData,
  WorkerJobResult,
  JobItemStatus,
  JobStatus,
} from './types';
import { queueManager } from './queue-manager';
import { mongoService } from '../services/mongodb.service';
import { Job } from '../models/job.model';

/**
 * Base worker class with shared functionality
 */
export abstract class BaseWorker implements IWorker {
  abstract queueName: string;
  abstract concurrency: number;

  protected queue: Queue | null = null;

  /**
   * Process a job - to be implemented by subclasses
   */
  abstract process(job: BullJob<WorkerJobData>): Promise<WorkerJobResult>;

  /**
   * Start the worker
   */
  async start(): Promise<void> {
    console.log(`[Worker:${this.queueName}] Starting...`);

    // Ensure MongoDB is connected
    if (!mongoService.isConnected()) {
      await mongoService.connect();
    }

    // Get or create queue
    this.queue = queueManager.getQueue(this.queueName);

    // Register processor
    this.queue.process(this.concurrency, async (job: BullJob<WorkerJobData>) => {
      console.log(`[Worker:${this.queueName}] Processing job ${job.id}`);

      try {
        // Update job item status to processing
        await this.updateJobItem(job.data.jobId, job.data.itemIndex, {
          status: JobItemStatus.PROCESSING,
          progress: 0,
        });

        // Process the job
        const result = await this.process(job);

        // Update job item with result
        await this.updateJobItem(job.data.jobId, job.data.itemIndex, {
          status: result.success ? JobItemStatus.COMPLETED : JobItemStatus.FAILED,
          progress: 100,
          result: result.result,
          error: result.error,
        });

        // Update overall job status and progress
        await this.updateJobStatus(job.data.jobId);

        // Notify orchestrator of completion
        await queueManager.addJob('orchestrator-result', result);
        console.log(`[Worker:${this.queueName}] Notified orchestrator of completion`);

        // Chain to next worker if specified
        if (result.success && result.nextWorker) {
          await queueManager.addJob(result.nextWorker.queue, result.nextWorker.data);
        }

        return result;
      } catch (error) {
        console.error(`[Worker:${this.queueName}] Job ${job.id} error:`, error);

        // Update job item with error
        await this.updateJobItem(job.data.jobId, job.data.itemIndex, {
          status: JobItemStatus.FAILED,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        // Update overall job status
        await this.updateJobStatus(job.data.jobId);

        throw error;
      }
    });

    console.log(`[Worker:${this.queueName}] Started with concurrency ${this.concurrency}`);
  }

  /**
   * Stop the worker
   */
  async stop(): Promise<void> {
    console.log(`[Worker:${this.queueName}] Stopping...`);

    if (this.queue) {
      await this.queue.close();
      this.queue = null;
    }

    console.log(`[Worker:${this.queueName}] Stopped`);
  }

  /**
   * Update progress for a job item
   */
  protected async updateProgress(jobId: string, itemIndex: number, progress: number): Promise<void> {
    await this.updateJobItem(jobId, itemIndex, { progress });
    await this.updateJobStatus(jobId);
  }

  /**
   * Update a job item in the database
   */
  protected async updateJobItem(
    jobId: string,
    itemIndex: number,
    update: Partial<{
      status: JobItemStatus;
      progress: number;
      result: unknown;
      error: string;
    }>
  ): Promise<void> {
    const updateFields: Record<string, unknown> = {};

    if (update.status !== undefined) {
      updateFields[`items.${itemIndex}.status`] = update.status;
    }
    if (update.progress !== undefined) {
      updateFields[`items.${itemIndex}.progress`] = update.progress;
    }
    if (update.result !== undefined) {
      updateFields[`items.${itemIndex}.result`] = update.result;
      console.log(`[BaseWorker] Saving result for job ${jobId}, item ${itemIndex}:`, JSON.stringify(update.result, null, 2));
    }
    if (update.error !== undefined) {
      updateFields[`items.${itemIndex}.error`] = update.error;
    }

    updateFields.updatedAt = new Date();

    const updated = await Job.findByIdAndUpdate(jobId, { $set: updateFields }, { new: true });
    console.log(`[BaseWorker] Job updated. Result saved:`, updated?.items[itemIndex]?.result ? 'YES' : 'NO');
  }

  /**
   * Update overall job status and progress based on items
   */
  protected async updateJobStatus(jobId: string): Promise<void> {
    const job = await Job.findById(jobId);
    if (!job) return;

    const items = job.items as Array<{ status: JobItemStatus; progress: number }>;
    
    // Calculate overall progress
    const totalProgress = items.reduce((sum, item) => sum + item.progress, 0);
    const averageProgress = Math.round(totalProgress / items.length);

    // Determine overall status
    const allCompleted = items.every(item => item.status === JobItemStatus.COMPLETED);
    const anyFailed = items.some(item => item.status === JobItemStatus.FAILED);
    const anyProcessing = items.some(item => item.status === JobItemStatus.PROCESSING);

    let status: JobStatus;
    if (allCompleted) {
      status = JobStatus.COMPLETED;
    } else if (anyFailed) {
      status = JobStatus.FAILED;
    } else if (anyProcessing) {
      status = JobStatus.PROCESSING;
    } else {
      status = JobStatus.PENDING;
    }

    await Job.findByIdAndUpdate(jobId, {
      $set: {
        status,
        progress: averageProgress,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Helper to validate required data
   */
  protected validateJobData(job: BullJob<WorkerJobData>): void {
    if (!job.data.jobId) {
      throw new Error('Missing jobId in job data');
    }
    if (job.data.itemIndex === undefined) {
      throw new Error('Missing itemIndex in job data');
    }
    if (!job.data.type) {
      throw new Error('Missing type in job data');
    }
  }
}
