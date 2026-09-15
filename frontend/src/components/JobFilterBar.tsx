import React from 'react';
import type { JobStatus } from '../types/job';
import { Search, X, LayoutGrid, Table } from 'lucide-react';

interface JobFilterBarProps {
  selectedStatus: JobStatus | 'all';
  onSelectStatus: (status: JobStatus | 'all') => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  totalFiltered: number;
  viewMode: 'cards' | 'table';
  onViewModeChange: (mode: 'cards' | 'table') => void;
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
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
      {/* Status Segmented Tabs */}
      <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80 overflow-x-auto">
        {FILTER_TABS.map((tab) => {
          const isActive = selectedStatus === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onSelectStatus(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-slate-800 text-white shadow-sm font-semibold border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search Input, View Toggle, and Count */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 sm:w-60">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title or type..."
            className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* View Mode Toggle (Cards vs Table) */}
        <div className="hidden sm:flex items-center bg-slate-900/60 p-0.5 rounded-lg border border-slate-800/80">
          <button
            onClick={() => onViewModeChange('cards')}
            className={`p-1.5 rounded-md text-xs transition cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Card View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onViewModeChange('table')}
            className={`p-1.5 rounded-md text-xs transition cursor-pointer ${
              viewMode === 'table'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Table View"
          >
            <Table className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Count */}
        <span className="text-xs text-slate-500 font-mono whitespace-nowrap px-1">
          {totalFiltered} {totalFiltered === 1 ? 'job' : 'jobs'}
        </span>
      </div>
    </div>
  );
};
