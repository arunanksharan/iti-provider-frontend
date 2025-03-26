/**
 * Company profile service for the Provider Frontend app
 * Handles company profile management operations
 */
import apiService from './api';

export interface CompanyProfile {
  id: number;
  name: string;
  gstin: string;
  location: string;
  industry: string;
  business_type: string;
  owner_name: string;
  coordinator_name: string;
  labour_policies: string;
  working_hours: string;
  employee_count: number;
  leadership_details: string;
  email: string;
  phone: string;
  website: string;
  verified: boolean;
  onest_compliant: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanyProfileCreatePayload {
  name: string;
  gstin: string;
  location: string;
  industry: string;
  business_type: string;
  owner_name: string;
  coordinator_name: string;
  labour_policies: string;
  working_hours: string;
  employee_count: number;
  leadership_details: string;
  email: string;
  phone: string;
  website: string;
}

export interface CompanyProfileUpdatePayload extends Partial<CompanyProfileCreatePayload> {}

/**
 * Company profile service
 */
class CompanyProfileService {
  /**
   * Get company profile
   */
  public async getProfile(): Promise<CompanyProfile> {
    return apiService.get<CompanyProfile>('/company-profile');
  }

  /**
   * Create company profile
   * @param data Company profile data
   */
  public async createProfile(data: CompanyProfileCreatePayload): Promise<CompanyProfile> {
    return apiService.post<CompanyProfile>('/company-profile', data);
  }

  /**
   * Update company profile
   * @param data Company profile data to update
   */
  public async updateProfile(data: CompanyProfileUpdatePayload): Promise<CompanyProfile> {
    return apiService.put<CompanyProfile>('/company-profile', data);
  }

  /**
   * Verify GSTIN
   * @param gstin GSTIN number to verify
   */
  public async verifyGSTIN(gstin: string): Promise<{ valid: boolean; details?: any }> {
    return apiService.post<{ valid: boolean; details?: any }>('/company-profile/verify-gstin', { gstin });
  }
}

// Export a singleton instance
export const companyProfileService = new CompanyProfileService();

export default companyProfileService;
