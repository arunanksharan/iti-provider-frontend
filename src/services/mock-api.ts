/**
 * Mock API service for testing
 * Simulates backend API responses for development and testing
 */
import { AuthResponse } from './auth';
import { GoogleAuthResponse } from './google-auth';

// Delay to simulate network latency
const MOCK_DELAY = 1000;

/**
 * Mock API service
 */
class MockApiService {
  /**
   * Simulate a delay
   */
  private async delay(ms: number = MOCK_DELAY): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Mock Google sign in response
   */
  public async mockGoogleSignIn(code: string): Promise<GoogleAuthResponse> {
    await this.delay();
    
    // Simulate a successful response
    return {
      access_token: `mock_access_token_${Date.now()}`,
      token_type: 'Bearer',
      refresh_token: `mock_refresh_token_${Date.now()}`
    };
  }

  /**
   * Mock Google sign up response
   */
  public async mockGoogleSignUp(code: string): Promise<GoogleAuthResponse> {
    await this.delay();
    
    // Simulate a successful response
    return {
      access_token: `mock_access_token_${Date.now()}`,
      token_type: 'Bearer',
      refresh_token: `mock_refresh_token_${Date.now()}`
    };
  }

  /**
   * Mock OTP request response
   */
  public async mockRequestOTP(email: string): Promise<void> {
    await this.delay();
    
    // Simulate validation
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email address');
    }
    
    // Success (void)
    return;
  }

  /**
   * Mock OTP verification response
   */
  public async mockVerifyOTP(email: string, otp: string): Promise<AuthResponse> {
    await this.delay();
    
    // Simulate validation
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email address');
    }
    
    if (!otp || otp.length !== 6 || !/^\d+$/.test(otp)) {
      throw new Error('Invalid OTP format');
    }
    
    // Simulate a successful response
    return {
      access_token: `mock_access_token_${Date.now()}`,
      token_type: 'Bearer',
      refresh_token: `mock_refresh_token_${Date.now()}`
    };
  }
}

// Export a singleton instance
export const mockApiService = new MockApiService();

export default mockApiService;
