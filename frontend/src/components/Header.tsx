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
    <header className="border-b border-white/[0.08] bg-[#090d16]/85 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-white tracking-tight">
                Job Queue Dashboard
              </h1>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/[0.06] text-indigo-300 border border-white/[0.1]">
                v1.0
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  backendOnline === true
                    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                    : backendOnline === false
                    ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                    : 'bg-slate-500'
                }`}
              />
              <span className="text-slate-400 text-[11px]">
                {backendOnline === true
                  ? 'API Live'
                  : backendOnline === false
                  ? 'API Offline'
                  : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Swagger API docs */}
          <a
            href="http://localhost:3001/api/docs"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg transition"
            title="Open Swagger API Reference"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Swagger API</span>
          </a>

          {/* Auto Refresh toggle */}
          <button
            onClick={onToggleAutoRefresh}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
              autoRefresh
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.15)]'
                : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-slate-200'
            }`}
            title="Auto-refresh every 4 seconds"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                autoRefresh ? 'bg-indigo-400 animate-ping' : 'bg-slate-500'
              }`}
            />
            <span className="hidden md:inline">Auto-Sync</span>
          </button>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1.5 sm:px-3 sm:py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg transition disabled:opacity-50 cursor-pointer inline-flex items-center gap-1.5"
            title="Refresh jobs"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : 'text-slate-400'}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Create Job CTA */}
          <button
            onClick={onOpenCreate}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 rounded-lg transition cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.35)]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Job</span>
          </button>
        </div>
      </div>
    </header>
  );
};
