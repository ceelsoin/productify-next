/**
 * API Route to regenerate a specific enhanced image
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Job } from '@/lib/models/Job';
import { queueManager } from '@/workers/src/core/queue-manager';
import { JobType } from '@/workers/src/core/types';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { jobId, itemIndex, imageIndex } = body;

    if (!jobId || itemIndex === undefined || imageIndex === undefined) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos' },
        { status: 400 }
      );
    }

    // Buscar o job
    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json(
        { error: 'Job não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o usuário é dono do job
    if (job.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }

    const item = job.items[itemIndex];
    if (!item || item.type !== 'enhanced-images') {
      return NextResponse.json(
        { error: 'Item inválido' },
        { status: 400 }
      );
    }

    console.log(`[Regenerate] Regenerando imagem ${imageIndex} do job ${jobId}`);

    // Adicionar job para refazer a imagem específica
    await queueManager.addJob('images-queue', {
      jobId: jobId.toString(),
      itemIndex,
      type: JobType.ENHANCED_IMAGES,
      itemType: JobType.ENHANCED_IMAGES,
      config: {
        ...item.config,
        regenerateIndex: imageIndex, // Índice da imagem a ser regerada
      },
      originalImage: job.originalImage,
      productInfo: job.productInfo,
      previousResults: {},
    });

    return NextResponse.json({ 
      success: true,
      message: 'Imagem sendo regerada' 
    });
  } catch (error) {
    console.error('[Regenerate] Erro:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao regenerar imagem',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
