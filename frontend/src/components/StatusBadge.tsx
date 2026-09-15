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
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
      icon: Clock,
    },
    running: {
      label: 'Running',
      badge: 'bg-blue-50 text-blue-800 border-blue-200',
      dot: 'bg-blue-500 animate-pulse',
      icon: Loader2,
      animateIcon: true,
    },
    completed: {
      label: 'Completed',
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-500',
      icon: CheckCircle2,
    },
    failed: {
      label: 'Failed',
      badge: 'bg-rose-50 text-rose-800 border-rose-200',
      dot: 'bg-rose-500',
      icon: XCircle,
    },
  };

  const config = configs[status] || configs.pending;
  const Icon = config.icon;
  const animateIcon = (config as any).animateIcon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border select-none ${config.badge} ${sizeClasses[size]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      <Icon className={`w-3.5 h-3.5 ${animateIcon ? 'animate-spin' : ''}`} />
      <span>{config.label}</span>
    </span>
  );
};
