import React, { useState, useEffect } from 'react';
import type { CreateJobInput } from '../types/job';
import { X, Plus, Sparkles, Loader2 } from 'lucide-react';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: CreateJobInput) => Promise<void>;
}

const PRESET_TEMPLATES = [
  { title: 'Send Weekly Newsletter', type: 'email_digest' },
  { title: 'Generate Q3 Financial Report', type: 'report_pdf' },
  { title: 'Sync Stripe Payments', type: 'data_sync' },
  { title: 'Encode 4K Video Segment', type: 'video_transcode' },
  { title: 'Backup Postgres to S3', type: 'cloud_backup' },
];

export const CreateJobModal: React.FC<CreateJobModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Job title is required');
      return;
    }
    if (!type.trim()) {
      setError('Job type is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onCreate({ title: title.trim(), type: type.trim() });
      setTitle('');
      setType('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create job');
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyPreset = (preset: { title: string; type: string }) => {
    setTitle(preset.title);
    setType(preset.type);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#0f1422] border border-white/[0.1] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
          <div>
            <h3 className="text-sm font-semibold text-white">Create New Job</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Initial status will automatically be set to{' '}
              <span className="text-amber-400 font-mono">pending</span>.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.06] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-3.5 p-2.5 bg-rose-500/10 border border-rose-500/25 rounded-lg text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Presets */}
        <div className="mt-4">
          <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Quick Presets
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_TEMPLATES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(preset)}
                className="text-[11px] px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] hover:border-white/[0.18] transition cursor-pointer"
              >
                {preset.title}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Job Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Generate Monthly Financial Report"
              className="w-full px-3 py-2 rounded-lg bg-[#090d16] border border-white/[0.1] text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Job Type / Queue Key <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="e.g. report_generation, email_blast"
              className="w-full px-3 py-2 rounded-lg bg-[#090d16] border border-white/[0.1] text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.08] rounded-lg transition cursor-pointer border border-white/[0.08]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3.5 py-1.5 text-xs text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 rounded-lg font-medium flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.35)]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  Create Job
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
