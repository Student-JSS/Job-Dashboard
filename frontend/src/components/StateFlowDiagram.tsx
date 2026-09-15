import React, { useState } from 'react';
import { ArrowRight, Lock, ChevronDown, ChevronUp, Info } from 'lucide-react';

export const StateFlowDiagram: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl transition-all">
      <div className="p-3 sm:px-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="text-xs font-medium text-slate-300">
            Lifecycle & State Machine Rules:
          </span>
          <div className="hidden md:flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono text-[11px]">
              pending
            </span>
            <ArrowRight className="w-3 h-3 text-slate-600" />
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-mono text-[11px]">
              running
            </span>
            <ArrowRight className="w-3 h-3 text-slate-600" />
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono text-[11px]">
              completed
            </span>
            <span className="text-slate-500 text-[11px]">or</span>
            <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 font-mono text-[11px]">
              failed
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1 cursor-pointer select-none"
        >
          <span className="text-[11px]">{isExpanded ? 'Hide Details' : 'View Rules'}</span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="px-4 pb-3.5 pt-1 border-t border-slate-800/60 text-xs text-slate-400 space-y-2">
          <div className="flex flex-wrap items-center gap-2 pt-1 md:hidden">
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono text-[11px]">
              pending
            </span>
            <ArrowRight className="w-3 h-3 text-slate-600" />
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-mono text-[11px]">
              running
            </span>
            <ArrowRight className="w-3 h-3 text-slate-600" />
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono text-[11px]">
              completed
            </span>
            <span className="text-slate-500 text-[11px]">or</span>
            <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 font-mono text-[11px]">
              failed
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
            <div className="flex items-start gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-300">Terminal Protection:</strong> Completed and failed jobs are immutable and cannot be re-executed.
              </span>
            </div>
            <div className="flex items-start gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-300">Atomic CAS Guard:</strong> Two simultaneous updates targeting the same pending job result in 1 success and 1 HTTP 409 Conflict.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
