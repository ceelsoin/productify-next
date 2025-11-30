import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import PasswordReset from '@/lib/models/PasswordReset';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar senha
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter no mínimo 6 caracteres' },
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
        { error: 'Token inválido ou já utilizado' },
        { status: 400 }
      );
    }

    // Verificar se expirou
    if (new Date() > resetToken.expires) {
      return NextResponse.json({ error: 'Token expirado' }, { status: 400 });
    }

    // Buscar usuário
    const user = await User.findById(resetToken.user).select('+password');

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Atualizar senha do usuário
    user.password = hashedPassword;
    await user.save();

    // Marcar token como usado
    resetToken.used = true;
    resetToken.usedAt = new Date();
    await resetToken.save();

    console.log('✅ Senha redefinida com sucesso:', {
      userId: user._id,
      email: user.email,
    });

    return NextResponse.json({
      success: true,
      message: 'Senha redefinida com sucesso',
    });
  } catch (error) {
    console.error('❌ Erro em reset-password:', error);
    return NextResponse.json(
      { error: 'Erro ao redefinir senha' },
      { status: 500 }
    );
  }
}
