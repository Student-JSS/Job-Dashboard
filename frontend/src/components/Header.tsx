import React from 'react';
import { Layers, Plus, BookOpen, RefreshCw } from 'lucide-react';

interface HeaderProps {
  backendOnline: boolean | null;
  onOpenCreate: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  backendOnline,
  onOpenCreate,
  onRefresh,
  isRefreshing,
  autoRefresh,
  onToggleAutoRefresh,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/70 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
        {/* Logo and title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Mini Job Queue
              </h1>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Dashboard
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    backendOnline === true
                      ? 'bg-emerald-400 animate-pulse'
                      : backendOnline === false
                      ? 'bg-rose-400'
                      : 'bg-slate-500'
                  }`}
                />
                <span className="text-[11px]">
                  {backendOnline === true
                    ? 'API Connected'
                    : backendOnline === false
                    ? 'API Disconnected'
                    : 'Checking API...'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Swagger API docs link */}
          <a
            href="http://localhost:3001/api/docs"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition"
            title="Open Swagger OpenAPI Documentation"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">API Docs</span>
          </a>

          {/* Auto Refresh toggle */}
          <button
            onClick={onToggleAutoRefresh}
            className={`px-2.5 py-1.5 text-xs rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
              autoRefresh
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Auto-refresh every 3 seconds"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                autoRefresh ? 'bg-indigo-400 animate-ping' : 'bg-slate-500'
              }`}
            />
            <span className="hidden md:inline">Auto-Sync</span>
          </button>

          {/* Manual Refresh */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1.5 sm:px-3 sm:py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition disabled:opacity-50 cursor-pointer inline-flex items-center gap-1.5"
            title="Refresh jobs"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* New Job CTA */}
          <button
            onClick={onOpenCreate}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Job</span>
          </button>
        </div>
      </div>
    </header>
  );
};
