/**
 * Google authentication service for the Provider Frontend app
 * Handles Google Sign In and Sign Up
 */
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import apiService from './api';
import mockApiService from './mock-api';

// Environment variables
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

// Register the redirect URI for Expo AuthSession
WebBrowser.maybeCompleteAuthSession();

// Google OAuth configuration
const GOOGLE_CLIENT_ID = Constants.expoConfig?.extra?.googleClientId || '';
const GOOGLE_REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: 'provider-frontend',
  path: 'auth/google-callback',
});

// Discovery document for Google OAuth
const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export interface GoogleAuthResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
}

/**
 * Google authentication service
 */
class GoogleAuthService {
  private authRequest: AuthSession.AuthRequest | null = null;

  /**
   * Initialize Google authentication request
   */
  private initAuthRequest(): AuthSession.AuthRequest {
    if (!this.authRequest) {
      this.authRequest = new AuthSession.AuthRequest({
        clientId: GOOGLE_CLIENT_ID,
        scopes: ['openid', 'profile', 'email'],
        redirectUri: GOOGLE_REDIRECT_URI,
      });
    }
    return this.authRequest;
  }

  /**
   * Sign in with Google
   * @returns Authentication response with tokens
   */
  public async signIn(): Promise<GoogleAuthResponse> {
    try {
      const request = this.initAuthRequest();
      const result = await request.promptAsync(discovery);

      if (result.type !== 'success') {
        throw new Error('Google authentication was cancelled or failed');
      }

      // Use mock API in development mode for testing
      let response;
      if (IS_DEVELOPMENT) {
        response = await mockApiService.mockGoogleSignIn(result.params.code);
      } else {
        // Exchange the authorization code for tokens via our backend
        response = await apiService.post<GoogleAuthResponse>('/auth/google-signin', {
          code: result.params.code,
          redirect_uri: GOOGLE_REDIRECT_URI,
        });
      }

      // Store authentication tokens
      if (response.access_token) {
        await apiService.setTokens(
          response.access_token,
          response.refresh_token || response.access_token
        );
      }

      return response;
    } catch (error: any) {
      console.error('Google sign in error:', error);
      throw new Error(error.message || 'Failed to sign in with Google');
    }
  }

  /**
   * Sign up with Google
   * @returns Authentication response with tokens
   */
  public async signUp(): Promise<GoogleAuthResponse> {
    try {
      const request = this.initAuthRequest();
      const result = await request.promptAsync(discovery);

      if (result.type !== 'success') {
        throw new Error('Google authentication was cancelled or failed');
      }

      // Use mock API in development mode for testing
      let response;
      if (IS_DEVELOPMENT) {
        response = await mockApiService.mockGoogleSignUp(result.params.code);
      } else {
        // Exchange the authorization code for tokens via our backend
        response = await apiService.post<GoogleAuthResponse>('/auth/google-signup', {
          code: result.params.code,
          redirect_uri: GOOGLE_REDIRECT_URI,
        });
      }

      // Store authentication tokens
      if (response.access_token) {
        await apiService.setTokens(
          response.access_token,
          response.refresh_token || response.access_token
        );
      }

      return response;
    } catch (error: any) {
      console.error('Google sign up error:', error);
      throw new Error(error.message || 'Failed to sign up with Google');
    }
  }
}

// Export a singleton instance
export const googleAuthService = new GoogleAuthService();

export default googleAuthService;
