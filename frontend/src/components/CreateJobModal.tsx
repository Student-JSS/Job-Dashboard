import React, { useState } from 'react';
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
  { title: 'Encode High-Res Video', type: 'video_transcode' },
  { title: 'Optimize Product Images', type: 'image_processing' },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-semibold text-white">Create New Job</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              New jobs are added to the queue in <span className="text-amber-400 font-mono">pending</span> status.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Quick Presets */}
        <div className="mt-4">
          <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Quick Presets
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_TEMPLATES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(preset)}
                className="text-xs px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600 transition cursor-pointer"
              >
                {preset.title}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Job Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Generate Monthly Sales Report"
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
              placeholder="e.g. report_generation, email_blast, video_transcode"
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
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
