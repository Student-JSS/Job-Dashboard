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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-gray-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-gray-200">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Race Condition Simulation Result
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Two browser tabs sent concurrent PATCH requests to change status to{' '}
                <span className="text-blue-700 font-mono font-medium">running</span>.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Explain banner */}
        <div className="mt-4 p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-950 leading-relaxed">
            <span className="font-semibold text-blue-900">Atomic CAS Guard Active: </span>
            The database matched only the first request with{' '}
            <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-900 font-mono text-[11px]">
              WHERE id = :id AND status = 'pending'
            </code>
            . The second request updated 0 rows and was safely caught with an HTTP 409 Conflict. Data integrity remained 100% consistent.
          </div>
        </div>

        {/* Side-by-side comparison */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Tab 1 */}
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-900">
                  Tab 1 (Request A)
                </span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-semibold">
                200 OK
              </span>
            </div>
            <div className="mt-2.5 text-xs space-y-1.5">
              <p className="text-xs text-emerald-900 font-medium">
                {result.requestA.outcome}
              </p>
              <div className="p-2.5 rounded-lg bg-white border border-emerald-200 font-mono text-[11px] text-gray-800 overflow-x-auto max-h-36">
                <pre>{JSON.stringify(result.requestA, null, 2)}</pre>
              </div>
            </div>
          </div>

          {/* Tab 2 */}
          <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/40">
            <div className="flex items-center justify-between pb-2 border-b border-rose-200">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span className="text-xs font-semibold text-rose-900">
                  Tab 2 (Request B)
                </span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-mono font-semibold">
                409 CONFLICT
              </span>
            </div>
            <div className="mt-2.5 text-xs space-y-1.5">
              <p className="text-xs text-rose-900 font-medium">
                {result.requestB.outcome}
              </p>
              <div className="p-2.5 rounded-lg bg-white border border-rose-200 font-mono text-[11px] text-gray-800 overflow-x-auto max-h-36">
                <pre>{JSON.stringify(result.requestB, null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* Final Database Record */}
        <div className="mt-4 p-3.5 rounded-xl bg-gray-50 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-700">
              Final Database State:
            </span>
            <StatusBadge status={result.finalJobState.status} size="sm" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-white border border-gray-200">
              <span className="text-gray-400 block text-[10px]">Job ID</span>
              <span className="text-gray-800 font-mono text-xs truncate block">
                {result.finalJobState.id}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-gray-200">
              <span className="text-gray-400 block text-[10px]">Title</span>
              <span className="text-gray-800 font-medium truncate block text-xs">
                {result.finalJobState.title}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-gray-200">
              <span className="text-gray-400 block text-[10px]">Status</span>
              <span className="text-blue-700 font-semibold uppercase text-xs">
                {result.finalJobState.status}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-gray-200">
              <span className="text-gray-400 block text-[10px]">Version</span>
              <span className="text-emerald-700 font-mono font-bold text-xs">
                v{result.finalJobState.version}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
