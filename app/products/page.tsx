'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  Package,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  Image as ImageIcon
} from 'lucide-react';

interface Job {
  _id: string;
  productInfo: {
    name: string;
    description?: string;
  };
  originalImage: {
    url: string;
  };
  items: Array<{
    type: string;
    status: string;
  }>;
  status: string;
  totalCredits: number;
  createdAt: string;
  completedAt?: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function ProductsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 9,
    pages: 0,
  });

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [pagination.page, statusFilter, dateFilter]);

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page === 1) {
        fetchJobs();
      } else {
        setPagination(prev => ({ ...prev, page: 1 }));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (dateFilter !== 'all') params.append('dateFilter', dateFilter);

      const response = await fetch(`/api/jobs?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar produtos');
      }

      setJobs(data.jobs);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Erro ao carregar jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-400" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-400" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-400" />;
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-orange-400" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-400" />;
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
        return 'Aguardando';
      case 'cancelled':
        return 'Cancelado';
      case 'refunded':
        return 'Reembolsado';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'processing':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'cancelled':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'refunded':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    }
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

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case 'enhanced-images':
        return 'Imagens';
      case 'promotional-video':
        return 'Vídeo';
      case 'viral-copy':
        return 'Copy';
      case 'voice-over':
        return 'Voz';
      case 'product-description':
        return 'Descrição';
      case 'captions':
        return 'Legendas';
      default:
        return type;
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
              Meus Produtos
            </h1>
            <p className="text-text-secondary">
              Gerencie todos os seus produtos e mídias geradas
            </p>
          </div>

          {/* Filtros e Busca */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Busca */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
                <input
                  type="text"
                  placeholder="Buscar por nome do produto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background-secondary pl-10 pr-4 py-3 text-text-primary placeholder-text-tertiary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                />
              </div>

              {/* Botão de Filtros */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 rounded-lg border border-border bg-background-secondary px-4 py-3 text-text-primary transition-colors hover:bg-background-tertiary"
              >
                <Filter className="h-5 w-5" />
                <span>Filtros</span>
                {(statusFilter !== 'all' || dateFilter !== 'all') && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-xs text-white">
                    {(statusFilter !== 'all' ? 1 : 0) + (dateFilter !== 'all' ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>

            {/* Painel de Filtros */}
            {showFilters && (
              <div className="rounded-lg border border-border bg-background-secondary p-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Filtro de Status */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-text-secondary">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    >
                      <option value="all">Todos</option>
                      <option value="pending">Aguardando</option>
                      <option value="processing">Processando</option>
                      <option value="completed">Concluído</option>
                      <option value="failed">Falhou</option>
                      <option value="cancelled">Cancelado</option>
                      <option value="refunded">Reembolsado</option>
                    </select>
                  </div>

                  {/* Filtro de Data */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-text-secondary">
                      Período
                    </label>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    >
                      <option value="all">Todos</option>
                      <option value="today">Hoje</option>
                      <option value="week">Última semana</option>
                      <option value="month">Último mês</option>
                      <option value="3months">Últimos 3 meses</option>
                    </select>
                  </div>

                  {/* Botão Limpar Filtros */}
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setStatusFilter('all');
                        setDateFilter('all');
                        setSearchTerm('');
                      }}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2 text-text-secondary transition-colors hover:bg-background-secondary hover:text-text-primary"
                    >
                      Limpar filtros
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Lista de Produtos */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary-400" />
                <p className="text-text-secondary">Carregando produtos...</p>
              </div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="rounded-lg border border-border bg-background-secondary p-12 text-center">
              <Package className="mx-auto mb-4 h-16 w-16 text-text-tertiary" />
              <h3 className="mb-2 text-xl font-semibold text-text-primary">
                Nenhum produto encontrado
              </h3>
              <p className="mb-6 text-text-secondary">
                {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Comece gerando seu primeiro produto!'}
              </p>
              <button
                onClick={() => router.push('/generate')}
                className="rounded-lg bg-gradient-cta px-6 py-3 font-semibold text-white transition-all hover:scale-105"
              >
                Gerar Produto
              </button>
            </div>
          ) : (
            <>
              {/* Grid de Cards */}
              <div className="mb-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {jobs.map((job) => (
                  <div
                    key={job._id}
                    className="group overflow-hidden rounded-2xl border border-border bg-background-tertiary transition-all hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/10"
                  >
                    {/* Imagem */}
                    <div className="relative aspect-video overflow-hidden bg-background-secondary">
                      <img
                        src={job.originalImage.url}
                        alt={job.productInfo.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      
                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        <div className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 backdrop-blur-sm ${getStatusColor(job.status)}`}>
                          {getStatusIcon(job.status)}
                          <span className="text-sm font-medium">
                            {getStatusText(job.status)}
                          </span>
                        </div>
                      </div>

                      {/* Items Count */}
                      <div className="absolute bottom-3 left-3">
                        <div className="flex items-center gap-2 rounded-lg border border-white/20 bg-black/40 px-3 py-1.5 backdrop-blur-sm">
                          <ImageIcon className="h-4 w-4 text-white" />
                          <span className="text-sm font-medium text-white">
                            {job.items.length} {job.items.length === 1 ? 'item' : 'itens'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Conteúdo */}
                    <div className="p-4">
                      <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-text-primary">
                        {job.productInfo.name}
                      </h3>
                      
                      {job.productInfo.description && (
                        <p className="mb-3 line-clamp-2 text-sm text-text-secondary">
                          {job.productInfo.description}
                        </p>
                      )}

                      {/* Items Tags */}
                      <div className="mb-3 flex flex-wrap gap-2">
                        {job.items.slice(0, 3).map((item, i) => (
                          <span
                            key={i}
                            className="rounded-full border border-border bg-background-secondary px-2 py-1 text-xs text-text-secondary"
                          >
                            {getItemTypeLabel(item.type)}
                          </span>
                        ))}
                        {job.items.length > 3 && (
                          <span className="rounded-full border border-border bg-background-secondary px-2 py-1 text-xs text-text-secondary">
                            +{job.items.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between border-t border-border pt-3">
                        <div className="flex items-center gap-2 text-xs text-text-tertiary">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(job.createdAt)}</span>
                        </div>
                        
                        <button
                          onClick={() => router.push(`/jobs/${job._id}`)}
                          className="flex items-center gap-2 rounded-lg bg-primary-500 px-3 py-1.5 text-sm font-medium text-white transition-all hover:bg-primary-600"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Ver</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginação */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between rounded-lg border border-border bg-background-secondary p-4">
                  <div className="text-sm text-text-secondary">
                    Mostrando {(pagination.page - 1) * pagination.limit + 1} -{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                    {pagination.total} produtos
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                      className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-text-primary transition-colors hover:bg-background-tertiary disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-background"
                    >
                      <ChevronLeft className="h-5 w-5" />
                      <span className="hidden sm:inline">Anterior</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        let pageNum;
                        if (pagination.pages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.pages - 2) {
                          pageNum = pagination.pages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                            className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${
                              pagination.page === pageNum
                                ? 'border-primary-500 bg-primary-500 text-white'
                                : 'border-border bg-background text-text-primary hover:bg-background-tertiary'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page === pagination.pages}
                      className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-text-primary transition-colors hover:bg-background-tertiary disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-background"
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
      </main>

      <Footer />
    </div>
  );
}
