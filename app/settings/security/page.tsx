'use client';

import { useState } from 'react';
import { Shield, Lock, Key, Trash2, AlertTriangle, Loader2 } from 'lucide-react';

export default function SecurityPage() {
  const [changingPassword, setChangingPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPassword(true);
    // TODO: Implementar mudança de senha
    await new Promise(resolve => setTimeout(resolve, 1000));
    setChangingPassword(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Segurança</h2>
        <p className="text-sm text-text-secondary mt-1">
          Gerencie sua senha e configurações de segurança
        </p>
      </div>

      {/* Alterar Senha */}
      <div className="rounded-lg border border-border bg-background-tertiary p-6">
        <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary-400" />
          Alterar Senha
        </h3>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Senha Atual
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              placeholder="Digite sua senha atual"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Nova Senha
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              placeholder="Digite sua nova senha"
            />
            <p className="text-xs text-text-tertiary mt-2">
              Mínimo de 8 caracteres, incluindo letras e números
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Confirmar Nova Senha
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              placeholder="Confirme sua nova senha"
            />
          </div>

          <button
            type="submit"
            disabled={changingPassword}
            className="flex items-center gap-2 rounded-lg bg-gradient-cta px-6 py-3 font-semibold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {changingPassword ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Alterando...
              </>
            ) : (
              <>
                <Key className="h-5 w-5" />
                Alterar Senha
              </>
            )}
          </button>
        </form>
      </div>

      {/* Autenticação em Dois Fatores */}
      <div className="rounded-lg border border-border bg-background-tertiary p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-500/20">
              <Shield className="h-6 w-6 text-primary-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">
                Autenticação em Dois Fatores
              </h3>
              <p className="text-sm text-text-secondary mt-1">
                Adicione uma camada extra de segurança à sua conta
              </p>
              <p className="text-xs text-text-tertiary mt-2">
                Em breve: Configure 2FA via app autenticador ou SMS
              </p>
            </div>
          </div>

          <button
            disabled
            className="rounded-lg border border-border bg-background px-4 py-2 text-text-tertiary cursor-not-allowed opacity-50"
          >
            Em Breve
          </button>
        </div>
      </div>

      {/* Sessões Ativas */}
      <div className="rounded-lg border border-border bg-background-tertiary p-6">
        <h3 className="text-lg font-bold text-text-primary mb-6">Sessões Ativas</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
            <div>
              <p className="font-medium text-text-primary">Chrome no Windows</p>
              <p className="text-sm text-text-secondary">Brasil · Última atividade: Agora</p>
              <p className="text-xs text-text-tertiary mt-1">IP: 192.168.1.1</p>
            </div>
            <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
              Atual
            </span>
          </div>
        </div>
      </div>

      {/* Zona de Perigo */}
      <div className="rounded-lg border border-red-500/50 bg-red-500/5 p-6">
        <div className="flex items-start gap-4">
          <AlertTriangle className="h-6 w-6 text-red-400 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-red-400 mb-2">Zona de Perigo</h3>
            <p className="text-sm text-text-secondary mb-4">
              Ações irreversíveis que afetam permanentemente sua conta
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border bg-background-tertiary p-4">
                <div>
                  <p className="font-medium text-text-primary">Excluir Conta</p>
                  <p className="text-sm text-text-secondary">
                    Remove permanentemente sua conta e todos os dados associados
                  </p>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 rounded-lg border border-red-500 bg-red-500/10 px-4 py-2 text-red-400 transition-colors hover:bg-red-500/20"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-primary">Excluir Conta</h3>
                <p className="text-sm text-text-secondary">Esta ação não pode ser desfeita</p>
              </div>
            </div>

            <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/5 p-4">
              <p className="text-sm text-text-secondary">
                Ao excluir sua conta, você perderá:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-text-secondary">
                <li>• Todos os produtos criados</li>
                <li>• Histórico de gerações</li>
                <li>• Créditos restantes</li>
                <li>• Configurações e preferências</li>
              </ul>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Digite "EXCLUIR" para confirmar:
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-border bg-background-secondary px-4 py-3 text-text-primary focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                placeholder="EXCLUIR"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 rounded-lg border border-border bg-background px-4 py-3 font-semibold text-text-primary transition-colors hover:bg-background-secondary"
              >
                Cancelar
              </button>
              <button
                className="flex-1 rounded-lg bg-red-500 px-4 py-3 font-semibold text-white transition-all hover:bg-red-600"
              >
                Excluir Conta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
