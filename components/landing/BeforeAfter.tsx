'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function BeforeAfter() {
  const results = [
    { id: 1, label: 'Enhanced HD' },
    { id: 2, label: 'Video Promo' },
    { id: 3, label: 'Social Media' },
    { id: 4, label: 'Background Removed' },
    { id: 5, label: 'Ad Creative' },
    { id: 6, label: 'Product Sheet' },
  ];

  return (
    <section id="demo" className="relative overflow-hidden bg-background py-24">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-500/10 via-transparent to-primary-500/10" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-4xl font-bold text-text-primary md:text-5xl">
            Uma foto.{' '}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Infinitas possibilidades.
            </span>
          </h2>
          <p className="mb-16 text-lg text-text-secondary">
            Veja como transformamos uma simples foto em múltiplos formatos
            profissionais
          </p>
        </div>

        {/* Before/After Layout */}
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
          {/* Left: Original Image */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-text-tertiary" />
              <h3 className="text-xl font-semibold text-text-primary">
                Foto Original
              </h3>
            </div>

            <div className="group relative aspect-square overflow-hidden rounded-2xl border border-border bg-background-tertiary">
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-32 w-32 rounded-2xl bg-gradient-card" />
                  <p className="text-sm text-text-tertiary">
                    Sua foto de produto
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Generated Results */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-primary-500" />
              <h3 className="text-xl font-semibold text-text-primary">
                Resultados Gerados
              </h3>
              <div className="ml-auto rounded-full bg-success-500/20 px-3 py-1 text-xs font-medium text-success-400">
                6 variações
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {results.map(result => (
                <div
                  key={result.id}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-background-tertiary transition-all hover:scale-105 hover:border-primary-500/50 hover:shadow-glow-primary"
                >
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <div className="mx-auto mb-2 h-12 w-12 rounded-lg bg-gradient-card" />
                    </div>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/80 to-transparent p-3">
                    <p className="text-xs font-medium text-text-secondary">
                      {result.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="mx-auto mt-12 max-w-4xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              'Remoção de fundo',
              'Correção de iluminação',
              'Múltiplos formatos',
              'Vídeos promocionais',
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-lg border border-border bg-background-tertiary p-4"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-500/20">
                  <ArrowRight className="h-4 w-4 text-success-400" />
                </div>
                <span className="text-sm font-medium text-text-secondary">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/generate"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-cta px-8 py-4 text-lg font-semibold text-white shadow-glow-primary transition-all hover:scale-105"
          >
            Testar com suas fotos
          </Link>
        </div>
      </div>
    </section>
  );
}
