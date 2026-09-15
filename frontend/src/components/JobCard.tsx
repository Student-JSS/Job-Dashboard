import React, { useState } from 'react';
import type { Job, JobStatus } from '../types/job';
import { StatusBadge } from './StatusBadge';
import {
  Play,
  CheckCircle2,
  XCircle,
  Trash2,
  Copy,
  Check,
  Zap,
  Loader2,
  Calendar,
  Lock,
} from 'lucide-react';

interface JobCardProps {
  job: Job;
  onUpdateStatus: (id: string, status: JobStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSimulateRace: (id: string) => Promise<void>;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onUpdateStatus,
  onDelete,
  onSimulateRace,
}) => {
  const [copied, setCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(job.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleStatusClick = async (targetStatus: JobStatus) => {
    try {
      setActionLoading(targetStatus);
      await onUpdateStatus(job.id, targetStatus);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteClick = async () => {
    if (!window.confirm(`Delete job "${job.title}"?`)) return;
    try {
      setActionLoading('delete');
      await onDelete(job.id);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSimulateClick = async () => {
    try {
      setActionLoading('race');
      await onSimulateRace(job.id);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return {
        date: d.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        time: d.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      };
    } catch {
      return { date: dateStr, time: '' };
    }
  };

  const timeFormatted = formatDate(job.createdAt);
  const isTerminal = job.status === 'completed' || job.status === 'failed';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 hover:border-slate-700 transition-all shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        {/* Left: Info */}
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 inline-flex items-center gap-1">
              <span className="text-slate-500">ID:</span> {job.id.slice(0, 8)}...
              <button
                onClick={copyId}
                title="Copy Full ID"
                className="hover:text-white p-0.5 transition cursor-pointer"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400" />
                )}
              </button>
            </span>

            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950/50 text-indigo-300 border border-indigo-500/30">
              {job.type}
            </span>

            <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-800/60 text-slate-400 text-[10px]" title="Optimistic Version Counter">
              v{job.version}
            </span>
          </div>

          <h4 className="text-base font-semibold text-white truncate" title={job.title}>
            {job.title}
          </h4>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {timeFormatted.date} at {timeFormatted.time}
            </span>
          </div>
        </div>

        {/* Right: Status badge */}
        <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-2">
          <StatusBadge status={job.status} size="md" />
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        {/* State Transition Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {job.status === 'pending' && (
            <>
              <button
                onClick={() => handleStatusClick('running')}
                disabled={actionLoading !== null}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {actionLoading === 'running' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
                Start Running
              </button>

              <button
                onClick={handleSimulateClick}
                disabled={actionLoading !== null}
                title="Simulate 2 browser tabs hitting Start Running at the exact same millisecond"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition disabled:opacity-50 cursor-pointer"
              >
                {actionLoading === 'race' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                )}
                Simulate Race Condition
              </button>
            </>
          )}

          {job.status === 'running' && (
            <>
              <button
                onClick={() => handleStatusClick('completed')}
                disabled={actionLoading !== null}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {actionLoading === 'completed' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                Mark Completed
              </button>

              <button
                onClick={() => handleStatusClick('failed')}
                disabled={actionLoading !== null}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {actionLoading === 'failed' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <XCircle className="w-3.5 h-3.5" />
                )}
                Mark Failed
              </button>
            </>
          )}

          {isTerminal && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-400 bg-slate-950/60 rounded-md border border-slate-800 select-none">
              <Lock className="w-3 h-3 text-slate-500" />
              Terminal state — cannot be re-executed
            </div>
          )}
        </div>

        {/* Delete button */}
        <button
          onClick={handleDeleteClick}
          disabled={actionLoading !== null}
          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition disabled:opacity-50 cursor-pointer ml-auto"
          title="Delete Job"
        >
          {actionLoading === 'delete' ? (
            <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};
