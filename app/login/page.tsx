'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Sparkles, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccess('Conta criada com sucesso! Faça login para continuar.');
    }
    if (searchParams.get('reset') === 'success') {
      setSuccess('Senha redefinida com sucesso! Faça login com sua nova senha.');
    }
    if (searchParams.get('verified') === 'true') {
      setSuccess('Telefone verificado! Faça login para continuar.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      console.log('SignIn result:', result);

      if (result?.error) {
        throw new Error(result.error || 'Erro ao fazer login');
      }

      if (result?.ok) {
        // Check if phone is verified
        try {
          const checkResponse = await fetch('/api/auth/check-verification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.email }),
          });

          if (!checkResponse.ok) {
            // If verification check fails, just redirect to generate
            console.warn('Failed to check verification status, redirecting to generate');
            await new Promise(resolve => setTimeout(resolve, 500));
            window.location.href = '/generate';
            return;
          }

          const checkData = await checkResponse.json();

          if (!checkData.phoneVerified && checkData.phone) {
            // Redirect to phone verification
            window.location.href = `/verify-phone?phone=${encodeURIComponent(checkData.phone)}&countryCode=${checkData.countryCode || 'BR'}`;
          } else {
            // Wait a bit for session to be established
            await new Promise(resolve => setTimeout(resolve, 500));
            window.location.href = '/generate';
          }
        } catch (verifyError) {
          // If verification check fails, just redirect to generate
          console.warn('Error checking verification status:', verifyError);
          await new Promise(resolve => setTimeout(resolve, 500));
          window.location.href = '/generate';
        }
      } else {
        throw new Error('Erro ao fazer login');
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login';
      // Evitar mensagens undefined ou vazias
      setError(errorMessage && errorMessage !== 'undefined' ? errorMessage : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'twitter') => {
    try {
      await signIn(provider, { callbackUrl: '/generate' });
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
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
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-3xl font-bold text-text-primary">
              Bem-vindo de volta
            </h1>
            <p className="text-text-secondary">
              Faça login para continuar
            </p>
          </div>

          {success && success.trim() && (
            <div className="mb-4 rounded-lg border border-success-500/50 bg-success-500/10 p-3 text-sm text-success-400">
              {success}
            </div>
          )}

          {error && error.trim() && error !== 'undefined' && (
            <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Social Login Buttons */}
          <div className="mb-6 space-y-3">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-background px-4 py-3 font-medium text-text-primary transition-colors hover:bg-background-secondary"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continuar com Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin('facebook')}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-background px-4 py-3 font-medium text-text-primary transition-colors hover:bg-background-secondary"
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Continuar com Facebook</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin('twitter')}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-background px-4 py-3 font-medium text-text-primary transition-colors hover:bg-background-secondary"
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>Continuar com X</span>
            </button>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-border" />
            <span className="px-4 text-sm text-text-tertiary">ou</span>
            <div className="flex-1 border-t border-border" />
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  value={formData.email}
                  onChange={e =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-background px-10 py-3 text-text-primary placeholder-text-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-text-secondary"
                >
                  Senha
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary-400 hover:text-primary-300"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={e =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-background px-10 py-3 text-text-primary placeholder-text-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  placeholder="Sua senha"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-cta py-3 font-semibold text-white shadow-glow-primary transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-border" />
            <span className="px-4 text-sm text-text-tertiary">
              Não tem conta?
            </span>
            <div className="flex-1 border-t border-border" />
          </div>

          {/* Register Link */}
          <Link
            href="/register"
            className="block w-full rounded-lg border border-border bg-background-secondary py-3 text-center font-medium text-text-primary transition-colors hover:bg-background-tertiary"
          >
            Criar conta grátis
          </Link>
        </div>

        {/* Back to Home */}
        <Link
          href="/"
          className="mt-6 block text-center text-sm text-text-tertiary hover:text-text-secondary"
        >
          ← Voltar para home
        </Link>
      </div>
    </div>
  );
}
