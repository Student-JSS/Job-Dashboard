import React, { useState } from 'react';
import { ArrowRight, Lock, ChevronDown, ChevronUp, Info } from 'lucide-react';

export const StateFlowDiagram: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-xl transition-all shadow-xs">
      <div className="p-3 sm:px-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="text-xs font-semibold text-gray-800">
            Lifecycle & State Transitions:
          </span>
          <div className="hidden md:flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-mono text-xs">
              pending
            </span>
            <ArrowRight className="w-3 h-3 text-gray-400" />
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-mono text-xs">
              running
            </span>
            <ArrowRight className="w-3 h-3 text-gray-400" />
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-xs">
              completed
            </span>
            <span className="text-gray-400 text-xs">or</span>
            <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-mono text-xs">
              failed
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-gray-600 hover:text-gray-900 inline-flex items-center gap-1 cursor-pointer select-none font-medium"
        >
          <span>{isExpanded ? 'Hide Rules' : 'View Rules'}</span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="px-4 pb-3.5 pt-2 border-t border-gray-100 text-xs text-gray-600 space-y-2 bg-gray-50/50 rounded-b-xl">
          <div className="flex flex-wrap items-center gap-2 pt-1 md:hidden">
            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-mono text-xs">
              pending
            </span>
            <ArrowRight className="w-3 h-3 text-gray-400" />
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-mono text-xs">
              running
            </span>
            <ArrowRight className="w-3 h-3 text-gray-400" />
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-xs">
              completed
            </span>
            <span className="text-gray-400 text-xs">or</span>
            <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-mono text-xs">
              failed
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
            <div className="flex items-start gap-1.5">
              <Lock className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
              <span>
                <strong className="text-gray-900">Terminal Protection:</strong> Completed and failed jobs cannot be restarted or updated.
              </span>
            </div>
            <div className="flex items-start gap-1.5">
              <Lock className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
              <span>
                <strong className="text-gray-900">Atomic CAS Guard:</strong> Two simultaneous requests result in 1 success (200) and 1 conflict (409).
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
