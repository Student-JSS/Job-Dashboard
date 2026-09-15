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

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const isTerminal = job.status === 'completed' || job.status === 'failed';

  return (
    <div className="group relative bg-slate-900/40 hover:bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-4 transition-all duration-150 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        {/* Left Info */}
        <div className="space-y-2 min-w-0 flex-1">
          {/* Metadata badges row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* ID copy badge */}
            <button
              onClick={copyId}
              title="Click to copy full ID"
              className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/60 inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>{job.id.slice(0, 8)}...</span>
              {copied ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3 text-slate-500 group-hover:text-slate-400" />
              )}
            </button>

            {/* Type pill */}
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-950/40 text-indigo-300 border border-indigo-500/20">
              {job.type}
            </span>

            {/* Version */}
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/50 text-slate-500"
              title="Optimistic Concurrency Version"
            >
              v{job.version}
            </span>

            {/* Timestamp */}
            <span className="text-[11px] text-slate-500 ml-auto sm:ml-0 font-mono">
              {formatDate(job.createdAt)} at {formatTime(job.createdAt)}
            </span>
          </div>

          {/* Title */}
          <h4
            className="text-sm font-medium text-slate-100 group-hover:text-white transition-colors truncate"
            title={job.title}
          >
            {job.title}
          </h4>
        </div>

        {/* Right Status badge */}
        <div className="flex items-center sm:self-start">
          <StatusBadge status={job.status} size="sm" />
        </div>
      </div>

      {/* Actions footer */}
      <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
        {/* State actions */}
        <div className="flex items-center gap-2">
          {job.status === 'pending' && (
            <>
              <button
                onClick={() => handleStatusClick('running')}
                disabled={actionLoading !== null}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {actionLoading === 'running' ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Play className="w-3 h-3 fill-current" />
                )}
                Start
              </button>

              <button
                onClick={handleSimulateClick}
                disabled={actionLoading !== null}
                title="Simulate 2 browser tabs hitting Start Running at the exact same millisecond"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-800 text-amber-300 border border-amber-500/20 transition disabled:opacity-50 cursor-pointer"
              >
                {actionLoading === 'race' ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Zap className="w-3 h-3 text-amber-400" />
                )}
                Simulate Race
              </button>
            </>
          )}

          {job.status === 'running' && (
            <>
              <button
                onClick={() => handleStatusClick('completed')}
                disabled={actionLoading !== null}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {actionLoading === 'completed' ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3 h-3" />
                )}
                Complete
              </button>

              <button
                onClick={() => handleStatusClick('failed')}
                disabled={actionLoading !== null}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {actionLoading === 'failed' ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <XCircle className="w-3 h-3" />
                )}
                Fail
              </button>
            </>
          )}

          {isTerminal && (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 select-none">
              <Lock className="w-3 h-3" /> Terminal state
            </span>
          )}
        </div>

        {/* Delete action */}
        <button
          onClick={handleDeleteClick}
          disabled={actionLoading !== null}
          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition disabled:opacity-50 cursor-pointer"
          title="Delete Job"
        >
          {actionLoading === 'delete' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
};
