import mongoose from 'mongoose';

/**
 * Transaction Types
 */
export enum TransactionType {
  PURCHASE = 'purchase',
  JOB_DEBIT = 'job_debit',
  JOB_REFUND = 'job_refund',
  MANUAL_CREDIT = 'manual_credit',
  MANUAL_DEBIT = 'manual_debit',
  BONUS = 'bonus',
}

/**
 * Transaction Status
 */
export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

/**
 * Payment Method
 */
export enum PaymentMethod {
  STRIPE = 'stripe',
  CREDIT_CARD = 'credit_card',
  PIX = 'pix',
  MANUAL = 'manual',
  SYSTEM = 'system',
}

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: Object.values(TransactionType),
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  balanceBefore: {
    type: Number,
    required: true,
  },
  balanceAfter: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(TransactionStatus),
    default: TransactionStatus.COMPLETED,
    index: true,
  },
  description: {
    type: String,
    required: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
  processedAt: Date,
}, {
  timestamps: true,
});

TransactionSchema.index({ user: 1, createdAt: -1 });
TransactionSchema.index({ user: 1, type: 1 });
TransactionSchema.index({ user: 1, status: 1 });
TransactionSchema.index({ 'metadata.jobId': 1 });

export const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
