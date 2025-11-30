import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models/User';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone, countryCode } = body;

    // Validação
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Validação de senha
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter no mínimo 6 caracteres' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verificar se o usuário já existe
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 409 }
      );
    }

    // Criar novo usuário
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      countryCode: countryCode || 'BR',
      credits: 100, // 100 créditos grátis
      provider: 'credentials',
    });

    // Retornar usuário sem senha
    return NextResponse.json(
      {
        success: true,
        message: 'Cadastro realizado com sucesso!',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          credits: user.credits,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro no registro:', error);
    return NextResponse.json(
      { error: 'Erro ao criar conta. Tente novamente.' },
      { status: 500 }
    );
  }
}
