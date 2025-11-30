'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Sparkles, Smartphone, ArrowLeft } from 'lucide-react';

export default function VerifyPhonePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const phone = session?.user?.phone;
  const countryCode = session?.user?.countryCode || 'BR';

  useEffect(() => {
    // Aguardar carregamento da sessão
    if (status === 'loading') return;

    // Se não está autenticado, redirecionar para login
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // Se não tem telefone na sessão mas está autenticado, buscar dados
    if (status === 'authenticated' && !phone) {
      // Dar um tempo para a sessão atualizar
      const timer = setTimeout(() => {
        if (!session?.user?.phone) {
          router.push('/register');
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [phone, router, status, session]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.charAt(0);
    }

    if (!/^\d*$/.test(value)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = pastedData.split('');
    while (newCode.length < 6) {
      newCode.push('');
    }
    setCode(newCode);

    // Focus last filled input
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const verificationCode = code.join('');

    if (verificationCode.length !== 6) {
      setError('Digite o código completo de 6 dígitos');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          countryCode,
          code: verificationCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao verificar código');
      }

      // Atualizar sessão para refletir phoneVerified no JWT
      const { signIn } = await import('next-auth/react');
      
      // Fazer login automático após verificação
      if (data.user?.email) {
        // Buscar senha temporária do localStorage (salva no registro)
        const tempPassword = localStorage.getItem('temp_password');
        
        if (tempPassword) {
          // Tentar fazer login automaticamente
          const result = await signIn('credentials', {
            email: data.user.email,
            password: tempPassword,
            redirect: false,
          });

          // Limpar senha temporária
          localStorage.removeItem('temp_password');

          if (result?.ok) {
            // Redirecionar para /generate - o middleware não vai bloquear mais
            window.location.href = '/generate';
            return;
          }
        }
      }

      // Se o usuário já está logado, forçar refresh da página para atualizar o token
      // O middleware vai buscar os dados atualizados do banco
      window.location.href = '/generate';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao verificar código');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');

    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, countryCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao reenviar código');
      }

      // Show code in development
      if (data.code) {
        console.log('🔐 Código de verificação:', data.code);
      }

      setCountdown(60);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao reenviar código');
    } finally {
      setResending(false);
    }
  };

  // Loading state apenas enquanto a sessão está carregando
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary-500/20 border-t-primary-500"></div>
          <p className="text-text-secondary">Carregando sessão...</p>
        </div>
      </div>
    );
  }

  // Se não tem telefone após autenticação, mostrar erro
  if (status === 'authenticated' && !phone) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <div className="text-center">
          <div className="mb-4 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
            <p className="text-yellow-400">
              Nenhum telefone encontrado na sessão. Redirecionando...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-primary-500/10 via-transparent to-accent-500/10" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-500/20 via-transparent to-transparent" />

      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-cta">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <span className="text-3xl font-bold text-text-primary">
            Productify
          </span>
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-background-tertiary p-8 shadow-card">
          <div className="mb-6 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-500/10">
                <Smartphone className="h-8 w-8 text-primary-400" />
              </div>
            </div>
            <h1 className="mb-2 text-3xl font-bold text-text-primary">
              Verificar Telefone
            </h1>
            <p className="text-text-secondary">
              Digite o código de 6 dígitos enviado para
            </p>
            <p className="mt-1 font-semibold text-text-primary">
             {phone}
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Code in Development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 rounded-lg border border-blue-500/50 bg-blue-500/10 p-3 text-center text-sm text-blue-400">
              💡 Ambiente de desenvolvimento: verifique o console para o código
            </div>
          )}

          {/* Verification Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Code Inputs */}
            <div className="flex justify-center gap-2">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={el => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="h-14 w-12 rounded-lg border-2 border-border bg-background text-center text-2xl font-bold text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              ))}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || code.join('').length !== 6}
              className="w-full rounded-lg bg-gradient-cta py-3 font-semibold text-white shadow-glow-primary transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? 'Verificando...' : 'Verificar Código'}
            </button>
          </form>

          {/* Resend Code */}
          <div className="mt-6 text-center">
            <p className="text-sm text-text-secondary">
              Não recebeu o código?
            </p>
            {countdown > 0 ? (
              <p className="mt-2 text-sm text-text-tertiary">
                Reenviar em{' '}
                <span className="font-semibold text-text-primary">
                  {countdown}s
                </span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="mt-2 text-sm font-medium text-primary-400 hover:text-primary-300 disabled:opacity-50"
              >
                {resending ? 'Reenviando...' : 'Reenviar código'}
              </button>
            )}
          </div>
        </div>

        {/* Back Link */}
        <Link
          href="/register"
          className="mt-6 flex items-center justify-center gap-2 text-sm text-text-tertiary hover:text-text-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para cadastro</span>
        </Link>
      </div>
    </div>
  );
}
