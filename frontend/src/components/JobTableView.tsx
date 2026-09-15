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

interface JobTableViewProps {
  jobs: Job[];
  onUpdateStatus: (id: string, status: JobStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSimulateRace: (id: string) => Promise<void>;
}

export const JobTableView: React.FC<JobTableViewProps> = ({
  jobs,
  onUpdateStatus,
  onDelete,
  onSimulateRace,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const copyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleStatusClick = async (id: string, targetStatus: JobStatus) => {
    try {
      setActionLoading(`${id}-${targetStatus}`);
      await onUpdateStatus(id, targetStatus);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteClick = async (job: Job) => {
    if (!window.confirm(`Delete job "${job.title}"?`)) return;
    try {
      setActionLoading(`${job.id}-delete`);
      await onDelete(job.id);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSimulateClick = async (id: string) => {
    try {
      setActionLoading(`${id}-race`);
      await onSimulateRace(id);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-[#0e1320]/80 shadow-[0_4px_20px_rgba(0,0,0,0.2)] backdrop-blur-md">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#121829]/90 border-b border-white/[0.08] text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
            <tr>
              <th className="py-2.5 px-4">Title / ID</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Version</th>
              <th className="py-2.5 px-3">Created</th>
              <th className="py-2.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {jobs.map((job) => {
              const isTerminal = job.status === 'completed' || job.status === 'failed';
              return (
                <tr
                  key={job.id}
                  className="hover:bg-[#141b2e]/60 transition-colors"
                >
                  {/* Title & ID */}
                  <td className="py-3 px-4 max-w-xs">
                    <div className="font-medium text-slate-200 truncate" title={job.title}>
                      {job.title}
                    </div>
                    <button
                      onClick={() => copyId(job.id)}
                      className="text-[10px] font-mono text-slate-400 hover:text-slate-300 inline-flex items-center gap-1 mt-0.5 cursor-pointer"
                      title="Copy full ID"
                    >
                      <span>{job.id.slice(0, 8)}...</span>
                      {copiedId === job.id ? (
                        <Check className="w-2.5 h-2.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-2.5 h-2.5 text-slate-400" />
                      )}
                    </button>
                  </td>

                  {/* Type */}
                  <td className="py-3 px-3">
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white/[0.04] text-indigo-300 border border-white/[0.08]">
                      {job.type}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <StatusBadge status={job.status} size="sm" />
                  </td>

                  {/* Version */}
                  <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                    v{job.version}
                  </td>

                  {/* Created At */}
                  <td className="py-3 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                    {formatDate(job.createdAt)}
                  </td>

                  {/* Action buttons */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {job.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusClick(job.id, 'running')}
                            disabled={actionLoading !== null}
                            className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium text-[11px] inline-flex items-center gap-1 transition cursor-pointer shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                          >
                            {actionLoading === `${job.id}-running` ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Play className="w-3 h-3 fill-current" />
                            )}
                            Start
                          </button>
                          <button
                            onClick={() => handleSimulateClick(job.id)}
                            disabled={actionLoading !== null}
                            title="Test concurrent status update"
                            className="px-2 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/25 text-[11px] inline-flex items-center gap-1 transition cursor-pointer"
                          >
                            {actionLoading === `${job.id}-race` ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Zap className="w-3 h-3 text-amber-400" />
                            )}
                            Race
                          </button>
                        </>
                      )}

                      {job.status === 'running' && (
                        <>
                          <button
                            onClick={() => handleStatusClick(job.id, 'completed')}
                            disabled={actionLoading !== null}
                            className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px] inline-flex items-center gap-1 transition cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                          >
                            {actionLoading === `${job.id}-completed` ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3" />
                            )}
                            Done
                          </button>
                          <button
                            onClick={() => handleStatusClick(job.id, 'failed')}
                            disabled={actionLoading !== null}
                            className="px-2.5 py-1 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-medium text-[11px] inline-flex items-center gap-1 transition cursor-pointer shadow-[0_0_10px_rgba(244,63,94,0.4)]"
                          >
                            {actionLoading === `${job.id}-failed` ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            Fail
                          </button>
                        </>
                      )}

                      {isTerminal && (
                        <span className="text-[11px] text-slate-400 inline-flex items-center gap-1 select-none pr-1">
                          <Lock className="w-3 h-3 text-slate-400" /> Locked
                        </span>
                      )}

                      <button
                        onClick={() => handleDeleteClick(job)}
                        disabled={actionLoading !== null}
                        className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition cursor-pointer"
                        title="Delete"
                      >
                        {actionLoading === `${job.id}-delete` ? (
                          <Loader2 className="w-3 h-3 animate-spin text-rose-400" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
