import { useState, useEffect, useCallback } from 'react';
import type { Job, JobStats, JobStatus, SimulationResult } from './types/job';
import { api, ApiError } from './services/api';
import { Header } from './components/Header';
import { StatusCounters } from './components/StatusCounters';
import { JobFilterBar } from './components/JobFilterBar';
import { JobCard } from './components/JobCard';
import { JobTableView } from './components/JobTableView';
import { CreateJobModal } from './components/CreateJobModal';
import { RaceConditionModal } from './components/RaceConditionModal';
import {
  NotificationBanner,
  type NotificationMessage,
} from './components/NotificationBanner';
import { StateFlowDiagram } from './components/StateFlowDiagram';
import {
  Inbox,
  Plus,
  Loader2,
  Sparkles,
} from 'lucide-react';

export function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<JobStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  const [selectedStatus, setSelectedStatus] = useState<JobStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [raceResult, setRaceResult] = useState<SimulationResult | null>(null);
  const [notification, setNotification] = useState<NotificationMessage | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const showNotice = (
    type: NotificationMessage['type'],
    message: string,
    title?: string,
  ) => {
    setNotification({
      id: Math.random().toString(),
      type,
      title,
      message,
    });
  };

  // Fetch jobs & stats
  const loadData = useCallback(
    async (isSilent = false) => {
      try {
        if (!isSilent) setIsRefreshing(true);
        const [jobsData, statsData] = await Promise.all([
          api.getJobs(),
          api.getStats(),
        ]);
        setJobs(jobsData);
        setStats(statsData);
        setBackendOnline(true);
      } catch (err: any) {
        setBackendOnline(false);
        if (!isSilent) {
          showNotice(
            'error',
            err?.message || 'Could not connect to NestJS backend on http://localhost:3001',
            'Connection Error',
          );
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  // Auto-sync
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadData(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadData]);

  // Create job
  const handleCreateJob = async (input: { title: string; type: string }) => {
    try {
      const created = await api.createJob(input);
      showNotice(
        'success',
        `Job "${created.title}" added to queue in pending status.`,
        'Job Created',
      );
      await loadData(true);
    } catch (err: any) {
      showNotice('error', err?.message || 'Failed to create job');
      throw err;
    }
  };

  // Update status
  const handleUpdateStatus = async (id: string, targetStatus: JobStatus) => {
    try {
      const targetJob = jobs.find((j) => j.id === id);
      const updated = await api.updateJobStatus(id, {
        status: targetStatus,
        expectedStatus: targetJob?.status,
        version: targetJob?.version,
      });

      showNotice(
        'success',
        `Job "${updated.title}" moved to "${updated.status}".`,
        'Status Updated',
      );
      await loadData(true);
    } catch (err: any) {
      if (err instanceof ApiError && err.statusCode === 409) {
        showNotice(
          'conflict',
          err.message || 'Concurrency conflict detected. Refreshed with latest state.',
          'Atomic CAS Conflict (409)',
        );
      } else {
        showNotice('error', err?.message || 'Failed to update job status');
      }
      await loadData(true);
    }
  };

  // Delete job
  const handleDeleteJob = async (id: string) => {
    try {
      await api.deleteJob(id);
      showNotice('success', 'Job deleted successfully.', 'Job Removed');
      await loadData(true);
    } catch (err: any) {
      showNotice('error', err?.message || 'Failed to delete job');
    }
  };

  // Simulate race
  const handleSimulateRace = async (id: string) => {
    try {
      const result = await api.simulateRaceCondition(id);
      setRaceResult(result);
      await loadData(true);
    } catch (err: any) {
      showNotice('error', err?.message || 'Race simulation failed');
      await loadData(true);
    }
  };

  // Demo seeding
  const handleSeedDemoJobs = async () => {
    try {
      setIsRefreshing(true);
      const sampleJobs = [
        { title: 'Send Monthly Invoices', type: 'billing' },
        { title: 'Transcode 4K Video Segment', type: 'video_transcode' },
        { title: 'Backup Postgres Database to S3', type: 'cloud_backup' },
        { title: 'Generate User Engagement Summary', type: 'analytics' },
      ];

      for (const j of sampleJobs) {
        await api.createJob(j);
      }

      showNotice('success', 'Sample jobs created in queue!', 'Demo Seeded');
      await loadData(true);
    } catch (err: any) {
      showNotice('error', err?.message || 'Failed to seed sample jobs');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesStatus =
      selectedStatus === 'all' ? true : job.status === selectedStatus;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === '' ||
      job.title.toLowerCase().includes(query) ||
      job.type.toLowerCase().includes(query) ||
      job.id.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Header */}
      <Header
        backendOnline={backendOnline}
        onOpenCreate={() => setIsCreateOpen(true)}
        onRefresh={() => loadData(false)}
        isRefreshing={isRefreshing}
        autoRefresh={autoRefresh}
        onToggleAutoRefresh={() => setAutoRefresh((prev) => !prev)}
      />

      {/* Main Container */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-5 flex-1">
        {/* State Flow Diagram */}
        <StateFlowDiagram />

        {/* Metrics Overview Cards with top color stripes */}
        <StatusCounters
          stats={stats}
          selectedFilter={selectedStatus}
          onSelectFilter={(filter) => setSelectedStatus(filter)}
        />

        {/* Filter and Search Bar */}
        <JobFilterBar
          selectedStatus={selectedStatus}
          onSelectStatus={(status) => setSelectedStatus(status)}
          searchQuery={searchQuery}
          onSearchChange={(val) => setSearchQuery(val)}
          totalFiltered={filteredJobs.length}
          viewMode={viewMode}
          onViewModeChange={(mode) => setViewMode(mode)}
        />

        {/* Queue Display */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500 space-y-2">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-400" />
            <p className="text-xs font-mono">Loading queue items...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="py-14 px-4 text-center rounded-2xl border border-white/[0.08] bg-[#0e1320]/60 flex flex-col items-center justify-center space-y-3 backdrop-blur-xs shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">No jobs found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                {searchQuery || selectedStatus !== 'all'
                  ? 'No jobs match your filter criteria.'
                  : 'Your job queue is currently empty.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 rounded-lg transition cursor-pointer shadow-[0_0_12px_rgba(99,102,241,0.3)]"
              >
                <Plus className="w-3.5 h-3.5" />
                Create Job
              </button>

              {jobs.length === 0 && (
                <button
                  onClick={handleSeedDemoJobs}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Seed Demo Jobs
                </button>
              )}
            </div>
          </div>
        ) : viewMode === 'table' ? (
          <JobTableView
            jobs={filteredJobs}
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDeleteJob}
            onSimulateRace={handleSimulateRace}
          />
        ) : (
          <div className="grid grid-cols-1 gap-2.5">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onUpdateStatus={handleUpdateStatus}
                onDelete={handleDeleteJob}
                onSimulateRace={handleSimulateRace}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-[#090d16]/70 backdrop-blur-xs py-3.5 px-6 text-center text-xs text-slate-500">
        Mini Job Queue Dashboard • React + NestJS + SQLite with Atomic CAS Concurrency Control
      </footer>

      {/* Create Modal */}
      <CreateJobModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateJob}
      />

      {/* Race Inspector Modal */}
      <RaceConditionModal
        result={raceResult}
        onClose={() => setRaceResult(null)}
      />

      {/* Floating Notification Toast */}
      <NotificationBanner
        notification={notification}
        onDismiss={() => setNotification(null)}
      />
    </div>
  );
}

export default App;
