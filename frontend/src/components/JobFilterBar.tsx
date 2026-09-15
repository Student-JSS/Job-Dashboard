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
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200 overflow-x-auto">
        {FILTER_TABS.map((tab) => {
          const isActive = selectedStatus === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onSelectStatus(tab.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-white text-gray-900 shadow-xs font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
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
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search title or type..."
            className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 text-xs focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="hidden sm:flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
          <button
            onClick={() => onViewModeChange('cards')}
            className={`p-1.5 rounded-md text-xs transition cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-white text-gray-900 shadow-xs font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            title="Card View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('table')}
            className={`p-1.5 rounded-md text-xs transition cursor-pointer ${
              viewMode === 'table'
                ? 'bg-white text-gray-900 shadow-xs font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            title="Table View"
          >
            <Table className="w-4 h-4" />
          </button>
        </div>

        {/* Count */}
        <span className="text-xs text-gray-500 font-mono whitespace-nowrap px-1">
          {totalFiltered} {totalFiltered === 1 ? 'job' : 'jobs'}
        </span>
      </div>
    </div>
  );
};
