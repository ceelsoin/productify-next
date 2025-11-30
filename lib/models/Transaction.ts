import mongoose, { Schema, Document } from 'mongoose';

/**
 * Transaction Types
 */
export enum TransactionType {
  PURCHASE = 'purchase',           // Compra de créditos
  JOB_DEBIT = 'job_debit',         // Débito por job criado
  JOB_REFUND = 'job_refund',       // Reembolso de job que falhou
  MANUAL_CREDIT = 'manual_credit', // Crédito manual (admin)
  MANUAL_DEBIT = 'manual_debit',   // Débito manual (admin)
  BONUS = 'bonus',                 // Bônus promocional
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

/**
 * Transaction Document Interface
 */
export interface ITransaction extends Document {
  user: mongoose.Types.ObjectId;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  status: TransactionStatus;
  description: string;
  metadata?: {
    jobId?: string;
    orderId?: string;
    paymentIntentId?: string;
    paymentMethod?: PaymentMethod;
    refundReason?: string;
    adminId?: string;
    adminNote?: string;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
}

const TransactionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
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
    type: Schema.Types.Mixed,
  },
  processedAt: Date,
}, {
  timestamps: true,
});

// Compound indexes for queries
TransactionSchema.index({ user: 1, createdAt: -1 });
TransactionSchema.index({ user: 1, type: 1 });
TransactionSchema.index({ user: 1, status: 1 });
TransactionSchema.index({ 'metadata.jobId': 1 });

// Virtual for determining if transaction adds or removes credits
TransactionSchema.virtual('isCredit').get(function() {
  return [
    TransactionType.PURCHASE,
    TransactionType.JOB_REFUND,
    TransactionType.MANUAL_CREDIT,
    TransactionType.BONUS,
  ].includes(this.type);
});

TransactionSchema.virtual('isDebit').get(function() {
  return [
    TransactionType.JOB_DEBIT,
    TransactionType.MANUAL_DEBIT,
  ].includes(this.type);
});

export const Transaction = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
