import { useState, useEffect, useCallback } from 'react';
import type { Job, JobStats, JobStatus, SimulationResult } from './types/job';
import { api, ApiError } from './services/api';
import { Header } from './components/Header';
import { StatusCounters } from './components/StatusCounters';
import { JobFilterBar } from './components/JobFilterBar';
import { JobCard } from './components/JobCard';
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

  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [raceResult, setRaceResult] = useState<SimulationResult | null>(null);
  const [notification, setNotification] = useState<NotificationMessage | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  // Show notification helper
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

  // Initial load
  useEffect(() => {
    loadData(false);
  }, [loadData]);

  // Polling / Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadData(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadData]);

  // Handlers
  const handleCreateJob = async (input: { title: string; type: string }) => {
    try {
      const created = await api.createJob(input);
      showNotice(
        'success',
        `Job "${created.title}" queued successfully in pending status.`,
        'Job Created',
      );
      await loadData(true);
    } catch (err: any) {
      showNotice('error', err?.message || 'Failed to create job');
      throw err;
    }
  };

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
        `Job "${updated.title}" transitioned to "${updated.status}".`,
        'Status Updated',
      );
      await loadData(true);
    } catch (err: any) {
      if (err instanceof ApiError && err.statusCode === 409) {
        showNotice(
          'conflict',
          err.message || 'Concurrency conflict detected. Refreshing latest state...',
          'Atomic CAS Conflict (409)',
        );
      } else {
        showNotice('error', err?.message || 'Failed to update job status');
      }
      await loadData(true);
    }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      await api.deleteJob(id);
      showNotice('success', 'Job was permanently removed from queue.', 'Job Deleted');
      await loadData(true);
    } catch (err: any) {
      showNotice('error', err?.message || 'Failed to delete job');
    }
  };

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

  const handleSeedDemoJobs = async () => {
    try {
      setIsRefreshing(true);
      const sampleJobs = [
        { title: 'Send Monthly Invoices', type: 'billing' },
        { title: 'Transcode 4K Video Segment', type: 'video_transcode' },
        { title: 'Backup Postgres Database to S3', type: 'backup' },
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

  // Filter jobs based on selectedStatus & searchQuery
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
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
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1">
        {/* Notification Banner */}
        <NotificationBanner
          notification={notification}
          onDismiss={() => setNotification(null)}
        />

        {/* State Flow Diagram */}
        <StateFlowDiagram />

        {/* Metrics Overview Cards */}
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
        />

        {/* Job Queue List */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm">Loading jobs from database...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="py-16 px-4 text-center rounded-2xl border border-slate-800/80 bg-slate-900/30 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-400">
              <Inbox className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">No jobs found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                {searchQuery || selectedStatus !== 'all'
                  ? 'No jobs match the current filters. Try changing your search query or status filter.'
                  : 'Your job queue is currently empty. Create a new job or seed some sample jobs to get started.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Create First Job
              </button>

              {jobs.length === 0 && (
                <button
                  onClick={handleSeedDemoJobs}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Seed Demo Jobs
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
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
      <footer className="border-t border-slate-900 py-4 px-6 text-center text-xs text-slate-500">
        Mini Job Queue Dashboard • React + NestJS + SQLite with Atomic CAS Concurrency Control
      </footer>

      {/* Create Job Modal */}
      <CreateJobModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateJob}
      />

      {/* Race Condition Inspector Modal */}
      <RaceConditionModal
        result={raceResult}
        onClose={() => setRaceResult(null)}
      />
    </div>
  );
}

export default App;
