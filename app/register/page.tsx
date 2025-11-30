'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [phoneValue, setPhoneValue] = useState<string>();
  const [countryCode, setCountryCode] = useState('BR');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações
    if (!acceptTerms) {
      setError('Você deve aceitar os Termos de Uso e Política de Privacidade');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: phoneValue,
          countryCode,
          acceptMarketing,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar conta');
      }

      // Show code in development
      if (data.code) {
        console.log('🔐 Código de verificação:', data.code);
      }

      // Salvar senha temporariamente para login automático após verificação
      localStorage.setItem('temp_password', formData.password);

      // Redirecionar para verificação de telefone
      router.push(
        `/verify-phone?phone=${encodeURIComponent(phoneValue || '')}&countryCode=${countryCode}`
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar conta';
      
      // Adicionar dica se o erro for sobre telefone já cadastrado
      if (errorMessage.includes('telefone já está cadastrado') || 
          errorMessage.includes('telefone já foi verificado')) {
        setError(errorMessage + ' Tente fazer login ou use outro número.');
      } else if (errorMessage.includes('email já está cadastrado')) {
        setError(errorMessage + ' Tente fazer login.');
      } else {
        setError(errorMessage);
      }
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
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-3xl font-bold text-text-primary">
              Criar conta
            </h1>
            <p className="text-text-secondary">
              Comece com 100 créditos grátis
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3">
              <p className="text-sm text-red-400">{error}</p>
              {(error.includes('já está cadastrado') || 
                error.includes('já foi verificado')) && (
                <Link
                  href="/login"
                  className="mt-2 inline-block text-sm font-medium text-primary-400 underline hover:text-primary-300"
                >
                  Ir para login →
                </Link>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-text-secondary"
              >
                Nome completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-background px-10 py-3 text-text-primary placeholder-text-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  placeholder="Seu nome"
                />
              </div>
            </div>

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

            {/* Telefone */}
            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium text-text-secondary"
              >
                Telefone (opcional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
                <PhoneInput
                  international
                  defaultCountry="BR"
                  value={phoneValue}
                  onChange={value => {
                    setPhoneValue(value);
                    // Extract country code from phone number
                    if (value && value.startsWith('+55')) {
                      setCountryCode('BR');
                    }
                  }}
                  onCountryChange={country => {
                    if (country) {
                      setCountryCode(country);
                    }
                  }}
                  className="phone-input w-full rounded-lg border border-border bg-background px-10 py-3 text-text-primary focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-text-secondary"
              >
                Senha
              </label>
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
                Confirmar senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-border bg-background px-10 py-3 text-text-primary placeholder-text-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  placeholder="Digite a senha novamente"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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

            {/* Terms Acceptance */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <input
                  id="acceptTerms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={e => setAcceptTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 cursor-pointer rounded border-border bg-background text-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  required
                />
                <label
                  htmlFor="acceptTerms"
                  className="cursor-pointer text-sm text-text-secondary"
                >
                  Eu li e aceito os{' '}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="text-primary-400 underline hover:text-primary-300"
                  >
                    Termos de Uso
                  </Link>{' '}
                  e a{' '}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="text-primary-400 underline hover:text-primary-300"
                  >
                    Política de Privacidade
                  </Link>
                  <span className="text-red-400"> *</span>
                </label>
              </div>

              <div className="flex items-start gap-3">
                <input
                  id="acceptMarketing"
                  type="checkbox"
                  checked={acceptMarketing}
                  onChange={e => setAcceptMarketing(e.target.checked)}
                  className="mt-1 h-4 w-4 cursor-pointer rounded border-border bg-background text-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
                <label
                  htmlFor="acceptMarketing"
                  className="cursor-pointer text-sm text-text-secondary"
                >
                  Quero receber promoções, novidades e ofertas exclusivas por
                  e-mail (opcional)
                </label>
              </div>

              {/* LGPD Notice */}
              <div className="rounded-lg border border-border bg-background-secondary/50 p-3">
                <p className="text-xs text-text-tertiary">
                  🔒 Seus dados estão protegidos conforme a LGPD. Você pode
                  acessar, corrigir ou deletar suas informações a qualquer
                  momento. Não vendemos dados para terceiros.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-cta py-3 font-semibold text-white shadow-glow-primary transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-border" />
            <span className="px-4 text-sm text-text-tertiary">Já tem conta?</span>
            <div className="flex-1 border-t border-border" />
          </div>

          {/* Login Link */}
          <Link
            href="/login"
            className="block w-full rounded-lg border border-border bg-background-secondary py-3 text-center font-medium text-text-primary transition-colors hover:bg-background-tertiary"
          >
            Fazer login
          </Link>
        </div>
      </div>
    </div>
  );
}
