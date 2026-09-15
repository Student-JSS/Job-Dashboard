import React from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export interface NotificationMessage {
  id: string;
  type: 'error' | 'conflict' | 'success' | 'info';
  title?: string;
  message: string;
}

interface NotificationBannerProps {
  notification: NotificationMessage | null;
  onDismiss: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  notification,
  onDismiss,
}) => {
  if (!notification) return null;

  const configs = {
    error: {
      bg: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
      icon: AlertTriangle,
      iconColor: 'text-rose-400',
      defaultTitle: 'Error',
    },
    conflict: {
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      defaultTitle: 'Concurrency Conflict (409)',
    },
    success: {
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
      defaultTitle: 'Success',
    },
    info: {
      bg: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
      icon: Info,
      iconColor: 'text-blue-400',
      defaultTitle: 'Information',
    },
  };

  const config = configs[notification.type] || configs.info;
  const Icon = config.icon;

  return (
    <div
      className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 shadow-md ${config.bg} animate-in fade-in slide-in-from-top-2 duration-200`}
    >
      <div className="flex items-start gap-2.5">
        <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${config.iconColor}`} />
        <div className="text-xs">
          <p className="font-semibold text-white">
            {notification.title || config.defaultTitle}
          </p>
          <p className="mt-0.5 leading-relaxed">{notification.message}</p>
        </div>
      </div>
      <button
        onClick={onDismiss}
        className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
