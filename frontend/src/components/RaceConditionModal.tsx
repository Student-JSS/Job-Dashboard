import React from 'react';
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
  if (!result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                Concurrency Race Condition Simulation
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulating two simultaneous PATCH requests competing to transition the same job from{' '}
                <span className="text-amber-400 font-mono">pending</span> to{' '}
                <span className="text-blue-400 font-mono">running</span>.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* State explanation banner */}
        <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-indigo-500/20 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="text-slate-200 font-medium">
              Atomic Compare-And-Swap (CAS) Protection Active
            </p>
            <p className="text-slate-400 leading-relaxed">
              Both requests fired at the exact same millisecond. Only the first request matched the atomic condition{' '}
              <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300">WHERE id = :id AND status = 'pending'</code>.
              The second request detected zero updated rows, read the changed state, and returned an HTTP 409 Conflict. State integrity remained 100% consistent!
            </p>
          </div>
        </div>

        {/* Side-by-side comparison */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Request A */}
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-300">
                  Browser Tab 1 (Request A)
                </span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-medium">
                200 OK
              </span>
            </div>
            <div className="mt-3 text-xs space-y-2">
              <p className="text-slate-300 font-medium">
                Outcome: {result.requestA.outcome}
              </p>
              <div className="p-2.5 rounded bg-slate-950/80 font-mono text-[11px] text-slate-300 overflow-x-auto">
                <pre>{JSON.stringify(result.requestA, null, 2)}</pre>
              </div>
            </div>
          </div>

          {/* Request B */}
          <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/20">
            <div className="flex items-center justify-between pb-2 border-b border-rose-500/20">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-semibold text-rose-300">
                  Browser Tab 2 (Request B)
                </span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono font-medium">
                409 CONFLICT
              </span>
            </div>
            <div className="mt-3 text-xs space-y-2">
              <p className="text-slate-300 font-medium">
                Outcome: {result.requestB.outcome}
              </p>
              <div className="p-2.5 rounded bg-slate-950/80 font-mono text-[11px] text-slate-300 overflow-x-auto">
                <pre>{JSON.stringify(result.requestB, null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* Final Database Record State */}
        <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">
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
              <span className="text-slate-200 font-medium truncate block">
                {result.finalJobState.title}
              </span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Current Status</span>
              <span className="text-blue-400 font-semibold uppercase text-[11px]">
                {result.finalJobState.status}
              </span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Optimistic Version</span>
              <span className="text-emerald-400 font-mono font-bold text-[11px]">
                v{result.finalJobState.version}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
