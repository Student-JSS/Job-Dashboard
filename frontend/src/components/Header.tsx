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
    <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white shadow-xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-gray-900 tracking-tight">
                Job Queue Dashboard
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                v1.0
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  backendOnline === true
                    ? 'bg-emerald-500'
                    : backendOnline === false
                    ? 'bg-rose-500'
                    : 'bg-gray-400'
                }`}
              />
              <span>
                {backendOnline === true
                  ? 'API Connected'
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition"
            title="Open Swagger API Reference"
          >
            <BookOpen className="w-3.5 h-3.5 text-gray-500" />
            <span className="hidden sm:inline">Swagger API</span>
          </a>

          {/* Auto Refresh toggle */}
          <button
            onClick={onToggleAutoRefresh}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
              autoRefresh
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            title="Auto-refresh every 4 seconds"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                autoRefresh ? 'bg-blue-600' : 'bg-gray-400'
              }`}
            />
            <span className="hidden md:inline">Auto-Sync</span>
          </button>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1.5 sm:px-3 sm:py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition disabled:opacity-50 cursor-pointer inline-flex items-center gap-1.5"
            title="Refresh jobs"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-gray-600' : 'text-gray-500'}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Create Job CTA */}
          <button
            onClick={onOpenCreate}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-gray-900 hover:bg-black rounded-lg transition cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Job</span>
          </button>
        </div>
      </div>
    </header>
  );
};
