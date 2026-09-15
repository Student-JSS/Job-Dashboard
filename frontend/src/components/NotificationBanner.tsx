import React, { useEffect } from 'react';
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
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 4500);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  const configs = {
    error: {
      bg: 'bg-slate-900 border-rose-500/40 text-rose-200',
      icon: AlertTriangle,
      iconColor: 'text-rose-400',
      defaultTitle: 'Error',
    },
    conflict: {
      bg: 'bg-slate-900 border-amber-500/40 text-amber-200',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      defaultTitle: 'Concurrency Conflict (409)',
    },
    success: {
      bg: 'bg-slate-900 border-emerald-500/40 text-emerald-200',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
      defaultTitle: 'Success',
    },
    info: {
      bg: 'bg-slate-900 border-blue-500/40 text-blue-200',
      icon: Info,
      iconColor: 'text-blue-400',
      defaultTitle: 'Notice',
    },
  };

  const config = configs[notification.type] || configs.info;
  const Icon = config.icon;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 fade-in duration-200 shadow-2xl">
      <div
        className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 shadow-xl ${config.bg}`}
      >
        <div className="flex items-start gap-2.5">
          <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${config.iconColor}`} />
          <div className="text-xs">
            <p className="font-semibold text-white">
              {notification.title || config.defaultTitle}
            </p>
            <p className="mt-0.5 text-slate-300 leading-relaxed text-[11px]">
              {notification.message}
            </p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
