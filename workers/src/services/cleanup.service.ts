import { Job } from '../models/job.model';
import { JobStatus, JobItemStatus } from '../core/types';
import { RefundService } from '../services/refund.service';

/**
 * Cleanup service for handling stale jobs
 */
export class CleanupService {
  private static TIMEOUT_MS = 60 * 60 * 1000; // 1 hora em milissegundos
  private cleanupInterval: NodeJS.Timeout | null = null;

  /**
   * Start periodic cleanup of stale jobs
   */
  start(intervalMinutes: number = 15): void {
    if (this.cleanupInterval) {
      console.log('[CleanupService] Already running');
      return;
    }

    console.log(`[CleanupService] Starting cleanup service (runs every ${intervalMinutes} minutes)`);
    
    // Executar imediatamente
    this.cleanupStaleJobs();

    // Agendar execuções periódicas
    this.cleanupInterval = setInterval(
      () => this.cleanupStaleJobs(),
      intervalMinutes * 60 * 1000
    );
  }

  /**
   * Stop the cleanup service
   */
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('[CleanupService] Cleanup service stopped');
    }
  }

  /**
   * Clean up jobs that are stuck in processing/pending for more than timeout
   */
  async cleanupStaleJobs(): Promise<void> {
    try {
      const timeoutDate = new Date(Date.now() - CleanupService.TIMEOUT_MS);
      
      console.log(`[CleanupService] Checking for stale jobs (older than ${timeoutDate.toISOString()})`);

      // Buscar jobs em processamento ou pendentes há mais de 1 hora
      const staleJobs = await Job.find({
        status: { $in: [JobStatus.PROCESSING, JobStatus.PENDING] },
        updatedAt: { $lt: timeoutDate },
      });

      if (staleJobs.length === 0) {
        console.log('[CleanupService] No stale jobs found');
        return;
      }

      console.log(`[CleanupService] Found ${staleJobs.length} stale jobs`);

      for (const job of staleJobs) {
        try {
          await this.handleStaleJob(job);
        } catch (error) {
          console.error(`[CleanupService] Error handling stale job ${job._id}:`, error);
        }
      }

      console.log(`[CleanupService] Cleanup completed: ${staleJobs.length} jobs processed`);
    } catch (error) {
      console.error('[CleanupService] Error in cleanup process:', error);
    }
  }

  /**
   * Handle a single stale job
   */
  private async handleStaleJob(job: any): Promise<void> {
    const jobId = job._id.toString();
    const timeSinceUpdate = Date.now() - new Date(job.updatedAt).getTime();
    const hoursSinceUpdate = Math.floor(timeSinceUpdate / (60 * 60 * 1000));

    console.log(`[CleanupService] Processing stale job ${jobId} (${hoursSinceUpdate}h since last update)`);

    // Contar itens completados
    const completedItems = job.items.filter(
      (item: any) => item.status === JobItemStatus.COMPLETED
    ).length;
    const totalItems = job.items.length;

    console.log(`[CleanupService] Job ${jobId}: ${completedItems}/${totalItems} items completed`);

    // Marcar job como falho
    await Job.findByIdAndUpdate(jobId, {
      $set: {
        status: JobStatus.FAILED,
        failedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log(`[CleanupService] Job ${jobId} marked as FAILED due to timeout`);

    // Processar reembolso baseado no progresso
    try {
      if (completedItems === 0) {
        // Reembolso total se nada foi completado
        console.log(`[CleanupService] Processing full refund for job ${jobId}`);
        await RefundService.processJobFailureRefund(jobId);
      } else if (completedItems < totalItems) {
        // Reembolso parcial se alguns itens completaram
        console.log(`[CleanupService] Processing partial refund for job ${jobId}`);
        await RefundService.processPartialRefund(jobId, completedItems, totalItems);
      } else {
        // Todos os itens completaram mas job ficou travado
        // Não reembolsar, apenas marcar como completo
        console.log(`[CleanupService] All items completed, marking job ${jobId} as COMPLETED`);
        await Job.findByIdAndUpdate(jobId, {
          $set: {
            status: JobStatus.COMPLETED,
            progress: 100,
            completedAt: new Date(),
          },
        });
      }
    } catch (error) {
      console.error(`[CleanupService] Error processing refund for job ${jobId}:`, error);
    }
  }

  /**
   * Manually trigger cleanup (useful for testing)
   */
  async triggerCleanup(): Promise<void> {
    console.log('[CleanupService] Manual cleanup triggered');
    await this.cleanupStaleJobs();
  }

  /**
   * Get timeout duration in milliseconds
   */
  static getTimeoutMs(): number {
    return CleanupService.TIMEOUT_MS;
  }
}

// Export singleton instance
export const cleanupService = new CleanupService();
