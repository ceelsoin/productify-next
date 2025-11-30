import { User } from '@/lib/models/User';
import { Transaction, TransactionType, TransactionStatus, PaymentMethod } from '@/lib/models/Transaction';
import { connectDB } from '@/lib/mongodb';

/**
 * Service for managing credit transactions
 */
export class TransactionService {
  /**
   * Create a transaction for job debit
   */
  static async createJobDebit(
    userId: string,
    jobId: string,
    amount: number,
    description: string
  ): Promise<typeof Transaction.prototype> {
    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const balanceBefore = user.credits;
    const balanceAfter = balanceBefore - amount;

    if (balanceAfter < 0) {
      throw new Error('Insufficient credits');
    }

    const transaction = await Transaction.create({
      user: userId,
      type: TransactionType.JOB_DEBIT,
      amount: -amount,
      balanceBefore,
      balanceAfter,
      status: TransactionStatus.COMPLETED,
      description,
      metadata: {
        jobId,
        paymentMethod: PaymentMethod.SYSTEM,
      },
      processedAt: new Date(),
    });

    // Update user balance
    user.credits = balanceAfter;
    await user.save();

    console.log('💳 Transaction created:', {
      type: 'JOB_DEBIT',
      userId,
      jobId,
      amount: -amount,
      balanceAfter,
    });

    return transaction;
  }

  /**
   * Create a transaction for job refund
   */
  static async createJobRefund(
    userId: string,
    jobId: string,
    amount: number,
    reason: string
  ): Promise<typeof Transaction.prototype> {
    await connectDB();

    const user = await User.findById(userId);
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
      metadata: {
        jobId,
        refundReason: reason,
        paymentMethod: PaymentMethod.SYSTEM,
      },
      processedAt: new Date(),
    });

    // Update user balance
    user.credits = balanceAfter;
    await user.save();

    console.log('💳 Refund created:', {
      type: 'JOB_REFUND',
      userId,
      jobId,
      amount,
      balanceAfter,
      reason,
    });

    return transaction;
  }

  /**
   * Create a transaction for credit purchase
   */
  static async createPurchase(
    userId: string,
    amount: number,
    orderId: string,
    paymentIntentId: string,
    paymentMethod: PaymentMethod = PaymentMethod.STRIPE
  ): Promise<typeof Transaction.prototype> {
    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const balanceBefore = user.credits;
    const balanceAfter = balanceBefore + amount;

    const transaction = await Transaction.create({
      user: userId,
      type: TransactionType.PURCHASE,
      amount,
      balanceBefore,
      balanceAfter,
      status: TransactionStatus.COMPLETED,
      description: `Compra de ${amount} créditos`,
      metadata: {
        orderId,
        paymentIntentId,
        paymentMethod,
      },
      processedAt: new Date(),
    });

    // Update user balance
    user.credits = balanceAfter;
    await user.save();

    console.log('💳 Purchase created:', {
      type: 'PURCHASE',
      userId,
      amount,
      balanceAfter,
      orderId,
    });

    return transaction;
  }

  /**
   * Create a manual credit transaction (admin)
   */
  static async createManualCredit(
    userId: string,
    amount: number,
    adminId: string,
    note: string
  ): Promise<typeof Transaction.prototype> {
    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const balanceBefore = user.credits;
    const balanceAfter = balanceBefore + amount;

    const transaction = await Transaction.create({
      user: userId,
      type: TransactionType.MANUAL_CREDIT,
      amount,
      balanceBefore,
      balanceAfter,
      status: TransactionStatus.COMPLETED,
      description: `Crédito manual: ${note}`,
      metadata: {
        adminId,
        adminNote: note,
        paymentMethod: PaymentMethod.MANUAL,
      },
      processedAt: new Date(),
    });

    // Update user balance
    user.credits = balanceAfter;
    await user.save();

    console.log('💳 Manual credit created:', {
      type: 'MANUAL_CREDIT',
      userId,
      amount,
      balanceAfter,
      adminId,
    });

    return transaction;
  }

  /**
   * Create a bonus transaction
   */
  static async createBonus(
    userId: string,
    amount: number,
    description: string
  ): Promise<typeof Transaction.prototype> {
    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const balanceBefore = user.credits;
    const balanceAfter = balanceBefore + amount;

    const transaction = await Transaction.create({
      user: userId,
      type: TransactionType.BONUS,
      amount,
      balanceBefore,
      balanceAfter,
      status: TransactionStatus.COMPLETED,
      description: `Bônus: ${description}`,
      metadata: {
        paymentMethod: PaymentMethod.SYSTEM,
      },
      processedAt: new Date(),
    });

    // Update user balance
    user.credits = balanceAfter;
    await user.save();

    console.log('💳 Bonus created:', {
      type: 'BONUS',
      userId,
      amount,
      balanceAfter,
      description,
    });

    return transaction;
  }

  /**
   * Get user transaction history
   */
  static async getUserTransactions(
    userId: string,
    limit: number = 50,
    skip: number = 0
  ) {
    await connectDB();

    const transactions = await Transaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Transaction.countDocuments({ user: userId });

    return {
      transactions,
      total,
      hasMore: skip + limit < total,
    };
  }

  /**
   * Get transactions for a specific job
   */
  static async getJobTransactions(jobId: string) {
    await connectDB();

    return Transaction.find({ 'metadata.jobId': jobId })
      .sort({ createdAt: -1 })
      .lean();
  }
}
