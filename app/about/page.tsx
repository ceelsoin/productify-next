import Link from 'next/link';
import { Sparkles, ArrowLeft, Zap, Shield, Lightbulb } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background-secondary">
        <div className="container mx-auto px-4 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-text-secondary transition-colors hover:text-text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* Hero */}
          <div className="mb-12 text-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-cta">
              <Sparkles className="h-9 w-9 text-white" />
            </div>
            <h1 className="mb-4 text-4xl font-bold text-text-primary md:text-5xl">
              Sobre o Productify
            </h1>
            <p className="text-xl text-text-secondary">
              Transformando fotos de produtos em conteúdo viral com
              inteligência artificial
            </p>
          </div>

          {/* Mission */}
          <div className="mb-16 rounded-2xl border border-border bg-background-secondary p-8">
            <h2 className="mb-4 text-2xl font-bold text-text-primary">
              Nossa Missão
            </h2>
            <p className="text-text-secondary">
              Democratizar a criação de conteúdo profissional para e-commerce e
              marketing digital. Acreditamos que todo empreendedor merece
              acesso a ferramentas de qualidade para promover seus produtos de
              forma atrativa e eficiente.
            </p>
          </div>

          {/* Values */}
          <div className="mb-16">
            <h2 className="mb-8 text-center text-3xl font-bold text-text-primary">
              Nossos Valores
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-xl border border-border bg-background-secondary p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-500/10">
                  <Zap className="h-6 w-6 text-primary-400" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-text-primary">
                  Rapidez
                </h3>
                <p className="text-sm text-text-secondary">
                  Processamento rápido e eficiente. Seu conteúdo pronto em
                  minutos, não em horas.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-background-secondary p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-500/10">
                  <Shield className="h-6 w-6 text-accent-400" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-text-primary">
                  Segurança
                </h3>
                <p className="text-sm text-text-secondary">
                  Seus dados e conteúdos protegidos. Privacidade e segurança
                  são prioridades.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-background-secondary p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-500/10">
                  <Lightbulb className="h-6 w-6 text-primary-400" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-text-primary">
                  Inovação
                </h3>
                <p className="text-sm text-text-secondary">
                  Tecnologias de ponta em IA para resultados profissionais e
                  criativos.
                </p>
              </div>
            </div>
          </div>

          {/* Technology */}
          <div className="mb-16 rounded-2xl border border-border bg-background-secondary p-8">
            <h2 className="mb-4 text-2xl font-bold text-text-primary">
              Tecnologia
            </h2>
            <p className="mb-4 text-text-secondary">
              O Productify utiliza os mais avançados modelos de inteligência
              artificial para:
            </p>
            <ul className="space-y-2 text-text-secondary">
              <li className="flex items-start gap-2">
                <span className="mt-1 text-primary-400">•</span>
                <span>
                  <strong>Aprimorar imagens:</strong> Melhorar iluminação,
                  nitidez e qualidade visual automaticamente
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-primary-400">•</span>
                <span>
                  <strong>Gerar vídeos promocionais:</strong> Criar vídeos
                  dinâmicos com música, legendas e narrações
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-primary-400">•</span>
                <span>
                  <strong>Produzir textos virais:</strong> Copywriting otimizado
                  para conversão e engajamento
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-primary-400">•</span>
                <span>
                  <strong>Sintetizar voice-overs:</strong> Narrações naturais em
                  múltiplas vozes e estilos
                </span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="text-center">
            <p className="mb-6 text-text-secondary">
              Pronto para transformar suas fotos em conteúdo viral?
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-cta px-8 py-3 font-semibold text-white transition-transform hover:scale-105"
            >
              <Sparkles className="h-5 w-5" />
              Começar agora grátis
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
