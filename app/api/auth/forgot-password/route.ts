import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import PasswordReset from '@/lib/models/PasswordReset';
import {
  sendEmail,
  getPasswordResetEmailTemplate,
  getPasswordResetEmailText,
} from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    // Conectar ao banco
    await connectDB();

    // Buscar usuário
    const user = await User.findOne({ email: email.toLowerCase() });

    // Por segurança, sempre retornamos sucesso mesmo se o email não existir
    // Isso evita que atacantes descubram quais emails estão cadastrados
    if (!user) {
      console.log('📧 Email não encontrado, mas retornando sucesso:', email);
      return NextResponse.json({
        success: true,
        message: 'Se este email estiver cadastrado, você receberá as instruções de recuperação.',
      });
    }

    // Gerar token seguro
    const token = crypto.randomBytes(32).toString('hex');

    // Token expira em 1 hora
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    // Desativar tokens anteriores (marca como usados)
    await PasswordReset.updateMany(
      { user: user._id, used: false },
      { $set: { used: true, usedAt: new Date() } }
    );

    // Criar novo token
    await PasswordReset.create({
      user: user._id,
      token,
      expires,
    });

    // Construir URL de reset
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    // Enviar email
    const emailResult = await sendEmail({
      to: user.email,
      subject: 'Recuperação de Senha - Productify',
      html: getPasswordResetEmailTemplate(user.name, resetUrl),
      text: getPasswordResetEmailText(user.name, resetUrl),
    });

    if (!emailResult.success) {
      console.error('❌ Erro ao enviar email:', emailResult.error);
      return NextResponse.json(
        { error: 'Erro ao enviar email. Tente novamente mais tarde.' },
        { status: 500 }
      );
    }

    console.log('✅ Token de reset criado:', {
      userId: user._id,
      email: user.email,
      expires: expires.toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Se este email estiver cadastrado, você receberá as instruções de recuperação.',
    });
  } catch (error) {
    console.error('❌ Erro em forgot-password:', error);
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    );
  }
}
