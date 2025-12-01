'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Download,
  Image as ImageIcon,
  Video,
  FileText,
  Mic,
} from 'lucide-react';

interface JobItem {
  type: string;
  credits: number;
  status: string;
  config?: any;
  result?: {
    count?: number;
    images?: string[];
    files?: string[];
    text?: string;
    error?: string;
  };
}

interface Job {
  _id: string;
  productInfo: {
    name: string;
    description?: string;
  };
  originalImage: {
    url: string;
  };
  items: JobItem[];
  totalCredits: number;
  status: string;
  progress: number;
  createdAt: string;
}

export default function JobPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const jobId = params.id as string;

  useEffect(() => {
    fetchJob();
    // Polling a cada 5 segundos se o job estiver em processamento
    const interval = setInterval(() => {
      if (job?.status === 'pending' || job?.status === 'processing') {
        fetchJob();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [jobId, job?.status]);

  const fetchJob = async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar trabalho');
      }

      console.log('📥 Job recebido:', JSON.stringify(data.job, null, 2));
      setJob(data.job);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar trabalho');
    } finally {
      setLoading(false);
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'enhanced-images':
        return ImageIcon;
      case 'promotional-video':
        return Video;
      case 'viral-copy':
        return FileText;
      case 'voice-over':
        return Mic;
      default:
        return Sparkles;
    }
  };

  const getItemName = (type: string) => {
    switch (type) {
      case 'enhanced-images':
        return 'Imagens Aprimoradas';
      case 'promotional-video':
        return 'Vídeo Promocional';
      case 'viral-copy':
        return 'Copy Viral';
      case 'voice-over':
        return 'Narração (Voice-over)';
      case "product-description":
        return "Descrição do Produto";
      default:
        return type;
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
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      case 'processing':
        return 'text-blue-400';
      default:
        return 'text-yellow-400';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="container mx-auto flex flex-1 items-center justify-center px-4 py-24">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary-400" />
            <p className="text-text-secondary">Carregando trabalho...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="container mx-auto flex flex-1 items-center justify-center px-4 py-24">
          <div className="text-center">
            <XCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
            <h1 className="mb-2 text-2xl font-bold text-text-primary">
              Erro ao carregar trabalho
            </h1>
            <p className="mb-6 text-text-secondary">{error}</p>
            <button
              onClick={() => router.push('/generate')}
              className="rounded-lg bg-gradient-cta px-6 py-3 font-semibold text-white transition-all hover:scale-105"
            >
              Voltar para Gerar
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="container mx-auto flex-1 px-4 py-24">
        {/* Back Button */}
        <button
          onClick={() => router.push('/generate')}
          className="mb-6 flex items-center gap-2 text-text-tertiary transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar</span>
        </button>

        {/* Page Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-cta">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">
                {job.productInfo.name}
              </h1>
              <div className="flex items-center gap-2 text-sm text-text-tertiary">
                <span>
                  {new Date(job.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Image */}
            <div className="rounded-2xl border border-border bg-background-tertiary p-6">
              <h2 className="mb-4 text-xl font-semibold text-text-primary">
                Imagem Original
              </h2>
              <div className="flex justify-center">
                <img
                  src={job.originalImage.url}
                  alt={job.productInfo.name}
                  className="max-h-96 w-auto rounded-lg border border-border object-contain"
                />
              </div>
              {job.productInfo.description && (
                <p className="mt-4 text-sm text-text-secondary">
                  {job.productInfo.description}
                </p>
              )}
            </div>

            {/* Generation Items */}
            <div className="rounded-2xl border border-border bg-background-tertiary p-6">
              <h2 className="mb-4 text-xl font-semibold text-text-primary">
                Itens de Geração
              </h2>
              <div className="space-y-4">
                {job.items.map((item, index) => {
                  const Icon = getItemIcon(item.type);
                  return (
                    <div
                      key={index}
                      className="rounded-lg border border-border bg-background p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10">
                            <Icon className="h-5 w-5 text-primary-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-text-primary">
                              {getItemName(item.type)}
                            </h3>
                            <div className="flex items-center gap-2 text-sm">
                              {getStatusIcon(item.status)}
                              <span className={getStatusColor(item.status)}>
                                {getStatusText(item.status)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-text-tertiary">
                          {item.credits} créditos
                        </div>
                      </div>

                      {/* Results */}
                      {item.status === 'completed' && item.result && (
                        <div className="mt-3 border-t border-border pt-3">
                          {item.result.images && item.result.images.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-text-secondary">
                                Imagens geradas: {item.result.count || item.result.images.length}
                              </p>
                              <div className="grid grid-cols-2 gap-3">
                                {item.result.images.map((imageUrl, i) => (
                                  <div
                                    key={i}
                                    className="group relative overflow-hidden rounded-lg border border-border bg-background-secondary"
                                  >
                                    <img
                                      src={imageUrl}
                                      alt={`Enhanced ${i + 1}`}
                                      className="h-40 w-full object-cover transition-transform group-hover:scale-105"
                                    />
                                    <a
                                      href={imageUrl}
                                      download
                                      className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                                    >
                                      <Download className="h-6 w-6 text-white" />
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {item.result.files && item.result.files.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-text-secondary">
                                Arquivos gerados:
                              </p>
                              {item.result.files.map((file, i) => (
                                <a
                                  key={i}
                                  href={file}
                                  download
                                  className="flex items-center gap-2 rounded bg-background-secondary px-3 py-2 text-sm text-primary-400 transition-colors hover:bg-background-tertiary"
                                >
                                  <Download className="h-4 w-4" />
                                  <span>Arquivo {i + 1}</span>
                                </a>
                              ))}
                            </div>
                          )}
                          {item.result.text && (
                            <div className="rounded bg-background-secondary p-3">
                              <p className="text-sm text-text-primary whitespace-pre-wrap">
                                {item.result.text}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {item.status === 'failed' && item.result?.error && (
                        <div className="mt-3 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">
                          {item.result.error}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="rounded-2xl border border-border bg-background-tertiary p-6">
              <h2 className="mb-4 text-xl font-semibold text-text-primary">
                Status
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Progresso</span>
                  <span className="text-lg font-bold text-text-primary">
                    {job.progress}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-background">
                  <div
                    className="h-full bg-gradient-cta transition-all duration-500"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(job.status)}
                  <span className={`font-semibold ${getStatusColor(job.status)}`}>
                    {getStatusText(job.status)}
                  </span>
                </div>
              </div>
            </div>

            {/* Credits Info */}
            <div className="rounded-2xl border border-border bg-background-tertiary p-6">
              <h2 className="mb-4 text-xl font-semibold text-text-primary">
                Créditos
              </h2>
              <div className="text-center">
                <p className="text-sm text-text-secondary">Total usado</p>
                <p className="text-3xl font-bold text-primary-400">
                  {job.totalCredits}
                </p>
              </div>
            </div>

           
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
