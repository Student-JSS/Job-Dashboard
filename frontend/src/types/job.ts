export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface Job {
  id: string;
  title: string;
  type: string;
  status: JobStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobStats {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
}

export interface CreateJobInput {
  title: string;
  type: string;
}

export interface UpdateJobStatusInput {
  status: JobStatus;
  expectedStatus?: JobStatus;
  version?: number;
}

export interface SimulationResult {
  summary: string;
  jobId: string;
  requestA: {
    outcome: string;
    data?: any;
    error?: any;
  };
  requestB: {
    outcome: string;
    data?: any;
    error?: any;
  };
  finalJobState: Job;
}
