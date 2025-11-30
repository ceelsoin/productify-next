import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { VerificationCode } from '@/lib/models/VerificationCode';

export async function POST(request: Request) {
  try {
    const { phone, countryCode, code } = await request.json();

    if (!phone || !code) {
      return NextResponse.json(
        { error: 'Telefone e código são obrigatórios' },
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

    // Buscar código de verificação ativo
    const verificationCode = await VerificationCode.findOne({
      user: user._id,
      code,
      active: true,
    });

    if (!verificationCode) {
      return NextResponse.json(
        { error: 'Código de verificação inválido ou expirado' },
        { status: 400 }
      );
    }

    // Verificar se o código expirou
    if (verificationCode.expires < new Date()) {
      await VerificationCode.findByIdAndUpdate(verificationCode._id, {
        active: false,
      });
      return NextResponse.json(
        { error: 'Código de verificação expirado. Solicite um novo código.' },
        { status: 400 }
      );
    }

    // Marcar código como usado e salvar o telefone verificado
    const phoneFullNumber = `${countryCode}${phone}`;
    await VerificationCode.findByIdAndUpdate(verificationCode._id, {
      active: false,
      usedAt: new Date(),
      phoneVerified: phoneFullNumber,
      verified: true
    });

    // Marcar telefone como verificado
    await User.findByIdAndUpdate(user._id, {
      phoneVerified: true,
    });

    console.log('✅ Telefone verificado com sucesso:', {
      userId: user._id,
      phone: phoneFullNumber,
    });

    return NextResponse.json({
      success: true,
      message: 'Telefone verificado com sucesso',
      user: {
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Erro ao verificar código:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar código' },
      { status: 500 }
    );
  }
}
