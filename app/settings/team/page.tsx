'use client';

import { useState } from 'react';
import { Users, Mail, UserPlus, MoreVertical, Trash2, Shield, X, CheckCircle2 } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'pending';
  joinedAt: string;
}

export default function TeamPage() {
  const [members] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Você',
      email: 'voce@exemplo.com',
      role: 'owner',
      status: 'active',
      joinedAt: '2024-01-15',
    },
  ]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const getRoleBadge = (role: string) => {
    const styles = {
      owner: 'bg-primary-500/20 text-primary-400',
      admin: 'bg-purple-500/20 text-purple-400',
      member: 'bg-blue-500/20 text-blue-400',
    };

    const labels = {
      owner: 'Proprietário',
      admin: 'Admin',
      member: 'Membro',
    };

    return (
      <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles[role as keyof typeof styles]}`}>
        {labels[role as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header com ação */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Gestão de Equipe</h2>
          <p className="text-sm text-text-secondary mt-1">
            Convide membros para colaborar na sua conta
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 rounded-lg bg-gradient-cta px-4 py-2 font-semibold text-white transition-all hover:scale-105"
        >
          <UserPlus className="h-5 w-5" />
          Convidar Membro
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-background-tertiary p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background-secondary">
              <Users className="h-6 w-6 text-primary-400" />
            </div>
          </div>
          <p className="text-sm font-medium text-text-secondary mb-1">Total de Membros</p>
          <p className="text-3xl font-bold text-text-primary">{members.length}</p>
        </div>

        <div className="rounded-2xl border border-border bg-background-tertiary p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background-secondary">
              <Mail className="h-6 w-6 text-blue-400" />
            </div>
          </div>
          <p className="text-sm font-medium text-text-secondary mb-1">Convites Pendentes</p>
          <p className="text-3xl font-bold text-text-primary">0</p>
        </div>

        <div className="rounded-2xl border border-border bg-background-tertiary p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background-secondary">
              <Shield className="h-6 w-6 text-purple-400" />
            </div>
          </div>
          <p className="text-sm font-medium text-text-secondary mb-1">Admins</p>
          <p className="text-3xl font-bold text-text-primary">1</p>
        </div>
      </div>

      {/* Lista de membros */}
      <div className="overflow-hidden rounded-lg border border-border bg-background-tertiary">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-background-secondary">
                <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                  Membro
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                  Função
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                  Membro desde
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-text-primary">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr
                  key={member.id}
                  className="border-b border-border transition-colors hover:bg-background-secondary"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-text-primary">{member.name}</p>
                      <p className="text-sm text-text-tertiary">{member.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getRoleBadge(member.role)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
                      Ativo
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-tertiary">
                    {new Date(member.joinedAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="rounded-lg p-2 text-text-tertiary transition-colors hover:bg-background hover:text-text-primary">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissões */}
      <div className="rounded-lg border border-border bg-background-tertiary p-6">
        <h3 className="text-lg font-bold text-text-primary mb-4">Permissões por Função</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="rounded-lg bg-primary-500/20 p-2">
                <Shield className="h-5 w-5 text-primary-400" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary">Proprietário</h4>
              <p className="text-sm text-text-secondary">
                Acesso total, incluindo gerenciamento de pagamentos, exclusão de conta e gestão de equipe
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="rounded-lg bg-purple-500/20 p-2">
                <Shield className="h-5 w-5 text-purple-400" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary">Admin</h4>
              <p className="text-sm text-text-secondary">
                Pode gerenciar produtos, convidar membros e visualizar relatórios
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="rounded-lg bg-blue-500/20 p-2">
                <Shield className="h-5 w-5 text-blue-400" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary">Membro</h4>
              <p className="text-sm text-text-secondary">
                Pode criar e gerenciar produtos, mas não pode alterar configurações da conta
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Convite */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500/20">
                  <UserPlus className="h-5 w-5 text-primary-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-primary">Convidar Membro</h3>
                  <p className="text-sm text-text-secondary">Envie um convite por email</p>
                </div>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="rounded-lg p-2 text-text-tertiary transition-colors hover:bg-background-secondary hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                // TODO: Implementar envio de convite
                setShowInviteModal(false);
                setShowSuccessMessage(true);
                setInviteEmail('');
                setInviteRole('member');
                
                // Ocultar mensagem após 5 segundos
                setTimeout(() => {
                  setShowSuccessMessage(false);
                }, 5000);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Email do Membro
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-border bg-background-secondary px-4 py-3 text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  placeholder="membro@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Função
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                  className="w-full rounded-lg border border-border bg-background-secondary px-4 py-3 text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="member">Membro</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="text-xs text-text-tertiary mt-2">
                  {inviteRole === 'admin'
                    ? 'Admins podem gerenciar produtos e convidar outros membros'
                    : 'Membros podem criar e gerenciar produtos'}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteEmail('');
                    setInviteRole('member');
                  }}
                  className="flex-1 rounded-lg border border-border bg-background-secondary px-4 py-3 font-semibold text-text-primary transition-colors hover:bg-background-tertiary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-gradient-cta px-4 py-3 font-semibold text-white transition-all hover:scale-105"
                >
                  Enviar Convite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="flex items-center gap-3 rounded-lg border border-green-500/50 bg-green-500/10 px-6 py-4 shadow-lg backdrop-blur-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="font-semibold text-green-400">Convite Enviado!</p>
              <p className="text-sm text-text-secondary">
                O membro receberá um email com o link de convite
              </p>
            </div>
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="ml-4 rounded-lg p-1 text-text-tertiary transition-colors hover:text-text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
