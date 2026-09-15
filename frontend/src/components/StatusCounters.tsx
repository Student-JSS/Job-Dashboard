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
    activeBorder: string;
  }> = [
    {
      key: 'all',
      label: 'Total Jobs',
      count: total,
      pct: '100%',
      icon: Layers,
      iconColor: 'text-gray-600',
      activeBorder: 'border-gray-900 bg-gray-50 ring-1 ring-gray-900',
    },
    {
      key: 'pending',
      label: 'Pending',
      count: stats?.pending ?? 0,
      pct: calculatePct(stats?.pending ?? 0),
      icon: Clock,
      iconColor: 'text-amber-600',
      activeBorder: 'border-amber-600 bg-amber-50/30 ring-1 ring-amber-600',
    },
    {
      key: 'running',
      label: 'Running',
      count: stats?.running ?? 0,
      pct: calculatePct(stats?.running ?? 0),
      icon: Loader2,
      iconColor: 'text-blue-600',
      activeBorder: 'border-blue-600 bg-blue-50/30 ring-1 ring-blue-600',
    },
    {
      key: 'completed',
      label: 'Completed',
      count: stats?.completed ?? 0,
      pct: calculatePct(stats?.completed ?? 0),
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      activeBorder: 'border-emerald-600 bg-emerald-50/30 ring-1 ring-emerald-600',
    },
    {
      key: 'failed',
      label: 'Failed',
      count: stats?.failed ?? 0,
      pct: calculatePct(stats?.failed ?? 0),
      icon: XCircle,
      iconColor: 'text-rose-600',
      activeBorder: 'border-rose-600 bg-rose-50/30 ring-1 ring-rose-600',
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
            className={`p-3.5 sm:p-4 rounded-xl text-left border transition cursor-pointer select-none bg-white ${
              isActive
                ? `${card.activeBorder} shadow-xs`
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/60 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
              <div className="text-2xl font-bold tracking-tight text-gray-900 font-mono">
                {card.count}
              </div>
              {card.pct && (
                <span className="text-xs text-gray-400 font-mono">
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
