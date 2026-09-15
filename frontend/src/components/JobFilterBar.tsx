import React from 'react';
import type { JobStatus } from '../types/job';
import { Search, X } from 'lucide-react';

interface JobFilterBarProps {
  selectedStatus: JobStatus | 'all';
  onSelectStatus: (status: JobStatus | 'all') => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  totalFiltered: number;
}

const FILTER_TABS: Array<{ key: JobStatus | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'running', label: 'Running' },
  { key: 'completed', label: 'Completed' },
  { key: 'failed', label: 'Failed' },
];

export const JobFilterBar: React.FC<JobFilterBarProps> = ({
  selectedStatus,
  onSelectStatus,
  searchQuery,
  onSearchChange,
  totalFiltered,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 overflow-x-auto">
        {FILTER_TABS.map((tab) => {
          const isActive = selectedStatus === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onSelectStatus(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search Input and result count */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title or type..."
            className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <span className="text-xs text-slate-500 font-mono whitespace-nowrap">
          {totalFiltered} {totalFiltered === 1 ? 'job' : 'jobs'}
        </span>
      </div>
    </div>
  );
};
