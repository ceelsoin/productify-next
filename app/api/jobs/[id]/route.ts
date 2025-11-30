import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Job } from '@/lib/models/Job';
import { auth } from '@/lib/auth';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    await connectDB();

    // Buscar job
    const job = await Job.findById(params.id);

    if (!job) {
      return NextResponse.json(
        { error: 'Trabalho não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o job pertence ao usuário autenticado
    if (job.user !== session.user.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    return NextResponse.json({ job }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar job:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar trabalho' },
      { status: 500 }
    );
  }
}
