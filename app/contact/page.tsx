import Link from 'next/link';
import { ArrowLeft, Mail, MessageSquare, Phone } from 'lucide-react';

export default function ContactPage() {
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
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold text-text-primary md:text-5xl">
              Entre em Contato
            </h1>
            <p className="text-xl text-text-secondary">
              Estamos aqui para ajudar. Escolha o canal mais conveniente para
              você.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Email */}
            <a
              href="mailto:suporte@productify.app"
              className="group rounded-2xl border border-border bg-background-secondary p-8 transition-all hover:border-primary-500 hover:shadow-lg"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-500/10 transition-colors group-hover:bg-primary-500/20">
                <Mail className="h-7 w-7 text-primary-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-text-primary">
                Email
              </h3>
              <p className="mb-4 text-sm text-text-secondary">
                Resposta em até 24 horas
              </p>
              <p className="font-mono text-sm text-primary-400">
                suporte@productify.app
              </p>
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/5511999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl border border-border bg-background-secondary p-8 transition-all hover:border-accent-500 hover:shadow-lg"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent-500/10 transition-colors group-hover:bg-accent-500/20">
                <Phone className="h-7 w-7 text-accent-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-text-primary">
                WhatsApp
              </h3>
              <p className="mb-4 text-sm text-text-secondary">
                Atendimento rápido
              </p>
              <p className="font-mono text-sm text-accent-400">
                +55 11 99999-9999
              </p>
            </a>

            {/* Chat */}
            <div className="group rounded-2xl border border-border bg-background-secondary p-8 transition-all hover:border-primary-500 hover:shadow-lg">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-500/10 transition-colors group-hover:bg-primary-500/20">
                <MessageSquare className="h-7 w-7 text-primary-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-text-primary">
                Chat ao vivo
              </h3>
              <p className="mb-4 text-sm text-text-secondary">
                Disponível durante expediente
              </p>
              <p className="text-sm text-text-tertiary">Em breve</p>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-16 rounded-2xl border border-border bg-background-secondary p-8">
            <h2 className="mb-6 text-2xl font-bold text-text-primary">
              Perguntas Frequentes
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="mb-2 font-semibold text-text-primary">
                  Como funciona o sistema de créditos?
                </h3>
                <p className="text-sm text-text-secondary">
                  Cada funcionalidade consome uma quantidade específica de
                  créditos: Imagens aprimoradas (10 créditos), Vídeos
                  promocionais (30 créditos), Textos virais (5 créditos) e
                  Voice-overs (15 créditos).
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-text-primary">
                  Os créditos expiram?
                </h3>
                <p className="text-sm text-text-secondary">
                  Não, seus créditos não têm data de validade. Use quando
                  precisar.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-text-primary">
                  Posso cancelar a qualquer momento?
                </h3>
                <p className="text-sm text-text-secondary">
                  Sim, você tem total controle. Não há contratos ou períodos
                  mínimos.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-text-primary">
                  Como funciona o reembolso?
                </h3>
                <p className="text-sm text-text-secondary">
                  Oferecemos garantia de 7 dias. Se não ficar satisfeito,
                  reembolsamos 100% do valor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
