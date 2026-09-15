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
      border: 'border-rose-300',
      icon: AlertTriangle,
      iconColor: 'text-rose-600',
      defaultTitle: 'Error',
    },
    conflict: {
      border: 'border-amber-300',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      defaultTitle: 'Concurrency Conflict (409)',
    },
    success: {
      border: 'border-emerald-300',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      defaultTitle: 'Success',
    },
    info: {
      border: 'border-blue-300',
      icon: Info,
      iconColor: 'text-blue-600',
      defaultTitle: 'Notice',
    },
  };

  const config = configs[notification.type] || configs.info;
  const Icon = config.icon;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-bottom-4 fade-in duration-200 shadow-xl">
      <div
        className={`p-3.5 rounded-xl border bg-white ${config.border} flex items-start justify-between gap-3 shadow-lg`}
      >
        <div className="flex items-start gap-2.5">
          <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${config.iconColor}`} />
          <div className="text-xs">
            <p className="font-semibold text-gray-900">
              {notification.title || config.defaultTitle}
            </p>
            <p className="mt-0.5 text-gray-600 leading-relaxed">
              {notification.message}
            </p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
