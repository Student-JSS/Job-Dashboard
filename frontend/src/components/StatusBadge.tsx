import React from 'react';
import type { JobStatus } from '../types/job';
import { Clock, PlayCircle, CheckCircle2, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: JobStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const configs = {
    pending: {
      label: 'Pending',
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      icon: Clock,
      dot: 'bg-amber-400',
    },
    running: {
      label: 'Running',
      bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      icon: PlayCircle,
      dot: 'bg-blue-400 animate-pulse',
    },
    completed: {
      label: 'Completed',
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      icon: CheckCircle2,
      dot: 'bg-emerald-400',
    },
    failed: {
      label: 'Failed',
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      icon: XCircle,
      dot: 'bg-rose-400',
    },
  };

  const config = configs[status] || configs.pending;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${sizeClasses[size]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </span>
  );
};
