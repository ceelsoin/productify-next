import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
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
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600">
              <Shield className="h-9 w-9 text-white" />
            </div>
            <h1 className="mb-4 text-4xl font-bold text-text-primary md:text-5xl">
              Política de Privacidade
            </h1>
            <p className="text-text-secondary">
              Última atualização: 30 de novembro de 2025
            </p>
          </div>

          <div className="prose prose-invert max-w-none space-y-8">
            {/* Introduction */}
            <section className="rounded-2xl border border-border bg-background-secondary p-8">
              <h2 className="mb-4 text-2xl font-bold text-text-primary">
                1. Introdução
              </h2>
              <p className="text-text-secondary">
                O Productify (&quot;nós&quot;, &quot;nosso&quot; ou
                &quot;plataforma&quot;) leva sua privacidade a sério. Esta
                Política de Privacidade explica como coletamos, usamos,
                armazenamos e protegemos suas informações pessoais.
              </p>
            </section>

            {/* Data Collection */}
            <section className="rounded-2xl border border-border bg-background-secondary p-8">
              <h2 className="mb-4 text-2xl font-bold text-text-primary">
                2. Dados Coletados
              </h2>
              <div className="space-y-4 text-text-secondary">
                <div>
                  <h3 className="mb-2 font-semibold text-text-primary">
                    2.1. Dados de Cadastro
                  </h3>
                  <ul className="list-inside list-disc space-y-1">
                    <li>Nome completo</li>
                    <li>Endereço de e-mail</li>
                    <li>Senha (criptografada com bcrypt)</li>
                    <li>Número de telefone e código do país</li>
                    <li>Foto de perfil (opcional)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold text-text-primary">
                    2.2. Dados de Uso
                  </h3>
                  <ul className="list-inside list-disc space-y-1">
                    <li>
                      Imagens de produtos enviadas para processamento
                    </li>
                    <li>
                      Conteúdos gerados (imagens, vídeos, textos, áudios)
                    </li>
                    <li>Histórico de consumo de créditos</li>
                    <li>Data e hora de acesso</li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold text-text-primary">
                    2.3. Dados de Pagamento
                  </h3>
                  <ul className="list-inside list-disc space-y-1">
                    <li>
                      Informações processadas exclusivamente pelo Stripe
                    </li>
                    <li>Não armazenamos dados de cartão de crédito</li>
                    <li>Histórico de transações e compras de créditos</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Usage */}
            <section className="rounded-2xl border border-border bg-background-secondary p-8">
              <h2 className="mb-4 text-2xl font-bold text-text-primary">
                3. Como Usamos Seus Dados
              </h2>
              <div className="space-y-2 text-text-secondary">
                <p>Utilizamos suas informações para:</p>
                <ul className="list-inside list-disc space-y-1">
                  <li>Autenticar e gerenciar sua conta</li>
                  <li>
                    Processar suas solicitações de geração de conteúdo
                  </li>
                  <li>Processar pagamentos e gerenciar créditos</li>
                  <li>Enviar notificações importantes sobre o serviço</li>
                  <li>
                    Melhorar nossos serviços e desenvolver novos recursos
                  </li>
                  <li>Prevenir fraudes e abusos da plataforma</li>
                  <li>Cumprir obrigações legais</li>
                </ul>
              </div>
            </section>

            {/* Storage */}
            <section className="rounded-2xl border border-border bg-background-secondary p-8">
              <h2 className="mb-4 text-2xl font-bold text-text-primary">
                4. Armazenamento e Segurança
              </h2>
              <div className="space-y-4 text-text-secondary">
                <div>
                  <h3 className="mb-2 font-semibold text-text-primary">
                    4.1. Medidas de Segurança
                  </h3>
                  <ul className="list-inside list-disc space-y-1">
                    <li>Senhas criptografadas com bcrypt (salt rounds: 10)</li>
                    <li>Conexões HTTPS com certificado SSL/TLS</li>
                    <li>Tokens JWT para autenticação segura</li>
                    <li>
                      Armazenamento em servidores protegidos (MongoDB Atlas)
                    </li>
                    <li>Backups regulares e criptografados</li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold text-text-primary">
                    4.2. Retenção de Dados
                  </h3>
                  <p>
                    Mantemos seus dados enquanto sua conta estiver ativa. Após
                    exclusão da conta:
                  </p>
                  <ul className="list-inside list-disc space-y-1">
                    <li>
                      Dados pessoais são removidos em até 30 dias
                    </li>
                    <li>
                      Conteúdos gerados são removidos imediatamente
                    </li>
                    <li>
                      Dados fiscais mantidos por 5 anos (obrigação legal)
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Sharing */}
            <section className="rounded-2xl border border-border bg-background-secondary p-8">
              <h2 className="mb-4 text-2xl font-bold text-text-primary">
                5. Compartilhamento de Dados
              </h2>
              <div className="space-y-2 text-text-secondary">
                <p>
                  <strong className="text-text-primary">
                    Não vendemos seus dados.
                  </strong>{' '}
                  Compartilhamos apenas com:
                </p>
                <ul className="list-inside list-disc space-y-1">
                  <li>
                    <strong>Stripe:</strong> Processamento de pagamentos
                  </li>
                  <li>
                    <strong>Google Cloud:</strong> APIs de IA (TTS, Nano Banana)
                  </li>
                  <li>
                    <strong>Provedores de hospedagem:</strong> Vercel, MongoDB
                    Atlas
                  </li>
                  <li>
                    <strong>Autoridades:</strong> Quando exigido por lei
                  </li>
                </ul>
              </div>
            </section>

            {/* Cookies */}
            <section className="rounded-2xl border border-border bg-background-secondary p-8">
              <h2 className="mb-4 text-2xl font-bold text-text-primary">
                6. Cookies e Tecnologias Similares
              </h2>
              <div className="space-y-4 text-text-secondary">
                <p>Usamos cookies para:</p>
                <div>
                  <h3 className="mb-2 font-semibold text-text-primary">
                    6.1. Cookies Essenciais
                  </h3>
                  <ul className="list-inside list-disc space-y-1">
                    <li>Manter você autenticado (next-auth.session-token)</li>
                    <li>Lembrar suas preferências</li>
                    <li>Garantir segurança da plataforma</li>
                  </ul>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-text-primary">
                    6.2. Cookies Analíticos (Opcional)
                  </h3>
                  <ul className="list-inside list-disc space-y-1">
                    <li>Analisar uso da plataforma</li>
                    <li>Melhorar experiência do usuário</li>
                  </ul>
                  <p className="mt-2">
                    Você pode recusar cookies não essenciais através do nosso
                    banner.
                  </p>
                </div>
              </div>
            </section>

            {/* Rights */}
            <section className="rounded-2xl border border-border bg-background-secondary p-8">
              <h2 className="mb-4 text-2xl font-bold text-text-primary">
                7. Seus Direitos (LGPD)
              </h2>
              <div className="space-y-2 text-text-secondary">
                <p>Você tem direito a:</p>
                <ul className="list-inside list-disc space-y-1">
                  <li>
                    <strong>Acesso:</strong> Solicitar cópia dos seus dados
                  </li>
                  <li>
                    <strong>Correção:</strong> Atualizar dados incorretos
                  </li>
                  <li>
                    <strong>Exclusão:</strong> Deletar sua conta e dados
                  </li>
                  <li>
                    <strong>Portabilidade:</strong> Exportar seus dados
                  </li>
                  <li>
                    <strong>Oposição:</strong> Recusar processamento específico
                  </li>
                  <li>
                    <strong>Revogação:</strong> Retirar consentimento
                  </li>
                </ul>
                <p className="mt-4">
                  Para exercer seus direitos, entre em contato:{' '}
                  <a
                    href="mailto:privacidade@productify.app"
                    className="text-primary-400 underline"
                  >
                    privacidade@productify.app
                  </a>
                </p>
              </div>
            </section>

            {/* Children */}
            <section className="rounded-2xl border border-border bg-background-secondary p-8">
              <h2 className="mb-4 text-2xl font-bold text-text-primary">
                8. Menores de Idade
              </h2>
              <p className="text-text-secondary">
                Nosso serviço não é direcionado a menores de 18 anos. Se você
                tiver menos de 18 anos, não use a plataforma ou forneça
                informações pessoais. Pais/responsáveis que identificarem uso
                por menores devem nos contatar imediatamente.
              </p>
            </section>

            {/* Changes */}
            <section className="rounded-2xl border border-border bg-background-secondary p-8">
              <h2 className="mb-4 text-2xl font-bold text-text-primary">
                9. Alterações nesta Política
              </h2>
              <p className="text-text-secondary">
                Podemos atualizar esta política periodicamente. Notificaremos
                sobre mudanças significativas por e-mail ou através da
                plataforma. A data de atualização será sempre indicada no topo
                desta página.
              </p>
            </section>

            {/* Contact */}
            <section className="rounded-2xl border border-border bg-background-secondary p-8">
              <h2 className="mb-4 text-2xl font-bold text-text-primary">
                10. Contato
              </h2>
              <div className="text-text-secondary">
                <p className="mb-4">
                  Para questões sobre privacidade e proteção de dados:
                </p>
                <p>
                  <strong className="text-text-primary">Email:</strong>{' '}
                  <a
                    href="mailto:privacidade@productify.app"
                    className="text-primary-400 underline"
                  >
                    privacidade@productify.app
                  </a>
                </p>
                <p>
                  <strong className="text-text-primary">DPO:</strong> Data
                  Protection Officer - Productify
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
