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
    iconColor: string;
    accentTop: string;
    activeBorder: string;
    activeGlow: string;
  }> = [
    {
      key: 'all',
      label: 'Total Queue',
      count: total,
      pct: '100%',
      icon: Layers,
      iconColor: 'text-indigo-400',
      accentTop: 'before:bg-indigo-500',
      activeBorder: 'border-indigo-500/60 bg-indigo-950/20 text-indigo-200',
      activeGlow: 'shadow-[0_0_20px_rgba(99,102,241,0.15)]',
    },
    {
      key: 'pending',
      label: 'Pending',
      count: stats?.pending ?? 0,
      pct: calculatePct(stats?.pending ?? 0),
      icon: Clock,
      iconColor: 'text-amber-400',
      accentTop: 'before:bg-amber-500',
      activeBorder: 'border-amber-500/60 bg-amber-950/20 text-amber-200',
      activeGlow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    },
    {
      key: 'running',
      label: 'Running',
      count: stats?.running ?? 0,
      pct: calculatePct(stats?.running ?? 0),
      icon: Loader2,
      iconColor: 'text-cyan-400',
      accentTop: 'before:bg-cyan-500',
      activeBorder: 'border-cyan-500/60 bg-cyan-950/20 text-cyan-200',
      activeGlow: 'shadow-[0_0_20px_rgba(6,182,212,0.15)]',
    },
    {
      key: 'completed',
      label: 'Completed',
      count: stats?.completed ?? 0,
      pct: calculatePct(stats?.completed ?? 0),
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
      accentTop: 'before:bg-emerald-500',
      activeBorder: 'border-emerald-500/60 bg-emerald-950/20 text-emerald-200',
      activeGlow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    },
    {
      key: 'failed',
      label: 'Failed',
      count: stats?.failed ?? 0,
      pct: calculatePct(stats?.failed ?? 0),
      icon: XCircle,
      iconColor: 'text-rose-400',
      accentTop: 'before:bg-rose-500',
      activeBorder: 'border-rose-500/60 bg-rose-950/20 text-rose-200',
      activeGlow: 'shadow-[0_0_20px_rgba(244,63,94,0.15)]',
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
            className={`group relative overflow-hidden p-3.5 sm:p-4 rounded-xl text-left border transition-all duration-200 cursor-pointer select-none before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] ${card.accentTop} ${
              isActive
                ? `${card.activeBorder} ${card.activeGlow} bg-[#111728]`
                : 'bg-[#0e1320]/90 border-white/[0.08] hover:border-white/[0.18] hover:bg-[#131a2c]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 group-hover:text-slate-200 transition-colors">
                {card.label}
              </span>
              <Icon
                className={`w-4 h-4 ${card.iconColor} ${
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
                <span className="text-xs text-slate-400 font-mono">
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
