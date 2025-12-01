'use client';

import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Calendar, Loader2 } from 'lucide-react';

interface DailyUsage {
  date: string;
  credits: number;
}

interface UsageData {
  period: string;
  days: number;
  data: DailyUsage[];
  stats: {
    totalCredits: number;
    totalJobs: number;
    avgPerDay: number;
  };
}

export default function UsageChart() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchUsageData();
  }, [period]);

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/credits/usage?period=${period}`);
      const result = await response.json();

      if (response.ok) {
        setData(result);
      }
    } catch (error) {
      console.error('Erro ao carregar dados de uso:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-border bg-background-secondary p-3 shadow-lg">
          <p className="mb-1 text-sm font-medium text-text-primary">
            {new Date(data.date).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </p>
          <p className="text-sm text-text-secondary">
            <span className="font-semibold text-primary-400">{data.credits}</span> créditos
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-border bg-background-tertiary p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-500/20">
            <TrendingUp className="h-6 w-6 text-primary-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">Consumo de Créditos</h2>
            <p className="text-sm text-text-secondary">
              {data && `${data.stats.avgPerDay} créditos/dia em média`}
            </p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background-secondary p-1">
          <button
            onClick={() => setPeriod('7d')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
              period === '7d'
                ? 'bg-primary-500 text-white'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            7 dias
          </button>
          <button
            onClick={() => setPeriod('30d')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
              period === '30d'
                ? 'bg-primary-500 text-white'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            30 dias
          </button>
          <button
            onClick={() => setPeriod('90d')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
              period === '90d'
                ? 'bg-primary-500 text-white'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            90 dias
          </button>
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="flex h-[300px] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary-400" />
            <p className="text-text-secondary">Carregando dados...</p>
          </div>
        </div>
      ) : data && data.data.length > 0 ? (
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data.data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorCredits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                tickLine={false}
              />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="credits"
                stroke="#8b5cf6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCredits)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-[300px] items-center justify-center">
          <div className="text-center">
            <Calendar className="mx-auto mb-4 h-16 w-16 text-text-tertiary" />
            <h3 className="mb-2 text-lg font-semibold text-text-primary">
              Nenhum dado disponível
            </h3>
            <p className="text-text-secondary">
              Comece gerando produtos para ver seu consumo de créditos ao longo do tempo.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      {data && data.data.length > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border pt-6">
          <div className="text-center">
            <p className="mb-1 text-sm text-text-secondary">Total Consumido</p>
            <p className="text-2xl font-bold text-text-primary">{data.stats.totalCredits}</p>
          </div>
          <div className="text-center">
            <p className="mb-1 text-sm text-text-secondary">Gerações</p>
            <p className="text-2xl font-bold text-text-primary">{data.stats.totalJobs}</p>
          </div>
          <div className="text-center">
            <p className="mb-1 text-sm text-text-secondary">Média Diária</p>
            <p className="text-2xl font-bold text-text-primary">{data.stats.avgPerDay}</p>
          </div>
        </div>
      )}
    </div>
  );
}
