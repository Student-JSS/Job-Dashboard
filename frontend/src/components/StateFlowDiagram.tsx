import React from 'react';
import { ArrowRight, Lock } from 'lucide-react';

export const StateFlowDiagram: React.FC = () => {
  return (
    <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-3.5 text-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Enforced State Machine Flow
        </span>
        <span className="text-[10px] text-slate-500 flex items-center gap-1">
          <Lock className="w-2.5 h-2.5" /> Atomic DB CAS Guarded
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        {/* Pending */}
        <div className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium">
          pending
        </div>

        <ArrowRight className="w-3.5 h-3.5 text-slate-600" />

        {/* Running */}
        <div className="px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-300 font-medium">
          running
        </div>

        <ArrowRight className="w-3.5 h-3.5 text-slate-600" />

        {/* Terminal Choices */}
        <div className="flex items-center gap-1.5">
          <div className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium">
            completed
          </div>
          <span className="text-slate-500 font-medium">or</span>
          <div className="px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-300 font-medium">
            failed
          </div>
        </div>

        <span className="text-[11px] text-slate-500 italic ml-auto hidden sm:inline">
          (Terminal: completed or failed cannot re-run)
        </span>
      </div>
    </div>
  );
};
