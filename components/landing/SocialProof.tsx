'use client';

import { Check, Zap, Shield, TrendingUp, Award } from 'lucide-react';

export function SocialProof() {
  const differentials = [
    {
      icon: Zap,
      title: 'Processamento em Segundos',
      description: 'IA treinada com milhões de produtos',
      metric: '< 30s',
      label: 'tempo médio',
    },
    {
      icon: Shield,
      title: 'Qualidade Profissional',
      description: 'Imagens em 4K e vídeos em Full HD',
      metric: '98%',
      label: 'satisfação',
    },
    {
      icon: TrendingUp,
      title: 'Resultados Comprovados',
      description: '+40% de conversão em anúncios',
      metric: '+40%',
      label: 'conversão',
    },
    {
      icon: Award,
      title: 'Usado por Profissionais',
      description: 'E-commerces e agências confiam',
      metric: '10k+',
      label: 'usuários',
    },
  ];

  const features = [
    'Remoção automática de fundo',
    'Correção de iluminação e cores',
    'Geração de múltiplos formatos',
    'Vídeos promocionais com IA',
    'Legendas automáticas',
    'Voice-over profissional',
    'Copies otimizadas para conversão',
    'Integração com plataformas',
  ];

  return (
    <section className="relative overflow-hidden bg-background-secondary py-24">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-transparent to-accent-500/20" />
      <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-primary-500/10 to-transparent" />

      <div className="container relative z-10 mx-auto px-4">
        {/* Headline */}
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-4xl font-bold leading-tight text-text-primary md:text-5xl">
            A IA não vai tomar o seu lugar.
            <br />
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Você vai tomar o lugar de quem não usa IA.
            </span>
          </h2>
          <p className="mb-16 text-lg text-text-secondary">
            Junte-se aos profissionais que já estão na frente da concorrência
          </p>
        </div>

        {/* Differentials Grid */}
        <div className="mx-auto mb-16 grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-4">
          {differentials.map((item, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl border border-border bg-background-tertiary p-6 transition-all hover:border-primary-500/50 hover:shadow-glow-primary"
            >
              <div className="absolute inset-0 bg-gradient-card opacity-0 transition-opacity group-hover:opacity-100" />

              <div className="relative z-10">
                <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-primary-500/10 p-3">
                  <item.icon className="h-6 w-6 text-primary-400" />
                </div>

                <div className="mb-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary-400">
                    {item.metric}
                  </span>
                  <span className="text-sm text-text-tertiary">
                    {item.label}
                  </span>
                </div>

                <h3 className="mb-2 text-lg font-bold text-text-primary">
                  {item.title}
                </h3>
                <p className="text-sm text-text-secondary">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Features Checklist */}
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-border bg-background-tertiary p-8 md:p-12">
            <h3 className="mb-8 text-center text-2xl font-bold text-text-primary">
              Tudo que você precisa em uma plataforma
            </h3>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-success-500/20">
                    <Check className="h-4 w-4 text-success-400" />
                  </div>
                  <span className="text-sm text-text-secondary">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
