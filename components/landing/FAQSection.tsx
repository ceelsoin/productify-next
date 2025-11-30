'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'Como funcionam os créditos?',
      answer:
        'Cada operação consome uma quantidade de créditos: melhoramento de imagem (5 créditos), geração de vídeo (20 créditos), e geração de copy (2 créditos). Você compra um pacote de créditos e usa quando quiser, sem prazo de validade.',
    },
    {
      question: 'Posso usar as imagens e vídeos gerados comercialmente?',
      answer:
        'Sim! Todo conteúdo gerado pela plataforma é 100% seu. Você pode usar em anúncios, redes sociais, e-commerce, ou qualquer outro canal comercial sem restrições.',
    },
    {
      question: 'Qual a qualidade das imagens e vídeos gerados?',
      answer:
        'Todas as imagens são geradas em alta resolução (até 4K) e os vídeos em Full HD (1080p). Nossa IA foi treinada com milhões de produtos para garantir qualidade profissional.',
    },
    {
      question: 'Quanto tempo leva para processar?',
      answer:
        'O processamento é muito rápido: imagens ficam prontas em média 10-15 segundos, e vídeos em 20-30 segundos. Você recebe uma notificação assim que estiver pronto.',
    },
    {
      question: 'Preciso ter conhecimento técnico?',
      answer:
        'Não! A plataforma foi desenvolvida para ser extremamente simples. Você só precisa fazer upload da foto do produto e nossa IA faz todo o trabalho pesado.',
    },
    {
      question: 'Os créditos expiram?',
      answer:
        'Não! Seus créditos nunca expiram. Você pode usar quando quiser, no seu próprio ritmo.',
    },
    {
      question: 'Posso cancelar ou pedir reembolso?',
      answer:
        'Como trabalhamos com créditos pré-pagos e não assinatura, não há necessidade de cancelamento. Se houver algum problema técnico com o processamento, reembolsamos os créditos utilizados.',
    },
    {
      question: 'Há alguma integração com outras plataformas?',
      answer:
        'Sim! No plano PRO você tem acesso à API e webhooks para integrar com suas ferramentas. Também oferecemos integrações nativas com Shopify, WooCommerce e outras plataformas.',
    },
  ];

  return (
    <section className="bg-background-secondary py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-text-primary">
              Perguntas Frequentes
            </h2>
            <p className="text-lg text-text-secondary">
              Tudo que você precisa saber sobre o Productify
            </p>
          </div>

          {/* Accordion */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-xl border border-border bg-background-tertiary transition-all hover:border-border-light"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-background-secondary/50"
                >
                  <span className="pr-8 text-lg font-semibold text-text-primary">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 flex-shrink-0 text-text-secondary transition-transform ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all ${
                    openIndex === index ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="border-t border-border p-6 pt-4">
                    <p className="text-text-secondary">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-12 text-center">
            <p className="mb-4 text-text-secondary">
              Ainda tem dúvidas? Estamos aqui para ajudar!
            </p>
            <a
              href="mailto:suporte@productify.com"
              className="inline-flex items-center gap-2 text-primary-400 transition-colors hover:text-primary-300"
            >
              <span className="font-medium">suporte@productify.com</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
