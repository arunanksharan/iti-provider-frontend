/**
 * Application service for the Provider Frontend app
 * Handles job application management operations
 */
import apiService from './api';

export interface JobApplication {
  id: number;
  job_posting_id: number;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  resume_url: string;
  cover_letter: string;
  status: 'PENDING' | 'REVIEWING' | 'SHORTLISTED' | 'REJECTED' | 'HIRED';
  additional_info: Record<string, any>;
  created_at: string;
  updated_at: string;
  experience_years?: number;
  education?: string;
  skills?: string[];
  expected_salary?: number;
  notice_period?: string;
  additional_documents?: Array<{url: string, name: string}>;
  feedback?: Array<{text: string, created_at: string}>;
}

export interface ApplicationQueryParams {
  job_posting_id?: number;
  status?: 'PENDING' | 'REVIEWING' | 'SHORTLISTED' | 'REJECTED' | 'HIRED';
  page?: number;
  limit?: number;
}

export interface ApplicationStatusUpdatePayload {
  status: 'PENDING' | 'REVIEWING' | 'SHORTLISTED' | 'REJECTED' | 'HIRED';
  notes?: string;
  feedback?: string;
}

export interface ApplicationListResponse {
  items: JobApplication[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface FeedbackItem {
  text: string;
  created_at: string;
}

/**
 * Application service
 */
class ApplicationService {
  /**
   * Get applications list
   * @param params Query parameters
   */
  public async getApplications(params?: ApplicationQueryParams): Promise<ApplicationListResponse> {
    return apiService.get<ApplicationListResponse>('/applications', { params });
  }

  /**
   * Get application by ID
   * @param id Application ID
   */
  public async getApplication(id: number): Promise<JobApplication> {
    return apiService.get<JobApplication>(`/applications/${id}`);
  }

  /**
   * Update application status
   * @param id Application ID
   * @param data Status update data
   */
  public async updateApplicationStatus(id: number, data: ApplicationStatusUpdatePayload): Promise<JobApplication> {
    return apiService.put<JobApplication>(`/applications/${id}/status`, data);
  }

  /**
   * Get applications for a specific job posting
   * @param jobPostingId Job posting ID
   * @param params Query parameters
   */
  public async getApplicationsByJobPosting(
    jobPostingId: number,
    params?: Omit<ApplicationQueryParams, 'job_posting_id'>
  ): Promise<ApplicationListResponse> {
    return apiService.get<ApplicationListResponse>(`/job-postings/${jobPostingId}/applications`, {
      params,
    });
  }

  /**
   * Download applications report
   * @param jobPostingId Job posting ID
   * @param format Report format ('excel' or 'pdf')
   */
  public async downloadApplicationsReport(
    jobPostingId: number,
    format: 'excel' | 'pdf'
  ): Promise<Blob> {
    return apiService.get<Blob>(`/job-postings/${jobPostingId}/applications/report`, {
      params: { format },
      responseType: 'blob',
    });
  }

  /**
   * Add feedback to an application
   * @param id Application ID
   * @param feedback Feedback text
   */
  public async addFeedback(id: number, feedback: string): Promise<JobApplication> {
    return apiService.put(`/applications/${id}/feedback`, { feedback });
  }

  /**
   * Get feedback for an application
   * @param id Application ID
   */
  public async getFeedback(id: number): Promise<FeedbackItem[]> {
    return apiService.get<FeedbackItem[]>(`/applications/${id}/feedback`);
  }
}

// Export a singleton instance
export const applicationService = new ApplicationService();

export default applicationService;
