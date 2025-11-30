'use client';

import { Check, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function PricingSection() {
  const plans = [
    {
      name: 'MINI',
      credits: 100,
      price: 'R$ 9,90',
      description: 'Perfeito para testar',
      features: [
        '100 créditos',
        '20 imagens melhoradas',
        '5 vídeos promocionais',
        'Copies com IA',
        'Suporte por email',
      ],
      highlighted: false,
    },
    {
      name: 'LITE',
      credits: 500,
      price: 'R$ 39,90',
      description: 'Ideal para negócios',
      features: [
        '500 créditos',
        '100 imagens melhoradas',
        '25 vídeos promocionais',
        'Copies com IA',
        'Suporte prioritário',
        'Voice-over incluído',
      ],
      highlighted: true,
      badge: 'MAIS POPULAR',
    },
    {
      name: 'PRO',
      credits: 1000,
      price: 'R$ 69,90',
      description: 'Para escalar vendas',
      features: [
        '1000 créditos',
        '200 imagens melhoradas',
        '50 vídeos promocionais',
        'Copies com IA',
        'Suporte prioritário',
        'Voice-over incluído',
        'API access',
        'Webhooks',
      ],
      highlighted: false,
    },
  ];

  return (
    <section className="relative overflow-hidden bg-background py-24">
      {/* Light gradient for contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background-secondary/50 to-transparent" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-4xl font-bold text-text-primary md:text-5xl">
            Escolha o{' '}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              pacote ideal
            </span>
          </h2>
          <p className="mb-4 text-lg text-text-secondary">
            Pague apenas pelos créditos que usar. Sem assinatura, sem
            mensalidade.
          </p>
          <p className="mb-16 text-sm text-text-tertiary">
            💳 Todos os planos aceitam cartão, PIX e boleto
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative overflow-hidden rounded-2xl border p-8 transition-all ${
                plan.highlighted
                  ? 'border-primary-500 bg-gradient-card shadow-glow-primary'
                  : 'border-border bg-background-tertiary hover:border-border-light'
              }`}
            >
              {/* Badge for highlighted plan */}
              {plan.badge && (
                <div className="absolute right-4 top-4 rounded-full bg-gradient-cta px-3 py-1 text-xs font-bold text-white">
                  {plan.badge}
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="mb-2 text-2xl font-bold text-text-primary">
                  {plan.name}
                </h3>
                <p className="text-sm text-text-tertiary">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="mb-1 flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-text-primary">
                    {plan.price}
                  </span>
                  <span className="text-text-tertiary">one-time</span>
                </div>
                <p className="text-sm text-text-secondary">
                  {plan.credits} créditos
                </p>
              </div>

              {/* Features */}
              <ul className="mb-8 space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-success-500/20">
                      <Check className="h-3 w-3 text-success-400" />
                    </div>
                    <span className="text-sm text-text-secondary">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Link
                href="/credits"
                className={`flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 font-semibold transition-all ${
                  plan.highlighted
                    ? 'bg-gradient-cta text-white shadow-glow-primary hover:scale-105'
                    : 'border border-border-light bg-background-secondary text-text-primary hover:bg-background-tertiary'
                }`}
              >
                {plan.highlighted && <Sparkles className="h-4 w-4" />}
                <span>Comprar {plan.name}</span>
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="mx-auto mt-12 max-w-2xl text-center">
          <p className="text-sm text-text-tertiary">
            🔒 Pagamento seguro • ⚡ Créditos liberados na hora • ♻️ Créditos
            nunca expiram
          </p>
        </div>
      </div>
    </section>
  );
}
