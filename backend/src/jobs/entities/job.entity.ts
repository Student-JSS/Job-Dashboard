export enum JobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export const ALLOWED_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  [JobStatus.PENDING]: [JobStatus.RUNNING],
  [JobStatus.RUNNING]: [JobStatus.COMPLETED, JobStatus.FAILED],
  [JobStatus.COMPLETED]: [],
  [JobStatus.FAILED]: [],
};

export function isValidTransition(from: JobStatus, to: JobStatus): boolean {
  const allowed = ALLOWED_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

export interface JobEntity {
  id: string;
  title: string;
  type: string;
  status: JobStatus;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}
