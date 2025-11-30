'use client';

import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-background py-24">
      {/* Vibrant Gradient Background */}
      <div className="absolute inset-0 bg-gradient-hero opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-500/30 via-transparent to-transparent" />

      {/* Animated gradient orbs */}
      <div className="absolute -left-1/4 top-0 h-96 w-96 animate-pulse rounded-full bg-primary-500/30 blur-3xl" />
      <div className="absolute -right-1/4 bottom-0 h-96 w-96 animate-pulse rounded-full bg-accent-500/30 blur-3xl" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-2 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-primary-400" />
              <span className="text-sm font-medium text-primary-300">
                Oferta de lançamento
              </span>
            </div>
          </div>

          {/* Headline */}
          <h2 className="mb-6 text-4xl font-bold leading-tight text-text-primary md:text-5xl lg:text-6xl">
            Pronto para transformar seus produtos em{' '}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              conteúdo que vende?
            </span>
          </h2>

          {/* Description */}
          <p className="mb-10 text-xl text-text-secondary md:text-2xl">
            Comece agora com 100 créditos grátis.
            <br />
            Sem cartão, sem compromisso.
          </p>

          {/* CTA Buttons */}
          <div className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/generate"
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-cta px-10 py-5 text-xl font-bold text-white shadow-glow-primary transition-all hover:scale-105 hover:shadow-glow-primary"
            >
              <Sparkles className="h-6 w-6" />
              <span>Começar gratuitamente</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-text-tertiary">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success-400" />
              <span>100 créditos grátis</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success-400" />
              <span>Sem cartão necessário</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success-400" />
              <span>Cancele quando quiser</span>
            </div>
          </div>

          {/* Social Proof */}
          <div className="mt-16 border-t border-border pt-12">
            <p className="mb-6 text-sm font-medium uppercase tracking-wider text-text-tertiary">
              Confiado por
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 text-text-muted">
              <div className="text-2xl font-bold">E-commerce</div>
              <div className="h-8 w-px bg-border" />
              <div className="text-2xl font-bold">Agências</div>
              <div className="h-8 w-px bg-border" />
              <div className="text-2xl font-bold">Criadores</div>
              <div className="h-8 w-px bg-border" />
              <div className="text-2xl font-bold">Marcas</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
