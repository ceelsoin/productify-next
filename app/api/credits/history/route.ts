import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Job } from '@/lib/models/Job';
import { Transaction } from '@/lib/models/Transaction';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Buscar jobs do usuário (débitos)
    const jobs = await Job.find({ user: session.user.id })
      .select('_id productInfo.name totalCredits creditsSpent status createdAt')
      .lean();

    // Buscar transações de reembolso do usuário
    const refundTransactions = await Transaction.find({
      user: session.user.id,
      type: 'job_refund'
    })
      .select('_id amount description metadata createdAt')
      .lean();

    // Combinar jobs (débitos) e reembolsos em um único array
    const allTransactions = [
      // Débitos dos jobs
      ...jobs.map(job => ({
        _id: `job-${job._id}`,
        type: 'job_debit',
        productName: job.productInfo.name,
        amount: -job.creditsSpent, // Negativo para débito
        status: job.status,
        createdAt: job.createdAt,
        jobId: job._id,
      })),
      // Reembolsos
      ...refundTransactions.map(txn => ({
        _id: `refund-${txn._id}`,
        type: 'job_refund',
        productName: txn.description,
        amount: txn.amount, // Positivo para crédito
        status: 'completed',
        createdAt: txn.createdAt,
        jobId: txn.metadata?.jobId,
      }))
    ];

    // Ordenar por data (mais recentes primeiro)
    allTransactions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Aplicar paginação
    const total = allTransactions.length;
    const pages = Math.ceil(total / limit);
    const paginatedTransactions = allTransactions.slice(skip, skip + limit);

    // Calcular estatísticas
    const stats = await Job.aggregate([
      { $match: { user: session.user.id } },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$creditsSpent' },
          totalRefunded: { $sum: '$creditsRefunded' },
          totalJobs: { $sum: 1 },
          completedJobs: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
        },
      },
    ]);

    return NextResponse.json({
      transactions: paginatedTransactions,
      stats: stats[0] || {
        totalSpent: 0,
        totalRefunded: 0,
        totalJobs: 0,
        completedJobs: 0,
      },
      pagination: {
        total,
        page,
        limit,
        pages,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar histórico de créditos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar histórico' },
      { status: 500 }
    );
  }
}
