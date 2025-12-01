'use client';

import { useState } from 'react';
import {
  Activity,
  User,
  CreditCard,
  Settings,
  Upload,
  Download,
  Trash2,
  Eye,
  Filter,
} from 'lucide-react';

interface ActivityLog {
  id: string;
  type: 'auth' | 'product' | 'payment' | 'settings';
  action: string;
  description: string;
  ip: string;
  timestamp: string;
}

export default function ActivityPage() {
  const [activities] = useState<ActivityLog[]>([
    {
      id: '1',
      type: 'auth',
      action: 'Login realizado',
      description: 'Login via Google',
      ip: '192.168.1.1',
      timestamp: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'product',
      action: 'Produto criado',
      description: 'Nike Air Max - Geração de imagens',
      ip: '192.168.1.1',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '3',
      type: 'payment',
      action: 'Créditos adquiridos',
      description: '500 créditos por R$ 129,90',
      ip: '192.168.1.1',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
    },
  ]);

  const getActivityIcon = (type: string) => {
    const icons = {
      auth: User,
      product: Upload,
      payment: CreditCard,
      settings: Settings,
    };

    const Icon = icons[type as keyof typeof icons];
    return <Icon className="h-5 w-5" />;
  };

  const getActivityColor = (type: string) => {
    const colors = {
      auth: 'bg-blue-500/20 text-blue-400',
      product: 'bg-green-500/20 text-green-400',
      payment: 'bg-purple-500/20 text-purple-400',
      settings: 'bg-orange-500/20 text-orange-400',
    };

    return colors[type as keyof typeof colors];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-8">
      {/* Header com filtros */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Registro de Atividades</h2>
          <p className="text-sm text-text-secondary mt-1">
            Auditoria completa de todas as ações realizadas na sua conta
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-text-primary transition-colors hover:bg-background-tertiary">
          <Filter className="h-5 w-5" />
          Filtrar
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-background-tertiary p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20">
              <User className="h-6 w-6 text-blue-400" />
            </div>
          </div>
          <p className="text-sm font-medium text-text-secondary mb-1">Autenticações</p>
          <p className="text-3xl font-bold text-text-primary">12</p>
        </div>

        <div className="rounded-2xl border border-border bg-background-tertiary p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/20">
              <Upload className="h-6 w-6 text-green-400" />
            </div>
          </div>
          <p className="text-sm font-medium text-text-secondary mb-1">Produtos Criados</p>
          <p className="text-3xl font-bold text-text-primary">8</p>
        </div>

        <div className="rounded-2xl border border-border bg-background-tertiary p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/20">
              <CreditCard className="h-6 w-6 text-purple-400" />
            </div>
          </div>
          <p className="text-sm font-medium text-text-secondary mb-1">Transações</p>
          <p className="text-3xl font-bold text-text-primary">3</p>
        </div>

        <div className="rounded-2xl border border-border bg-background-tertiary p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/20">
              <Settings className="h-6 w-6 text-orange-400" />
            </div>
          </div>
          <p className="text-sm font-medium text-text-secondary mb-1">Alterações</p>
          <p className="text-3xl font-bold text-text-primary">5</p>
        </div>
      </div>

      {/* Timeline de Atividades */}
      <div className="rounded-lg border border-border bg-background-tertiary">
        <div className="border-b border-border p-6">
          <h3 className="text-lg font-bold text-text-primary">Últimas Atividades</h3>
        </div>

        <div className="divide-y divide-border">
          {activities.map((activity) => (
            <div key={activity.id} className="p-6 transition-colors hover:bg-background-secondary">
              <div className="flex items-start gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-text-primary">{activity.action}</h4>
                      <p className="text-sm text-text-secondary mt-1">{activity.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-text-tertiary">
                          IP: {activity.ip}
                        </span>
                        <span className="text-xs text-text-tertiary">
                          {formatDate(activity.timestamp)}
                        </span>
                      </div>
                    </div>

                    <button className="rounded-lg p-2 text-text-tertiary transition-colors hover:bg-background hover:text-text-primary">
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border p-6">
          <button className="w-full rounded-lg border border-border bg-background px-4 py-3 text-text-primary transition-colors hover:bg-background-secondary">
            Carregar Mais
          </button>
        </div>
      </div>

      {/* Exportar Logs */}
      <div className="rounded-lg border border-border bg-background-tertiary p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-text-primary">Exportar Logs</h3>
            <p className="text-sm text-text-secondary mt-1">
              Baixe um relatório completo de todas as atividades
            </p>
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-text-primary transition-colors hover:bg-background-secondary">
            <Download className="h-5 w-5" />
            Exportar CSV
          </button>
        </div>
      </div>
    </div>
  );
}
