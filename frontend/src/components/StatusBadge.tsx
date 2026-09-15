import React from 'react';
import type { JobStatus } from '../types/job';
import { Clock, Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: JobStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const configs = {
    pending: {
      label: 'Pending',
      bg: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
      dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]',
      icon: Clock,
    },
    running: {
      label: 'Running',
      bg: 'bg-blue-500/10 text-blue-300 border-blue-500/25',
      dot: 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)] animate-pulse',
      icon: Loader2,
      animateIcon: true,
    },
    completed: {
      label: 'Completed',
      bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
      dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]',
      icon: CheckCircle2,
    },
    failed: {
      label: 'Failed',
      bg: 'bg-rose-500/10 text-rose-300 border-rose-500/25',
      dot: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.5)]',
      icon: XCircle,
    },
  };

  const config = configs[status] || configs.pending;
  const Icon = config.icon;
  const animateIcon = (config as any).animateIcon;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-xs px-3 py-1.5 gap-2 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border tracking-wide select-none ${config.bg} ${sizeClasses[size]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      <Icon className={`w-3.5 h-3.5 ${animateIcon ? 'animate-spin' : ''}`} />
      <span>{config.label}</span>
    </span>
  );
};
