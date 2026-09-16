import type {
  CreateJobInput,
  Job,
  JobStats,
  JobStatus,
  SimulationResult,
  UpdateJobStatusInput,
} from '../types/job';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiError extends Error {
  statusCode: number;
  data?: any;

  constructor(message: string, statusCode: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  // Append cache buster to GET requests to guarantee fresh database state
  const isGet = !options?.method || options.method === 'GET';
  const separator = endpoint.includes('?') ? '&' : '?';
  const url = isGet
    ? `${API_BASE_URL}${endpoint}${separator}_t=${Date.now()}`
    : `${API_BASE_URL}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
        ...(options?.headers || {}),
      },
    });

    const isJson = res.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await res.json() : null;

    if (!res.ok) {
      const message =
        (Array.isArray(data?.message) ? data.message.join(', ') : data?.message) ||
        data?.error ||
        `Request failed with status ${res.status}`;
      throw new ApiError(message, res.status, data);
    }

    return data as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      err?.message || 'Network error: Failed to connect to server',
      0,
    );
  }
}

export const api = {
  async getJobs(status?: JobStatus, search?: string): Promise<Job[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);

    const query = params.toString() ? `?${params.toString()}` : '';
    return request<Job[]>(`/jobs${query}`);
  },

  async getStats(): Promise<JobStats> {
    return request<JobStats>('/jobs/stats');
  },

  async getJob(id: string): Promise<Job> {
    return request<Job>(`/jobs/${id}`);
  },

  async createJob(payload: CreateJobInput): Promise<Job> {
    return request<Job>('/jobs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateJobStatus(
    id: string,
    payload: UpdateJobStatusInput,
  ): Promise<Job> {
    return request<Job>(`/jobs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deleteJob(id: string): Promise<{ success: boolean; message: string; id: string }> {
    return request<{ success: boolean; message: string; id: string }>(`/jobs/${id}`, {
      method: 'DELETE',
    });
  },

  async simulateRaceCondition(id: string): Promise<SimulationResult> {
    return request<SimulationResult>(`/jobs/${id}/simulate-race`, {
      method: 'POST',
    });
  },

  async healthCheck(): Promise<any> {
    return request<any>('/');
  },
};

export { ApiError };
