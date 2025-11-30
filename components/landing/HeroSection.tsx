'use client';

import Link from 'next/link';
import { Sparkles, TrendingUp } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-background pt-20">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-accent-500/10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-500/20 via-transparent to-transparent" />

      <div className="container relative z-10 mx-auto px-4 py-16 md:py-24">
        {/* Badge */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-4 py-2 backdrop-blur-sm">
            <TrendingUp className="h-4 w-4 text-primary-400" />
            <span className="text-sm font-medium text-text-secondary">
              +10.000 produtos criados esta semana
            </span>
          </div>
        </div>

        {/* Hero Content */}
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="mb-6 text-5xl font-bold leading-tight text-text-primary md:text-6xl lg:text-7xl">
            Transforme suas fotos em{' '}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              conteúdo viral
            </span>{' '}
            com IA
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-text-secondary md:text-xl">
            Gere imagens profissionais, vídeos promocionais e copies
            persuasivos para seus produtos. Tudo automatizado, tudo com IA.
          </p>

          {/* CTA Buttons */}
          <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/generate"
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-cta px-8 py-4 text-lg font-semibold text-white shadow-glow-primary transition-all hover:scale-105 hover:shadow-glow-primary"
            >
              <Sparkles className="h-5 w-5" />
              <span>Começar gratuitamente</span>
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary-600 to-accent-600 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>

            <Link
              href="#demo"
              className="inline-flex items-center gap-2 rounded-lg border border-border-light bg-background-tertiary px-8 py-4 text-lg font-medium text-text-primary transition-colors hover:bg-background-secondary"
            >
              Ver demonstração
            </Link>
          </div>

          <p className="text-sm text-text-tertiary">
            🎉 Sem cartão de crédito • 100 créditos grátis para começar
          </p>
        </div>

        {/* Product Grid/Carousel Placeholder */}
        <div className="mx-auto mt-16 max-w-6xl">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div
                key={i}
                className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-background-tertiary transition-all hover:scale-105 hover:border-primary-500/50 hover:shadow-glow-primary"
              >
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-2 h-16 w-16 rounded-lg bg-gradient-card" />
                    <p className="text-xs text-text-tertiary">
                      Produto {i}
                    </p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
