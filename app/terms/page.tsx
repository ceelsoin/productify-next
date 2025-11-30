import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsPage() {
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
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600">
              <FileText className="h-9 w-9 text-white" />
            </div>
            <h1 className="mb-4 text-4xl font-bold text-text-primary md:text-5xl">
              Termos de Uso
            </h1>
            <p className="text-text-secondary">
              Última atualização: 30 de novembro de 2025
            </p>
          </div>

          <div className="prose prose-invert max-w-none space-y-8">
            {/* Acceptance */}
            <section className="rounded-2xl border border-border bg-background-secondary p-8">
              <h2 className="mb-4 text-2xl font-bold text-text-primary">
                1. Aceitação dos Termos
              </h2>
              <p className="text-text-secondary">
                Ao acessar e usar o Productify, você concorda com estes Termos
                de Uso e nossa Política de Privacidade. Se não concordar com
                algum termo, não utilize a plataforma.
              </p>
            </section>

            {/* Service Description */}
            <section className="rounded-2xl border border-border bg-background-secondary p-8">
              <h2 className="mb-4 text-2xl font-bold text-text-primary">
                2. Descrição do Serviço
              </h2>
              <div className="space-y-4 text-text-secondary">
                <p>O Productify é uma plataforma SaaS que oferece:</p>
                <ul className="list-inside list-disc space-y-1">
                  <li>
                    Aprimoramento de imagens de produtos usando IA (10 créditos)
                  </li>
                  <li>
                    Geração de vídeos promocionais com templates (30 créditos)
                  </li>
                  <li>Criação de textos virais para marketing (5 créditos)</li>
                  <li>Síntese de voice-overs profissionais (15 créditos)</li>
                </ul>
                <p>
                  Todos os serviços operam com sistema de créditos pré-pagos.
                </p>
              </div>
            </section>

            {/* Registration */}
            <section className="rounded-2xl border border-border bg-background-secondary p-8">
              <h2 className="mb-4 text-2xl font-bold text-text-primary">
                3. Cadastro e Conta
              </h2>
              <div className="space-y-4 text-text-secondary">
                <div>
                  <h3 className="mb-2 font-semibold text-text-primary">
                    3.1. Requisitos
                  </h3>
                  <ul className="list-inside list-disc space-y-1">
                    <li>Ser maior de 18 anos</li>
                    <li>Fornecer informações verdadeiras e atualizadas</li>
                    <li>
                      Verificar número de telefone (prevenção de spam)
                    </li>
                    <li>
                      Um telefone só pode ser usado em uma conta
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-text-primary">
                    3.2. Responsabilidade
                  </h3>
                  <p>
                    Você é responsável por manter a confidencialidade de sua
                    senha e por todas as atividades realizadas em sua conta.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-text-primary">
                    3.3. Créditos Iniciais
                  </h3>
                  <p>
                    Cada nova conta recebe 100 créditos gratuitos para teste da
                    plataforma.
                  </p>
                </div>
              </div>
            </section>

            {/* Credits System */}
            <section className="rounded-2xl border border-border bg-background-secondary p-8">
              <h2 className="mb-4 text-2xl font-bold text-text-primary">
                4. Sistema de Créditos
              </h2>
              <div className="space-y-4 text-text-secondary">
                <div>
                  <h3 className="mb-2 font-semibold text-text-primary">
                    4.1. Consumo
                  </h3>
                  <p>
                    Créditos são deduzidos apenas após processamento
                    bem-sucedido. Falhas no processamento não consomem créditos.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-text-primary">
                    4.2. Validade
                  </h3>
                  <p>
                    Créditos não expiram e podem ser usados a qualquer momento.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-text-primary">
                    4.3. Não Reembolsável
                  </h3>
                  <p>
                    Créditos não utilizados não são reembolsáveis, exceto em
                    casos específicos previstos em nossa política de reembolso.
                  </p>
                </div>
              </div>
            </section>

            {/* Acceptable Use */}
            <section className="rounded-2xl border border-border bg-background-secondary p-8">
              <h2 className="mb-4 text-2xl font-bold text-text-primary">
                5. Uso Aceitável
              </h2>
              <div className="space-y-4 text-text-secondary">
                <div>
                  <h3 className="mb-2 font-semibold text-text-primary">
                    5.1. Conteúdo Permitido
                  </h3>
                  <p>Você pode usar a plataforma para:</p>
                  <ul className="list-inside list-disc space-y-1">
                    <li>Produtos físicos ou digitais legítimos</li>
                    <li>Marketing e e-commerce</li>
                    <li>Conteúdo comercial e promocional</li>
                  </ul>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-text-primary">
                    5.2. Conteúdo Proibido
                  </h3>
                  <p>É estritamente proibido processar:</p>
                  <ul className="list-inside list-disc space-y-1">
                    <li>Conteúdo ilegal, violento ou ofensivo</li>
                    <li>Material protegido por direitos autorais sem permissão</li>
                    <li>Produtos falsificados ou ilegais</li>
                    <li>Conteúdo adulto ou inapropriado</li>
                    <li>Spam ou fraudes</li>
                    <li>Deepfakes ou manipulações enganosas</li>
                  </ul>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-text-primary">
                    5.3. Consequências
                  </h3>
                  <p>
                    Violações resultam em suspensão imediata da conta sem
                    reembolso de créditos.
                  </p>
                </div>
              </div>
            </section>

            {/* Intellectual Property */}
            <section className="rounded-2xl border border-border bg-background-secondary p-8">
              <h2 className="mb-4 text-2xl font-bold text-text-primary">
                6. Propriedade Intelectual
              </h2>
              <div className="space-y-4 text-text-secondary">
                <div>
                  <h3 className="mb-2 font-semibold text-text-primary">
                    6.1. Seu Conteúdo
                  </h3>
                  <p>
                    Você mantém todos os direitos sobre suas imagens originais e
                    conteúdos gerados. Ao usar a plataforma, você nos concede
                    licença temporária para processar seus arquivos.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-text-primary">
                    6.2. Nossa Plataforma
                  </h3>
                  <p>
                    O Productify, incluindo código, design, marca e tecnologia,
                    são propriedade exclusiva e protegidos por leis de direitos
                    autorais.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-text-primary">
                    6.3. Uso Comercial
                  </h3>
                  <p>
                    Você pode usar os conteúdos gerados para fins comerciais sem
                    necessidade de atribuição ao Productify.
                  </p>
                </div>
              </div>
            </section>

            {/* Payment */}
            <section className="rounded-2xl border border-border bg-background-secondary p-8">
              <h2 className="mb-4 text-2xl font-bold text-text-primary">
                7. Pagamentos e Reembolsos
              </h2>
              <div className="space-y-4 text-text-secondary">
                <div>
                  <h3 className="mb-2 font-semibold text-text-primary">
                    7.1. Processamento
                  </h3>
                  <p>
                    Todos os pagamentos são processados com segurança pelo
                    Stripe. Não armazenamos dados de cartão.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-text-primary">
                    7.2. Garantia de 7 Dias
                  </h3>
                  <p>
                    Se não ficar satisfeito com os resultados nos primeiros 7
                    dias após a compra, oferecemos reembolso integral. Após esse
                    período, não há reembolso de créditos não utilizados.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-text-primary">
                    7.3. Impostos
                  </h3>
                  <p>
                    Preços incluem impostos brasileiros aplicáveis. Nota fiscal
                    disponível mediante solicitação.
                  </p>
                </div>
              </div>
            </section>

            {/* Liability */}
            <section className="rounded-2xl border border-border bg-background-secondary p-8">
              <h2 className="mb-4 text-2xl font-bold text-text-primary">
                8. Limitação de Responsabilidade
              </h2>
              <div className="space-y-4 text-text-secondary">
                <div>
                  <h3 className="mb-2 font-semibold text-text-primary">
                    8.1. Disponibilidade
                  </h3>
                  <p>
                    Nos esforçamos para manter o serviço disponível 24/7, mas
                    não garantimos uptime de 100%. Manutenções programadas serão
                    notificadas com antecedência.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-text-primary">
                    8.2. Qualidade dos Resultados
                  </h3>
                  <p>
                    Os resultados gerados por IA podem variar. Não garantimos
                    resultados específicos, mas nos comprometemos a melhorar
                    continuamente.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-text-primary">
                    8.3. Uso de Terceiros
                  </h3>
                  <p>
                    Não nos responsabilizamos por danos resultantes do uso de
                    conteúdos gerados em plataformas de terceiros.
                  </p>
                </div>
              </div>
            </section>

            {/* Termination */}
            <section className="rounded-2xl border border-border bg-background-secondary p-8">
              <h2 className="mb-4 text-2xl font-bold text-text-primary">
                9. Rescisão
              </h2>
              <div className="space-y-4 text-text-secondary">
                <div>
                  <h3 className="mb-2 font-semibold text-text-primary">
                    9.1. Por Você
                  </h3>
                  <p>
                    Você pode deletar sua conta a qualquer momento através das
                    configurações. Créditos não utilizados serão perdidos.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-text-primary">
                    9.2. Por Nós
                  </h3>
                  <p>
                    Podemos suspender ou encerrar sua conta por violação destes
                    termos, atividade fraudulenta ou uso indevido da plataforma.
                  </p>
                </div>
              </div>
            </section>

            {/* Changes */}
            <section className="rounded-2xl border border-border bg-background-secondary p-8">
              <h2 className="mb-4 text-2xl font-bold text-text-primary">
                10. Alterações nos Termos
              </h2>
              <p className="text-text-secondary">
                Podemos modificar estes termos a qualquer momento. Mudanças
                significativas serão notificadas por e-mail com 30 dias de
                antecedência. Uso continuado após alterações constitui
                aceitação.
              </p>
            </section>

            {/* Law */}
            <section className="rounded-2xl border border-border bg-background-secondary p-8">
              <h2 className="mb-4 text-2xl font-bold text-text-primary">
                11. Lei Aplicável
              </h2>
              <p className="text-text-secondary">
                Estes termos são regidos pelas leis brasileiras. Disputas serão
                resolvidas no foro da comarca de São Paulo, SP.
              </p>
            </section>

            {/* Contact */}
            <section className="rounded-2xl border border-border bg-background-secondary p-8">
              <h2 className="mb-4 text-2xl font-bold text-text-primary">
                12. Contato
              </h2>
              <div className="text-text-secondary">
                <p className="mb-4">Para questões sobre estes termos:</p>
                <p>
                  <strong className="text-text-primary">Email:</strong>{' '}
                  <a
                    href="mailto:legal@productify.app"
                    className="text-primary-400 underline"
                  >
                    legal@productify.app
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
