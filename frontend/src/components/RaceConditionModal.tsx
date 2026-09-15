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
      <div className="bg-[#0f1422] border border-white/[0.1] rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Concurrent Update Test
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Two requests attempted to transition this job to{' '}
                <span className="text-cyan-400 font-mono">running</span> simultaneously.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.06] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Explain banner */}
        <div className="mt-4 p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/25 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-white">Atomic CAS Check: </span>
            The database matched the first request using{' '}
            <code className="bg-black/40 px-1.5 py-0.5 rounded text-amber-300 font-mono text-[11px]">
              WHERE id = :id AND status = 'pending'
            </code>
            . The concurrent request updated 0 rows and returned an HTTP 409 Conflict. State integrity remained consistent.
          </div>
        </div>

        {/* Side-by-side comparison */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Request A */}
          <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-300">
                  Request A (Committed)
                </span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-semibold">
                200 OK
              </span>
            </div>
            <div className="mt-2.5 text-xs space-y-1.5">
              <p className="text-xs text-emerald-300 font-medium">
                {result.requestA.outcome}
              </p>
              <div className="p-2.5 rounded-lg bg-[#090d16] border border-white/[0.06] font-mono text-[11px] text-slate-300 overflow-x-auto max-h-36">
                <pre>{JSON.stringify(result.requestA, null, 2)}</pre>
              </div>
            </div>
          </div>

          {/* Request B */}
          <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-950/20">
            <div className="flex items-center justify-between pb-2 border-b border-rose-500/20">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-semibold text-rose-300">
                  Request B (Conflict)
                </span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono font-semibold">
                409 CONFLICT
              </span>
            </div>
            <div className="mt-2.5 text-xs space-y-1.5">
              <p className="text-xs text-rose-300 font-medium">
                {result.requestB.outcome}
              </p>
              <div className="p-2.5 rounded-lg bg-[#090d16] border border-white/[0.06] font-mono text-[11px] text-slate-300 overflow-x-auto max-h-36">
                <pre>{JSON.stringify(result.requestB, null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* Final Database Record */}
        <div className="mt-4 p-3.5 rounded-xl bg-[#090d16] border border-white/[0.08]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">
              Final Database State:
            </span>
            <StatusBadge status={result.finalJobState.status} size="sm" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <span className="text-slate-500 block text-[10px]">Job ID</span>
              <span className="text-slate-200 font-mono text-xs truncate block">
                {result.finalJobState.id}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <span className="text-slate-500 block text-[10px]">Title</span>
              <span className="text-slate-200 font-medium truncate block text-xs">
                {result.finalJobState.title}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <span className="text-slate-500 block text-[10px]">Status</span>
              <span className="text-cyan-400 font-semibold uppercase text-xs">
                {result.finalJobState.status}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <span className="text-slate-500 block text-[10px]">Version</span>
              <span className="text-emerald-400 font-mono font-bold text-xs">
                v{result.finalJobState.version}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
