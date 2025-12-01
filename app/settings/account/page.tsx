'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { User, Mail, Phone, Building, Save, Loader2 } from 'lucide-react';

export default function AccountPage() {
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
    company: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // TODO: Implementar atualização de dados
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Dados da Conta</h2>
        <p className="text-sm text-text-secondary mt-1">
          Atualize suas informações pessoais e preferências
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Pessoais */}
        <div className="rounded-lg border border-border bg-background-tertiary p-6">
          <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
            <User className="h-5 w-5 text-primary-400" />
            Informações Pessoais
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Nome Completo
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 pl-10 text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Telefone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 pl-10 text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Empresa
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 pl-10 text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  placeholder="Nome da sua empresa"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preferências */}
        <div className="rounded-lg border border-border bg-background-tertiary p-6">
          <h3 className="text-lg font-bold text-text-primary mb-6">
            Preferências
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-text-primary">Notificações por Email</p>
                <p className="text-sm text-text-secondary">Receba atualizações sobre seus produtos</p>
              </div>
              <button
                type="button"
                className="relative h-6 w-11 rounded-full bg-primary-500 transition-colors"
              >
                <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform translate-x-5" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-text-primary">Notificações Push</p>
                <p className="text-sm text-text-secondary">Alertas em tempo real no navegador</p>
              </div>
              <button
                type="button"
                className="relative h-6 w-11 rounded-full bg-background-secondary transition-colors"
              >
                <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-text-primary">Newsletter Mensal</p>
                <p className="text-sm text-text-secondary">Dicas e novidades da plataforma</p>
              </div>
              <button
                type="button"
                className="relative h-6 w-11 rounded-full bg-primary-500 transition-colors"
              >
                <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform translate-x-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Botão Salvar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-gradient-cta px-6 py-3 font-semibold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
