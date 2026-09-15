import React from 'react';
import type { JobStats, JobStatus } from '../types/job';
import { Layers, Clock, PlayCircle, CheckCircle2, XCircle } from 'lucide-react';

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
  const cards: Array<{
    key: JobStatus | 'all';
    label: string;
    count: number;
    icon: React.ElementType;
    color: string;
    borderActive: string;
  }> = [
    {
      key: 'all',
      label: 'Total Jobs',
      count: stats?.total ?? 0,
      icon: Layers,
      color: 'text-slate-200',
      borderActive: 'border-slate-400 bg-slate-800/80',
    },
    {
      key: 'pending',
      label: 'Pending',
      count: stats?.pending ?? 0,
      icon: Clock,
      color: 'text-amber-400',
      borderActive: 'border-amber-400/80 bg-amber-950/30',
    },
    {
      key: 'running',
      label: 'Running',
      count: stats?.running ?? 0,
      icon: PlayCircle,
      color: 'text-blue-400',
      borderActive: 'border-blue-400/80 bg-blue-950/30',
    },
    {
      key: 'completed',
      label: 'Completed',
      count: stats?.completed ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      borderActive: 'border-emerald-400/80 bg-emerald-950/30',
    },
    {
      key: 'failed',
      label: 'Failed',
      count: stats?.failed ?? 0,
      icon: XCircle,
      color: 'text-rose-400',
      borderActive: 'border-rose-400/80 bg-rose-950/30',
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
            className={`p-4 rounded-xl text-left border transition-all cursor-pointer select-none ${
              isActive
                ? `${card.borderActive} ring-1 ring-offset-0 shadow-lg`
                : 'border-slate-800 bg-slate-900/60 hover:bg-slate-850 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {card.label}
              </span>
              <Icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-white">
              {card.count}
            </div>
          </button>
        );
      })}
    </div>
  );
};
