'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Token de recuperação não encontrado');
      setValidating(false);
      return;
    }

    // Validate token
    const validateToken = async () => {
      try {
        const response = await fetch('/api/auth/validate-reset-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          setTokenValid(true);
        } else {
          const data = await response.json();
          setError(
            data.error || 'Token inválido ou expirado. Solicite um novo link.'
          );
        }
      } catch (err) {
        setError('Erro ao validar token');
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao redefinir senha');
      }

      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login?reset=success');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao redefinir senha');
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
          {validating ? (
            // Validating State
            <div className="text-center">
              <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary-500/20 border-t-primary-500"></div>
              <p className="text-text-secondary">Validando token...</p>
            </div>
          ) : !tokenValid ? (
            // Invalid Token State
            <div className="text-center">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                <span className="text-3xl">⚠️</span>
              </div>
              <h1 className="mb-2 text-2xl font-bold text-text-primary">
                Link inválido
              </h1>
              <p className="mb-6 text-text-secondary">{error}</p>
              <Link
                href="/forgot-password"
                className="inline-block rounded-lg bg-gradient-cta px-6 py-3 font-semibold text-white transition-transform hover:scale-105"
              >
                Solicitar novo link
              </Link>
            </div>
          ) : success ? (
            // Success State
            <div className="text-center">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-500/10">
                <CheckCircle className="h-8 w-8 text-primary-400" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-text-primary">
                Senha redefinida!
              </h1>
              <p className="mb-6 text-text-secondary">
                Sua senha foi alterada com sucesso. Redirecionando para o
                login...
              </p>
              <div className="inline-block h-2 w-48 overflow-hidden rounded-full bg-background">
                <div className="h-full w-full animate-progress bg-gradient-cta"></div>
              </div>
            </div>
          ) : (
            // Form State
            <>
              <div className="mb-6 text-center">
                <h1 className="mb-2 text-3xl font-bold text-text-primary">
                  Nova senha
                </h1>
                <p className="text-text-secondary">
                  Digite sua nova senha abaixo
                </p>
              </div>

              {error && (
                <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nova Senha */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-text-secondary"
                  >
                    Nova senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-10 py-3 text-text-primary placeholder-text-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirmar Senha */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-text-secondary"
                  >
                    Confirmar nova senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-10 py-3 text-text-primary placeholder-text-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      placeholder="Digite a senha novamente"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <div className="rounded-lg border border-border bg-background p-3">
                    <p className="mb-2 text-xs font-medium text-text-secondary">
                      Força da senha:
                    </p>
                    <div className="flex gap-1">
                      <div
                        className={`h-1 flex-1 rounded-full ${
                          password.length >= 6
                            ? 'bg-primary-500'
                            : 'bg-border'
                        }`}
                      />
                      <div
                        className={`h-1 flex-1 rounded-full ${
                          password.length >= 8
                            ? 'bg-primary-500'
                            : 'bg-border'
                        }`}
                      />
                      <div
                        className={`h-1 flex-1 rounded-full ${
                          password.length >= 10 &&
                          /[A-Z]/.test(password) &&
                          /[0-9]/.test(password)
                            ? 'bg-primary-500'
                            : 'bg-border'
                        }`}
                      />
                    </div>
                    <p className="mt-1 text-xs text-text-tertiary">
                      {password.length < 6
                        ? 'Fraca - mínimo 6 caracteres'
                        : password.length < 8
                          ? 'Média - adicione mais caracteres'
                          : 'Forte'}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-gradient-cta py-3 font-semibold text-white shadow-glow-primary transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading ? 'Redefinindo...' : 'Redefinir senha'}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer Link */}
        {tokenValid && !success && (
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-text-tertiary hover:text-text-secondary"
            >
              Voltar para login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
