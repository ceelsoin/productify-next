import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { VerificationCode } from '@/lib/models/VerificationCode';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone, countryCode, acceptMarketing } = body;

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

    // Verificar se o usuário já existe por email
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 409 }
      );
    }

    // Verificar se o telefone já está cadastrado (busca por phone e countryCode)
    if (phone) {
      const existingPhone = await User.findOne({
        phone: phone,
        countryCode: countryCode || 'BR',
      });

      if (existingPhone) {
        return NextResponse.json(
          {
            error:
              'Este número de telefone já está cadastrado em outra conta',
          },
          { status: 409 }
        );
      }

      // Verificar se o telefone já foi verificado anteriormente (segurança extra)
      const phoneFullNumber = `${countryCode || 'BR'}${phone}`;
      const phoneAlreadyVerified = await VerificationCode.findOne({
        phoneVerified: phoneFullNumber,
        verified: true,
      });

      if (phoneAlreadyVerified) {
        return NextResponse.json(
          {
            error:
              'Este número de telefone já foi verificado em outra conta',
          },
          { status: 409 }
        );
      }
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
      phoneVerified: false,
      acceptMarketing: acceptMarketing || false,
    });

    // Generate verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    // Desativar códigos anteriores deste usuário
    await VerificationCode.updateMany(
      { user: user._id, active: true },
      { active: false }
    );

    // Criar código de verificação
    await VerificationCode.create({
      code,
      user: user._id,
      phone,
      countryCode: countryCode || 'BR',
      expires,
      active: true,
    });

    console.log('\n✅ Código de verificação criado:', {
      userId: user._id,
      phone,
      code,
      expires: expires.toLocaleString('pt-BR'),
    });

    // TODO: Send SMS with verification code
    console.log(
      `\n📱 SMS Mock - Código de verificação para ${countryCode} ${phone}: ${code}`
    );
    console.log(`Expira em: ${expires.toLocaleString('pt-BR')}\n`);

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
        // Em desenvolvimento, retornar o código para facilitar testes
        ...(process.env.NODE_ENV === 'development' && {
          code,
        }),
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
