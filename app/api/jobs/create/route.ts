import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { Job } from '@/lib/models/Job';
import { TransactionService } from '@/lib/services/transaction.service';
import { randomBytes } from 'crypto';
import { auth } from '@/lib/auth';
import * as aws from 'aws-sdk';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação usando auth() do NextAuth
    const session = await auth();

    console.log('🔐 Session:', session);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    await connectDB();

    // Buscar usuário
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o telefone foi verificado
    if (!user.phoneVerified) {
      return NextResponse.json(
        { error: 'Telefone não verificado' },
        { status: 403 }
      );
    }

    // Parse do FormData
    const formData = await request.formData();
    
    // Extrair dados do produto
    const productName = formData.get('productName') as string;
    const productDescription = formData.get('productDescription') as string;
    const height = formData.get('height') as string;
    const width = formData.get('width') as string;
    const depth = formData.get('depth') as string;
    const weight = formData.get('weight') as string;
    
    // Extrair itens de geração
    const itemsJson = formData.get('items') as string;
    const items = JSON.parse(itemsJson);
    
    // Extrair arquivo de imagem
    const imageFile = formData.get('image') as File;

    // Validações
    if (!productName) {
      return NextResponse.json(
        { error: 'Nome do produto é obrigatório' },
        { status: 400 }
      );
    }

    if (!imageFile) {
      return NextResponse.json(
        { error: 'Imagem do produto é obrigatória' },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Selecione pelo menos um tipo de conteúdo para gerar' },
        { status: 400 }
      );
    }

    // Validar tamanho da imagem (max 10MB)
    if (imageFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'A imagem deve ter no máximo 10MB' },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json(
        { error: 'Formato de imagem inválido. Use JPG, PNG ou WEBP' },
        { status: 400 }
      );
    }

    // Calcular total de créditos
    const totalCredits = items.reduce(
      (sum: number, item: any) => sum + item.credits,
      0
    );

    // Verificar se o usuário tem créditos suficientes
    if (user.credits < totalCredits) {
      return NextResponse.json(
        {
          error: 'Créditos insuficientes',
          required: totalCredits,
          available: user.credits,
        },
        { status: 402 }
      );
    }

    // Upload de imagem para S3
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const randomString = randomBytes(8).toString('hex');
    const extension = imageFile.name.split('.').pop() || 'jpg';
    const filename = `product-${timestamp}-${randomString}.${extension}`;
    
    // Fazer upload para S3 usando serviço AWS SDK
    const s3ImageUrl = await uploadToS3(buffer, filename, imageFile.type);
    
    console.log(`[Jobs] Image uploaded to S3: ${s3ImageUrl}`);

    // Criar job no banco de dados
    console.log('🗄️ Next.js Database:', Job.db.name);
    console.log('🗄️ Next.js Collection:', Job.collection.name);
    console.log('🗄️ Next.js Collection Full Name:', Job.collection.collectionName);
    
    const job = await Job.create({
      user: user._id.toString(),
      productInfo: {
        name: productName,
        description: productDescription || undefined,
        dimensions: {
          height: height ? parseFloat(height) : undefined,
          width: width ? parseFloat(width) : undefined,
          depth: depth ? parseFloat(depth) : undefined,
          weight: weight ? parseFloat(weight) : undefined,
        },
      },
      originalImage: {
        url: s3ImageUrl,
        filename: filename,
        size: imageFile.size,
        mimeType: imageFile.type,
      },
      items: items.map((item: any) => ({
        type: item.type,
        credits: item.credits,
        config: item.config || {},
        status: 'pending',
      })),
      totalCredits,
      creditsSpent: totalCredits,
      creditsRefunded: 0,
      status: 'pending',
      progress: 0,
    });
    
    console.log('✅ Job criado no Next.js:', job._id);
    
    // Verificar se foi realmente salvo
    const verifyJob = await Job.findById(job._id);
    console.log('🔍 Verificação - Job encontrado no Next.js:', !!verifyJob);
    
    // Contar todos os jobs
    const totalJobs = await Job.countDocuments();
    console.log('📊 Total de jobs na collection (Next.js):', totalJobs);

    // Criar transação de débito
    await TransactionService.createJobDebit(
      user._id.toString(),
      job._id.toString(),
      totalCredits,
      `Job criado: ${productName}`
    );

    // Buscar saldo atualizado
    const updatedUser = await User.findById(user._id);

    console.log('✅ Job criado:', {
      jobId: job._id,
      userId: user._id,
      productName,
      items: items.length,
      totalCredits,
      creditsSpent: totalCredits,
      remainingCredits: updatedUser?.credits,
    });

    // Adicionar job à fila do orquestrador
    try {
      const { queueManager } = await import('@/lib/queue-manager');
      const { determinePipeline } = await import('@/lib/pipeline-mapper');

      const pipelineName = determinePipeline(items);

      await queueManager.addJob('orchestrator-queue', {
        jobId: job._id.toString(),
        pipelineName,
      });

      console.log('🚀 Job adicionado ao orquestrador:', {
        jobId: job._id,
        pipeline: pipelineName,
      });
    } catch (queueError) {
      console.error('⚠️ Erro ao adicionar job à fila:', queueError);
      // Não retorna erro pois o job já foi criado, apenas loga
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Trabalho criado com sucesso!',
        job: {
          id: job._id,
          status: job.status,
          progress: job.progress,
          totalCredits: job.totalCredits,
          creditsSpent: job.creditsSpent,
          items: job.items.length,
        },
        remainingCredits: updatedUser?.credits,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar job:', error);
    return NextResponse.json(
      { error: 'Erro ao criar trabalho. Tente novamente.' },
      { status: 500 }
    );
  }
}

/**
 * Upload image to S3
 */
async function uploadToS3(buffer: Buffer, filename: string, contentType: string): Promise<string> {
  const s3 = new aws.S3({
    signatureVersion: 'v4',
    endpoint: new aws.Endpoint(process.env.S3_ENDPOINT || ''),
    secretAccessKey: process.env.S3_SECRET_KEY || '',
    accessKeyId: process.env.S3_ACCESS_KEY || '',
    s3ForcePathStyle: true,
  });

  const bucketName = process.env.S3_BUCKET_NAME || '';
  const key = `products/${filename}`;

  await s3.putObject({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read', // Tornar público para Kie.ai acessar
  }).promise();

  const publicUrl = `https://${process.env.S3_ENDPOINT}/${bucketName}/${key}`;
  return publicUrl;
}
