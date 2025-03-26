/**
 * Job posting service for the Provider Frontend app
 * Handles job posting management operations
 */
import apiService from './api';

export interface JobPosting {
  id: number;
  title: string;
  short_description: string;
  long_description: string;
  role: string;
  domain: string;
  location: string;
  salary_lower: number;
  salary_upper: number;
  employment_type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'GIG';
  roles_responsibilities: string;
  requirements: string;
  benefits: string;
  start_date: string;
  end_date: string;
  shift_start_time: string;
  shift_end_time: string;
  timezone: string;
  additional_criteria: Record<string, any>;
  onest_metadata: Record<string, any>;
  cancellation_terms: string;
  status: 'DRAFT' | 'LIVE' | 'CLOSED';
  broadcast_status: 'NOT_BROADCAST' | 'BROADCASTING' | 'BROADCAST_SUCCESS' | 'BROADCAST_FAILED';
  created_at: string;
  updated_at: string;
}

export interface JobPostingCreatePayload {
  title: string;
  short_description: string;
  long_description: string;
  role: string;
  domain: string;
  location: string;
  salary_lower: number;
  salary_upper: number;
  employment_type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'GIG';
  roles_responsibilities: string;
  requirements: string;
  benefits: string;
  start_date: string;
  end_date: string;
  shift_start_time: string;
  shift_end_time: string;
  timezone: string;
  additional_criteria?: Record<string, any>;
  cancellation_terms: string;
}

export interface JobPostingUpdatePayload extends Partial<JobPostingCreatePayload> {}

export interface JobPostingQueryParams {
  status?: 'DRAFT' | 'LIVE' | 'CLOSED';
  page?: number;
  limit?: number;
}

export interface JobPostingListResponse {
  items: JobPosting[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * Job posting service
 */
class JobPostingService {
  /**
   * Get job postings list
   * @param params Query parameters
   */
  public async getJobPostings(params?: JobPostingQueryParams): Promise<JobPostingListResponse> {
    return apiService.get<JobPostingListResponse>('/job-postings', { params });
  }

  /**
   * Get job posting by ID
   * @param id Job posting ID
   */
  public async getJobPosting(id: number): Promise<JobPosting> {
    return apiService.get<JobPosting>(`/job-postings/${id}`);
  }

  /**
   * Create job posting
   * @param data Job posting data
   */
  public async createJobPosting(data: JobPostingCreatePayload): Promise<JobPosting> {
    return apiService.post<JobPosting>('/job-postings', data);
  }

  /**
   * Update job posting
   * @param id Job posting ID
   * @param data Job posting data to update
   */
  public async updateJobPosting(id: number, data: JobPostingUpdatePayload): Promise<JobPosting> {
    return apiService.put<JobPosting>(`/job-postings/${id}`, data);
  }

  /**
   * Delete job posting
   * @param id Job posting ID
   */
  public async deleteJobPosting(id: number): Promise<void> {
    await apiService.delete(`/job-postings/${id}`);
  }

  /**
   * Broadcast job posting to ONEST
   * @param id Job posting ID
   */
  public async broadcastJobPosting(id: number): Promise<{ success: boolean; message: string }> {
    return apiService.post<{ success: boolean; message: string }>(`/job-postings/${id}/broadcast`);
  }

  /**
   * Check broadcast status of job posting
   * @param id Job posting ID
   */
  public async checkBroadcastStatus(id: number): Promise<{ status: string; details?: any }> {
    return apiService.get<{ status: string; details?: any }>(`/job-postings/${id}/broadcast-status`);
  }

  /**
   * Withdraw job posting from ONEST
   * @param id Job posting ID
   */
  public async withdrawJobPosting(id: number): Promise<{ success: boolean; message: string }> {
    return apiService.post<{ success: boolean; message: string }>(`/job-postings/${id}/withdraw`);
  }
}

// Export a singleton instance
export const jobPostingService = new JobPostingService();

export default jobPostingService;
