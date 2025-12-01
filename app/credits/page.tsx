'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import {
  Coins,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Calendar,
  Package,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  Crown,
} from 'lucide-react';

interface Transaction {
  _id: string;
  type: 'job_debit' | 'job_refund';
  productName: string;
  amount: number; // Negativo para débito, positivo para crédito
  status: string;
  createdAt: string;
  jobId?: string;
}

interface Stats {
  totalSpent: number;
  totalRefunded: number;
  totalJobs: number;
  completedJobs: number;
}

interface CreditPlan {
  credits: number;
  price: number;
  popular?: boolean;
  bonus?: number;
}

export default function CreditsPage() {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalSpent: 0,
    totalRefunded: 0,
    totalJobs: 0,
    completedJobs: 0,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0, limit: 10 });

  const creditPlans: CreditPlan[] = [
    { credits: 100, price: 29.90 },
    { credits: 250, price: 69.90, bonus: 25 },
    { credits: 500, price: 129.90, bonus: 75, popular: true },
    { credits: 1000, price: 239.90, bonus: 200 },
  ];

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/credits/history?page=${page}&limit=10`);
      const data = await response.json();

      if (response.ok) {
        setTransactions(data.transactions);
        setStats(data.stats);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = (plan: CreditPlan) => {
    // TODO: Integração com Stripe
    alert(`Em breve: Comprar ${plan.credits} créditos por R$ ${plan.price.toFixed(2)}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin text-blue-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'failed':
        return 'Falhou';
      case 'processing':
        return 'Processando';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelado';
      case 'refunded':
        return 'Reembolsado';
      default:
        return status;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="container mx-auto flex-1 px-4 py-24">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-4xl font-bold text-text-primary">
              Meus Créditos
            </h1>
            <p className="text-text-secondary">
              Gerencie seus créditos e veja seu histórico de consumo
            </p>
          </div>

          {/* Cards de Resumo */}
          <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Saldo Atual */}
            <div className="rounded-2xl border border-border bg-gradient-to-br from-primary-500/10 to-primary-600/5 p-6">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-500/20">
                  <Coins className="h-6 w-6 text-primary-400" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <p className="mb-1 text-sm font-medium text-text-secondary">Saldo Atual</p>
              <p className="text-3xl font-bold text-text-primary">
                {session?.user?.credits || 0}
              </p>
              <p className="text-xs text-text-tertiary">créditos disponíveis</p>
            </div>

            {/* Total Gasto */}
            <div className="rounded-2xl border border-border bg-background-tertiary p-6">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background-secondary">
                  <TrendingDown className="h-6 w-6 text-orange-400" />
                </div>
              </div>
              <p className="mb-1 text-sm font-medium text-text-secondary">Total Gasto</p>
              <p className="text-3xl font-bold text-text-primary">{stats.totalSpent}</p>
              <p className="text-xs text-text-tertiary">em {stats.totalJobs} gerações</p>
            </div>

            {/* Concluídos */}
            <div className="rounded-2xl border border-border bg-background-tertiary p-6">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background-secondary">
                  <CheckCircle2 className="h-6 w-6 text-green-400" />
                </div>
              </div>
              <p className="mb-1 text-sm font-medium text-text-secondary">Concluídos</p>
              <p className="text-3xl font-bold text-text-primary">{stats.completedJobs}</p>
              <p className="text-xs text-text-tertiary">
                {stats.totalJobs > 0 
                  ? `${Math.round((stats.completedJobs / stats.totalJobs) * 100)}% de sucesso`
                  : 'Nenhuma geração ainda'}
              </p>
            </div>

            {/* Reembolsados */}
            <div className="rounded-2xl border border-border bg-background-tertiary p-6">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background-secondary">
                  <Package className="h-6 w-6 text-blue-400" />
                </div>
              </div>
              <p className="mb-1 text-sm font-medium text-text-secondary">Reembolsados</p>
              <p className="text-3xl font-bold text-text-primary">{stats.totalRefunded}</p>
              <p className="text-xs text-text-tertiary">créditos devolvidos</p>
            </div>
          </div>

          {/* Planos de Crédito */}
          <div className="mb-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-text-primary">Comprar Créditos</h2>
              <ShoppingCart className="h-6 w-6 text-text-tertiary" />
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {creditPlans.map((plan, index) => (
                <div
                  key={index}
                  className={`relative overflow-hidden rounded-2xl border p-6 transition-all hover:scale-105 ${
                    plan.popular
                      ? 'border-primary-500 bg-gradient-to-br from-primary-500/10 to-primary-600/5 shadow-lg shadow-primary-500/20'
                      : 'border-border bg-background-tertiary hover:border-primary-500/50'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute right-4 top-4">
                      <div className="flex items-center gap-1 rounded-full bg-primary-500 px-3 py-1 text-xs font-semibold text-white">
                        <Crown className="h-3 w-3" />
                        <span>Popular</span>
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <div className="mb-2 flex items-center gap-2">
                      {plan.bonus ? (
                        <Zap className="h-6 w-6 text-primary-400" />
                      ) : (
                        <Sparkles className="h-6 w-6 text-text-tertiary" />
                      )}
                      <span className="text-lg font-semibold text-text-primary">
                        {plan.credits + (plan.bonus || 0)}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary">créditos</p>
                    {plan.bonus && (
                      <div className="mt-2 inline-block rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-400">
                        +{plan.bonus} bônus
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <p className="text-3xl font-bold text-text-primary">
                      R$ {plan.price.toFixed(2)}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      R$ {(plan.price / (plan.credits + (plan.bonus || 0))).toFixed(2)} por crédito
                    </p>
                  </div>

                  <button
                    onClick={() => handlePurchase(plan)}
                    className={`w-full rounded-lg py-3 font-semibold transition-all ${
                      plan.popular
                        ? 'bg-gradient-cta text-white hover:scale-105'
                        : 'border border-border bg-background-secondary text-text-primary hover:bg-background'
                    }`}
                  >
                    Comprar
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Histórico de Transações */}
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-text-primary">Histórico de Consumo</h2>
              <Calendar className="h-6 w-6 text-text-tertiary" />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary-400" />
                  <p className="text-text-secondary">Carregando histórico...</p>
                </div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="rounded-lg border border-border bg-background-secondary p-12 text-center">
                <Package className="mx-auto mb-4 h-16 w-16 text-text-tertiary" />
                <h3 className="mb-2 text-xl font-semibold text-text-primary">
                  Nenhuma transação ainda
                </h3>
                <p className="text-text-secondary">
                  Comece gerando seu primeiro produto para ver o histórico de consumo.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-hidden rounded-lg border border-border bg-background-tertiary">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-background-secondary">
                          <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                            Produto
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                            Créditos
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                            Data
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((transaction) => (
                          <tr
                            key={transaction._id}
                            className={`border-b border-border transition-colors hover:bg-background-secondary ${
                              transaction.type === 'job_refund' ? 'bg-green-500/5' : ''
                            }`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {transaction.type === 'job_refund' && (
                                  <div className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">
                                    Reembolso
                                  </div>
                                )}
                                <p className="font-medium text-text-primary">
                                  {transaction.productName}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {transaction.amount > 0 ? (
                                  <>
                                    <TrendingUp className="h-4 w-4 text-green-400" />
                                    <span className="font-medium text-green-400">
                                      +{transaction.amount}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <TrendingDown className="h-4 w-4 text-orange-400" />
                                    <span className="font-medium text-orange-400">
                                      {transaction.amount}
                                    </span>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(transaction.status)}
                                <span className="text-sm text-text-secondary">
                                  {getStatusText(transaction.status)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-text-tertiary">
                              {formatDate(transaction.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Paginação */}
                {pagination.pages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-text-secondary">
                      Página {page} de {pagination.pages}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-text-primary transition-colors hover:bg-background-tertiary disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ChevronLeft className="h-5 w-5" />
                        <span className="hidden sm:inline">Anterior</span>
                      </button>

                      <button
                        onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                        disabled={page === pagination.pages}
                        className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-text-primary transition-colors hover:bg-background-tertiary disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span className="hidden sm:inline">Próxima</span>
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
