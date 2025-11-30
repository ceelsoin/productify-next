'use client';

import { Upload, Wand2, Download } from 'lucide-react';
import Link from 'next/link';

export function ValueProposition() {
  const steps = [
    {
      number: '01',
      icon: Upload,
      title: 'Faça upload',
      description:
        'Envie uma ou mais fotos do seu produto. Qualquer formato, qualquer qualidade.',
    },
    {
      number: '02',
      icon: Wand2,
      title: 'IA trabalha por você',
      description:
        'Nossa IA processa, melhora e gera múltiplas variações profissionais automaticamente.',
    },
    {
      number: '03',
      icon: Download,
      title: 'Baixe e publique',
      description:
        'Receba imagens HD, vídeos promocionais e copies prontos para usar em segundos.',
    },
  ];

  return (
    <section className="relative overflow-hidden bg-background-secondary py-24">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 to-transparent" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-4xl font-bold text-text-primary md:text-5xl">
            Você só precisa de{' '}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              uma foto
            </span>
            .<br />O Productify faz o resto.
          </h2>
          <p className="mb-16 text-lg text-text-secondary">
            Do upload ao conteúdo finalizado em 3 passos simples
          </p>
        </div>

        {/* Steps Cards */}
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl border border-border bg-background-tertiary p-8 transition-all hover:border-primary-500/50 hover:shadow-card"
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-card opacity-0 transition-opacity group-hover:opacity-100" />

              <div className="relative z-10">
                {/* Number Badge */}
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-cta text-2xl font-bold text-white shadow-glow-primary">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-primary-500/10 p-3">
                  <step.icon className="h-8 w-8 text-primary-400" />
                </div>

                {/* Content */}
                <h3 className="mb-3 text-2xl font-bold text-text-primary">
                  {step.title}
                </h3>
                <p className="text-text-secondary">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/generate"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-cta px-8 py-4 text-lg font-semibold text-white shadow-glow-primary transition-all hover:scale-105"
          >
            Experimentar agora
          </Link>
        </div>
      </div>
    </section>
  );
}
