import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Job } from '@/lib/models/Job';
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

    // Buscar jobs do usuário com informações de créditos
    const [transactions, total] = await Promise.all([
      Job.find({ user: session.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('productInfo.name totalCredits creditsSpent creditsRefunded status createdAt')
        .lean(),
      Job.countDocuments({ user: session.user.id }),
    ]);

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

    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      transactions,
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
