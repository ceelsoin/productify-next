import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Job } from '@/lib/models/Job';
import { auth } from '@/lib/auth';

interface DailyUsage {
  date: string;
  credits: number;
}

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
    const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d

    // Calculate date range
    const days = parseInt(period.replace('d', ''));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Aggregate jobs by date
    const dailyUsage = await Job.aggregate([
      {
        $match: {
          user: session.user.id,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          credits: { $sum: '$creditsSpent' },
          jobs: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          credits: 1,
          jobs: 1,
        },
      },
    ]);

    // Fill in missing dates with zero values
    const filledData: DailyUsage[] = [];
    const currentDate = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    while (currentDate <= today) {
      const dateString = currentDate.toISOString().split('T')[0];
      const existing = dailyUsage.find((d: any) => d.date === dateString);
      
      filledData.push({
        date: dateString,
        credits: existing ? existing.credits : 0,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate statistics
    const totalCredits = dailyUsage.reduce((sum: number, day: any) => sum + day.credits, 0);
    const totalJobs = dailyUsage.reduce((sum: number, day: any) => sum + day.jobs, 0);
    const avgPerDay = filledData.length > 0 ? totalCredits / filledData.length : 0;

    return NextResponse.json({
      period,
      days,
      data: filledData,
      stats: {
        totalCredits,
        totalJobs,
        avgPerDay: Math.round(avgPerDay * 10) / 10,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar uso de créditos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados de uso' },
      { status: 500 }
    );
  }
}
