import { Job } from '../models/job.model';
import { Transaction, TransactionType, TransactionStatus, PaymentMethod } from '../models/transaction.model';
import { JobStatus } from '../core/types';

// Lightweight transaction creator for workers
async function createJobRefund(userId: string, jobId: string, amount: number, reason: string) {
  // Find user model (assuming it exists in workers context)
  const UserModel = require('../models/user.model').User;
  const user = await UserModel.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }

  const balanceBefore = user.credits;
  const balanceAfter = balanceBefore + amount;

  const transaction = await Transaction.create({
    user: userId,
    type: TransactionType.JOB_REFUND,
    amount,
    balanceBefore,
    balanceAfter,
    status: TransactionStatus.COMPLETED,
    description: `Reembolso: ${reason}`,
    metadata: { jobId, refundReason: reason, paymentMethod: PaymentMethod.SYSTEM },
    processedAt: new Date(),
  });

  user.credits = balanceAfter;
  await user.save();

  return transaction;
}

/**
 * Service for handling job refunds
 */
export class RefundService {
  /**
   * Process refund for a failed job
   */
  static async processJobFailureRefund(jobId: string): Promise<{ refundAmount: number }> {
    const job = await Job.findById(jobId);
    
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    // Only refund if job failed and hasn't been refunded yet
    if (job.status !== JobStatus.FAILED) {
      throw new Error(`Job ${jobId} is not in failed status`);
    }

    if (job.creditsRefunded > 0) {
      console.log(`Job ${jobId} already refunded`);
      return { refundAmount: 0 };
    }

    // Calculate refund amount (refund all spent credits)
    const refundAmount = job.creditsSpent;

    if (refundAmount <= 0) {
      console.log(`No credits to refund for job ${jobId}`);
      return { refundAmount: 0 };
    }

    // Create refund transaction
    await createJobRefund(
      job.user.toString(),
      jobId,
      refundAmount,
      'Geração falhou durante o processamento'
    );

    // Update job - mantém status FAILED, apenas registra o reembolso
    await Job.findByIdAndUpdate(jobId, {
      $set: {
        creditsRefunded: refundAmount,
        refundedAt: new Date(),
      },
    });

    console.log(`✅ Refund processed for job ${jobId}: ${refundAmount} credits`);
    return { refundAmount };
  }

  /**
   * Process partial refund for partially completed job
   */
  static async processPartialRefund(
    jobId: string,
    completedItems: number,
    totalItems: number
  ): Promise<{ refundAmount: number }> {
    const job = await Job.findById(jobId);
    
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    if (job.creditsRefunded > 0) {
      console.log(`Job ${jobId} already refunded`);
      return { refundAmount: 0 };
    }

    // Calculate refund amount based on incomplete items
    const completionRate = completedItems / totalItems;
    const refundRate = 1 - completionRate;
    const refundAmount = Math.ceil(job.creditsSpent * refundRate);

    if (refundAmount <= 0) {
      console.log(`No credits to refund for job ${jobId}`);
      return { refundAmount: 0 };
    }

    // Create refund transaction
    await createJobRefund(
      job.user.toString(),
      jobId,
      refundAmount,
      `Reembolso parcial: ${completedItems}/${totalItems} itens completados`
    );

    // Update job - mantém status atual (FAILED), apenas registra o reembolso
    await Job.findByIdAndUpdate(jobId, {
      $set: {
        creditsRefunded: refundAmount,
        refundedAt: new Date(),
      },
    });

    console.log(`✅ Partial refund processed for job ${jobId}: ${refundAmount} credits`);
    return { refundAmount };
  }

  /**
   * Process manual refund (admin action)
   */
  static async processManualRefund(
    jobId: string,
    amount: number,
    adminId: string,
    reason: string
  ): Promise<void> {
    const job = await Job.findById(jobId);
    
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    const maxRefund = job.creditsSpent - job.creditsRefunded;
    if (amount > maxRefund) {
      throw new Error(`Cannot refund more than ${maxRefund} credits`);
    }

    // Create manual refund with admin info
    await createJobRefund(
      job.user.toString(),
      jobId,
      amount,
      `Reembolso manual: ${reason} (Admin: ${adminId})`
    );

    // Update job
    const newRefundTotal = job.creditsRefunded + amount;
    const update: any = {
      creditsRefunded: newRefundTotal,
      refundedAt: new Date(),
    };

    // Mark as refunded if fully refunded
    if (newRefundTotal >= job.creditsSpent) {
      update.status = JobStatus.REFUNDED;
    }

    await Job.findByIdAndUpdate(jobId, { $set: update });

    console.log(`✅ Manual refund processed for job ${jobId}: ${amount} credits`);
  }
}
