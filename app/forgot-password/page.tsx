'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar email');
      }

      setSuccess(true);

      // Redirect to login after 5 seconds
      setTimeout(() => {
        router.push('/login');
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-primary-500/10 via-transparent to-accent-500/10" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-500/20 via-transparent to-transparent" />

      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link
          href="/login"
          className="mb-8 inline-flex items-center gap-2 text-text-secondary transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para login
        </Link>

        {/* Logo */}
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-cta">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <span className="text-3xl font-bold text-text-primary">
            Productify
          </span>
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-background-tertiary p-8 shadow-card">
          {success ? (
            // Success State
            <div className="text-center">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-500/10">
                <CheckCircle className="h-8 w-8 text-primary-400" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-text-primary">
                Email enviado!
              </h1>
              <p className="mb-6 text-text-secondary">
                Enviamos um link de recuperação para{' '}
                <strong className="text-text-primary">{email}</strong>
              </p>
              <div className="rounded-lg border border-border bg-background p-4 text-left">
                <p className="mb-2 text-sm font-medium text-text-primary">
                  Próximos passos:
                </p>
                <ol className="list-inside list-decimal space-y-1 text-sm text-text-secondary">
                  <li>Verifique sua caixa de entrada</li>
                  <li>Clique no link de recuperação</li>
                  <li>Defina sua nova senha</li>
                </ol>
              </div>
              <p className="mt-6 text-xs text-text-tertiary">
                Não recebeu o email? Verifique a pasta de spam ou{' '}
                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                  }}
                  className="text-primary-400 underline hover:text-primary-300"
                >
                  tente novamente
                </button>
              </p>
            </div>
          ) : (
            // Form State
            <>
              <div className="mb-6 text-center">
                <h1 className="mb-2 text-3xl font-bold text-text-primary">
                  Esqueceu a senha?
                </h1>
                <p className="text-text-secondary">
                  Digite seu email e enviaremos um link para redefinir sua
                  senha
                </p>
              </div>

              {error && (
                <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-text-secondary"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-10 py-3 text-text-primary placeholder-text-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-gradient-cta py-3 font-semibold text-white shadow-glow-primary transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading ? 'Enviando...' : 'Enviar link de recuperação'}
                </button>
              </form>

              {/* Info */}
              <div className="mt-6 rounded-lg border border-border bg-background p-4">
                <p className="text-xs text-text-tertiary">
                  <strong className="text-text-secondary">
                    Lembre-se:
                  </strong>{' '}
                  O link expira em 1 hora por questões de segurança. Se não
                  receber o email, verifique a pasta de spam.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer Links */}
        {!success && (
          <div className="mt-6 text-center">
            <p className="text-sm text-text-tertiary">
              Lembrou a senha?{' '}
              <Link
                href="/login"
                className="font-medium text-primary-400 hover:text-primary-300"
              >
                Fazer login
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
