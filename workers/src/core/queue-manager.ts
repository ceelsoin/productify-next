import Bull, { Queue, Job as BullJob } from 'bull';
import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

/**
 * Queue manager for Bull queues
 */
class QueueManager {
  private queues: Map<string, Queue> = new Map();
  private redisClient: Redis | null = null;

  /**
   * Initialize Redis connection
   */
  private getRedisClient(): Redis {
    if (!this.redisClient) {
      this.redisClient = new Redis(REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      });
    }
    return this.redisClient;
  }

  /**
   * Get or create a queue
   */
  getQueue(name: string): Queue {
    if (this.queues.has(name)) {
      return this.queues.get(name)!;
    }

    const queue = new Bull(name, {
      redis: REDIS_URL,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: {
          age: 24 * 3600, // Keep completed jobs for 24 hours
        },
        removeOnFail: {
          age: 7 * 24 * 3600, // Keep failed jobs for 7 days
        },
      },
    });

    // Log queue events
    queue.on('error', (error) => {
      console.error(`[Queue:${name}] Error:`, error);
    });

    queue.on('waiting', (jobId) => {
      console.log(`[Queue:${name}] Job ${jobId} is waiting`);
    });

    queue.on('active', (job: BullJob) => {
      console.log(`[Queue:${name}] Job ${job.id} is active`);
    });

    queue.on('completed', (job: BullJob, result: unknown) => {
      console.log(`[Queue:${name}] Job ${job.id} completed`);
    });

    queue.on('failed', (job: BullJob, err: Error) => {
      console.error(`[Queue:${name}] Job ${job.id} failed:`, err.message);
    });

    this.queues.set(name, queue);
    return queue;
  }

  /**
   * Add a job to a queue
   */
  async addJob(queueName: string, data: unknown, options?: Bull.JobOptions): Promise<BullJob> {
    const queue = this.getQueue(queueName);
    return queue.add(data, options);
  }

  /**
   * Close all queues and Redis connection
   */
  async closeAll(): Promise<void> {
    console.log('[QueueManager] Closing all queues...');
    
    const closePromises = Array.from(this.queues.values()).map(queue => queue.close());
    await Promise.all(closePromises);
    
    if (this.redisClient) {
      await this.redisClient.quit();
      this.redisClient = null;
    }
    
    this.queues.clear();
    console.log('[QueueManager] All queues closed');
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(queueName: string): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const queue = this.getQueue(queueName);
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return { waiting, active, completed, failed, delayed };
  }

  /**
   * Pause a queue
   */
  async pauseQueue(queueName: string): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.pause();
    console.log(`[QueueManager] Queue ${queueName} paused`);
  }

  /**
   * Resume a queue
   */
  async resumeQueue(queueName: string): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.resume();
    console.log(`[QueueManager] Queue ${queueName} resumed`);
  }

  /**
   * Clean completed/failed jobs
   */
  async cleanQueue(queueName: string, grace: number = 24 * 3600 * 1000): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.clean(grace, 'completed');
    await queue.clean(grace, 'failed');
    console.log(`[QueueManager] Queue ${queueName} cleaned`);
  }
}

export const queueManager = new QueueManager();
