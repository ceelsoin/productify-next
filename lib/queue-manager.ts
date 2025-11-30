import Bull from 'bull';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

class QueueManager {
  private queues: Map<string, Bull.Queue> = new Map();

  getQueue(name: string): Bull.Queue {
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
          age: 24 * 3600,
        },
        removeOnFail: {
          age: 7 * 24 * 3600,
        },
      },
    });

    this.queues.set(name, queue);
    return queue;
  }

  async addJob(queueName: string, data: unknown, options?: Bull.JobOptions): Promise<Bull.Job> {
    const queue = this.getQueue(queueName);
    return queue.add(data, options);
  }
}

export const queueManager = new QueueManager();
