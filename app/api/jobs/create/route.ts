import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { Job } from '@/lib/models/Job';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || !token.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    await connectDB();

    // Buscar usuário
    const user = await User.findOne({ email: token.email });

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

    // Salvar imagem no filesystem (temporariamente - depois você pode mover para S3/GCS)
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const randomString = randomBytes(8).toString('hex');
    const extension = imageFile.name.split('.').pop() || 'jpg';
    const filename = `${timestamp}-${randomString}.${extension}`;
    
    // Criar diretório de uploads se não existir
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'products');
    const filePath = join(uploadsDir, filename);
    
    // Criar diretórios recursivamente
    await writeFile(filePath, buffer);

    const imageUrl = `/uploads/products/${filename}`;

    // Criar job no banco de dados
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
        url: imageUrl,
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
      status: 'pending',
      progress: 0,
    });

    // Descontar créditos do usuário
    user.credits -= totalCredits;
    await user.save();

    console.log('✅ Job criado:', {
      jobId: job._id,
      userId: user._id,
      productName,
      items: items.length,
      totalCredits,
      remainingCredits: user.credits,
    });

    // TODO: Adicionar job à fila de processamento (Redis Queue, Bull, etc.)
    // Por enquanto, apenas retornar sucesso

    return NextResponse.json(
      {
        success: true,
        message: 'Trabalho criado com sucesso!',
        job: {
          id: job._id,
          status: job.status,
          progress: job.progress,
          totalCredits: job.totalCredits,
          items: job.items.length,
        },
        remainingCredits: user.credits,
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
