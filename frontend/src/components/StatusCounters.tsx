import React from 'react';
import type { JobStats, JobStatus } from '../types/job';
import { Layers, Clock, Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface StatusCountersProps {
  stats: JobStats | null;
  selectedFilter: JobStatus | 'all';
  onSelectFilter: (filter: JobStatus | 'all') => void;
}

export const StatusCounters: React.FC<StatusCountersProps> = ({
  stats,
  selectedFilter,
  onSelectFilter,
}) => {
  const total = stats?.total ?? 0;

  const calculatePct = (count: number) => {
    if (!total || total === 0) return '0%';
    return `${Math.round((count / total) * 100)}%`;
  };

  const cards: Array<{
    key: JobStatus | 'all';
    label: string;
    count: number;
    pct?: string;
    icon: React.ElementType;
    color: string;
    activeBorder: string;
    glow: string;
  }> = [
    {
      key: 'all',
      label: 'All Jobs',
      count: total,
      pct: '100%',
      icon: Layers,
      color: 'text-slate-300',
      activeBorder: 'border-indigo-500/60 bg-indigo-950/20 text-indigo-200',
      glow: 'shadow-indigo-500/10',
    },
    {
      key: 'pending',
      label: 'Pending',
      count: stats?.pending ?? 0,
      pct: calculatePct(stats?.pending ?? 0),
      icon: Clock,
      color: 'text-amber-400',
      activeBorder: 'border-amber-500/60 bg-amber-950/20 text-amber-200',
      glow: 'shadow-amber-500/10',
    },
    {
      key: 'running',
      label: 'Running',
      count: stats?.running ?? 0,
      pct: calculatePct(stats?.running ?? 0),
      icon: Loader2,
      color: 'text-blue-400',
      activeBorder: 'border-blue-500/60 bg-blue-950/20 text-blue-200',
      glow: 'shadow-blue-500/10',
    },
    {
      key: 'completed',
      label: 'Completed',
      count: stats?.completed ?? 0,
      pct: calculatePct(stats?.completed ?? 0),
      icon: CheckCircle2,
      color: 'text-emerald-400',
      activeBorder: 'border-emerald-500/60 bg-emerald-950/20 text-emerald-200',
      glow: 'shadow-emerald-500/10',
    },
    {
      key: 'failed',
      label: 'Failed',
      count: stats?.failed ?? 0,
      pct: calculatePct(stats?.failed ?? 0),
      icon: XCircle,
      color: 'text-rose-400',
      activeBorder: 'border-rose-500/60 bg-rose-950/20 text-rose-200',
      glow: 'shadow-rose-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = selectedFilter === card.key;

        return (
          <button
            key={card.key}
            onClick={() => onSelectFilter(card.key)}
            className={`group relative p-3.5 sm:p-4 rounded-xl text-left border transition-all duration-150 cursor-pointer select-none ${
              isActive
                ? `${card.activeBorder} shadow-lg ${card.glow} ring-1 ring-white/10`
                : 'border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-700/80'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 group-hover:text-slate-300 transition-colors">
                {card.label}
              </span>
              <Icon
                className={`w-4 h-4 ${card.color} ${
                  card.key === 'running' && (stats?.running ?? 0) > 0
                    ? 'animate-spin'
                    : ''
                }`}
              />
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <div className="text-2xl font-bold tracking-tight text-white font-mono">
                {card.count}
              </div>
              {card.pct && (
                <span className="text-[11px] text-slate-500 font-mono">
                  {card.pct}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
