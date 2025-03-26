/**
 * Authentication service for the Provider Frontend app
 * Handles login, OTP verification, and session management
 */
import apiService from './api';

export interface OTPRequestPayload {
  email: string;
}

export interface OTPVerifyPayload {
  email: string;
  otp: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Authentication service
 */
class AuthService {
  /**
   * Request OTP for login
   * @param email User's email address
   */
  public async requestOTP(email: string): Promise<void> {
    const payload: OTPRequestPayload = { email };
    await apiService.post('/auth/request-otp', payload);
  }

  /**
   * Verify OTP and get authentication tokens
   * @param email User's email address
   * @param otp One-time password
   */
  public async verifyOTP(email: string, otp: string): Promise<AuthResponse> {
    const payload: OTPVerifyPayload = { email, otp };
    const response = await apiService.post<AuthResponse>('/auth/verify-otp', payload);
    
    // Store authentication tokens
    if (response.access_token) {
      await apiService.setTokens(
        response.access_token,
        response.refresh_token || response.access_token
      );
    }
    
    return response;
  }

  /**
   * Check if user is authenticated
   */
  public async isAuthenticated(): Promise<boolean> {
    return apiService.isAuthenticated();
  }

  /**
   * Logout user
   */
  public async logout(): Promise<void> {
    try {
      // Call logout endpoint if available
      await apiService.post('/auth/logout');
    } catch (error) {
      // Ignore errors during logout
      console.error('Logout error:', error);
    } finally {
      // Clear tokens regardless of API call result
      await apiService.clearTokens();
    }
  }
}

// Export a singleton instance
export const authService = new AuthService();

export default authService;
