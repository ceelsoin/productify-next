import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import PasswordReset from '@/lib/models/PasswordReset';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token é obrigatório', valid: false },
        { status: 400 }
      );
    }

    // Conectar ao banco
    await connectDB();

    // Buscar token
    const resetToken = await PasswordReset.findOne({
      token,
      used: false,
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Token inválido ou já utilizado', valid: false },
        { status: 400 }
      );
    }

    // Verificar se expirou
    if (new Date() > resetToken.expires) {
      return NextResponse.json(
        { error: 'Token expirado', valid: false },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      message: 'Token válido',
    });
  } catch (error) {
    console.error('❌ Erro em validate-reset-token:', error);
    return NextResponse.json(
      { error: 'Erro ao validar token', valid: false },
      { status: 500 }
    );
  }
}
