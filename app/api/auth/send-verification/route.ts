import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { VerificationCode } from '@/lib/models/VerificationCode';

export async function POST(request: Request) {
  try {
    const { phone, countryCode } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: 'Telefone é obrigatório' },
        { status: 400 }
      );
    }

    await connectDB();

    // Buscar usuário
    const user = await User.findOne({ phone, countryCode });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Code expires in 10 minutes
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    // Desativar códigos anteriores deste usuário
    await VerificationCode.updateMany(
      { user: user._id, active: true },
      { active: false }
    );

    // Criar novo código de verificação
    await VerificationCode.create({
      code,
      user: user._id,
      phone,
      countryCode,
      expires,
      active: true,
    });

    // TODO: Integrar com API de SMS real (Twilio, AWS SNS, etc)
    // Por enquanto, apenas logamos o código no console
    console.log(`\n📱 SMS Mock - Código de verificação para ${countryCode} ${phone}: ${code}`);
    console.log(`Expira em: ${expires.toLocaleString('pt-BR')}\n`);

    return NextResponse.json({
      success: true,
      message: 'Código de verificação enviado com sucesso',
      // Em desenvolvimento, retornar o código para facilitar testes
      ...(process.env.NODE_ENV === 'development' && { code }),
    });
  } catch (error) {
    console.error('Erro ao enviar código de verificação:', error);
    return NextResponse.json(
      { error: 'Erro ao enviar código de verificação' },
      { status: 500 }
    );
  }
}
