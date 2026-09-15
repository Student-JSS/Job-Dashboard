import React, { useEffect } from 'react';
import type { SimulationResult } from '../types/job';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface RaceConditionModalProps {
  result: SimulationResult | null;
  onClose: () => void;
}

export const RaceConditionModal: React.FC<RaceConditionModalProps> = ({
  result,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (result) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [result, onClose]);

  if (!result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Race Condition Simulation
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Two browser tabs sent concurrent PATCH requests to change status to{' '}
                <span className="text-blue-400 font-mono">running</span>.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Explain banner */}
        <div className="mt-3.5 p-3 rounded-xl bg-slate-950/80 border border-indigo-500/20 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-[11px] text-slate-300 leading-relaxed">
            <span className="font-semibold text-white">Atomic CAS Guard Active: </span>
            The database matched only the first request with{' '}
            <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300 font-mono text-[10px]">
              WHERE id = :id AND status = 'pending'
            </code>
            . The concurrent request updated 0 rows and returned an HTTP 409 Conflict. Zero race condition occurred.
          </div>
        </div>

        {/* Side-by-side comparison */}
        <div className="mt-3.5 grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Tab 1 */}
          <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-300">
                  Tab 1 (Request A)
                </span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-medium">
                200 OK
              </span>
            </div>
            <div className="mt-2.5 text-xs space-y-1.5">
              <p className="text-[11px] text-slate-300 font-medium">
                {result.requestA.outcome}
              </p>
              <div className="p-2 rounded bg-slate-950/90 font-mono text-[10px] text-slate-300 overflow-x-auto max-h-36">
                <pre>{JSON.stringify(result.requestA, null, 2)}</pre>
              </div>
            </div>
          </div>

          {/* Tab 2 */}
          <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-950/20">
            <div className="flex items-center justify-between pb-2 border-b border-rose-500/20">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-xs font-semibold text-rose-300">
                  Tab 2 (Request B)
                </span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono font-medium">
                409 CONFLICT
              </span>
            </div>
            <div className="mt-2.5 text-xs space-y-1.5">
              <p className="text-[11px] text-slate-300 font-medium">
                {result.requestB.outcome}
              </p>
              <div className="p-2 rounded bg-slate-950/90 font-mono text-[10px] text-slate-300 overflow-x-auto max-h-36">
                <pre>{JSON.stringify(result.requestB, null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* Final Database Record */}
        <div className="mt-3.5 p-3 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-400">
              Final Database Record State:
            </span>
            <StatusBadge status={result.finalJobState.status} size="sm" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Job ID</span>
              <span className="text-slate-200 font-mono text-[11px] truncate block">
                {result.finalJobState.id}
              </span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Title</span>
              <span className="text-slate-200 font-medium truncate block text-[11px]">
                {result.finalJobState.title}
              </span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Status</span>
              <span className="text-blue-400 font-semibold uppercase text-[11px]">
                {result.finalJobState.status}
              </span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Version</span>
              <span className="text-emerald-400 font-mono font-bold text-[11px]">
                v{result.finalJobState.version}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
