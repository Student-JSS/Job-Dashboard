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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-gray-200 rounded-2xl max-w-md w-full p-6 shadow-xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Create New Job</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Initial status will be set to{' '}
              <span className="text-amber-700 font-mono font-medium">pending</span>.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-3.5 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs">
            {error}
          </div>
        )}

        {/* Presets */}
        <div className="mt-4">
          <label className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Quick Presets
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_TEMPLATES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(preset)}
                className="text-xs px-2.5 py-1 rounded-md bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 transition cursor-pointer"
              >
                {preset.title}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Job Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Generate Monthly Financial Report"
              className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 text-xs focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition shadow-xs"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Job Type / Queue Key <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="e.g. report_generation, email_blast"
              className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 text-xs font-mono focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition shadow-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3.5 py-1.5 text-xs text-white bg-gray-900 hover:bg-black rounded-lg font-medium flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-xs"
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
