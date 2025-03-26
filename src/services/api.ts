/**
 * API service for the Provider Frontend app
 * Handles communication with the Provider Backend
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

// Environment variables
const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:8000/api/v1';
const API_TIMEOUT = Number(Constants.expoConfig?.extra?.apiTimeout) || 30000;
const AUTH_TOKEN_KEY = Constants.expoConfig?.extra?.authTokenKey || 'auth_token';
const AUTH_REFRESH_TOKEN_KEY = Constants.expoConfig?.extra?.authRefreshTokenKey || 'refresh_token';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * API service class
 */
class ApiService {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Set up request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
        
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        
        // Handle 401 Unauthorized errors (token expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If already refreshing, wait for the new token
            return new Promise<string>((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                resolve(token);
              });
            }).then((token) => {
              return this.instance(originalRequest);
            });
          }

          // Start token refresh process
          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = await SecureStore.getItemAsync(AUTH_REFRESH_TOKEN_KEY);
            
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            // Call refresh token endpoint
            const response = await this.instance.post('/auth/refresh-token', {
              refresh_token: refreshToken,
            });

            const { access_token, refresh_token } = response.data;
            
            // Store new tokens
            await SecureStore.setItemAsync(AUTH_TOKEN_KEY, access_token);
            await SecureStore.setItemAsync(AUTH_REFRESH_TOKEN_KEY, refresh_token);

            // Update authorization header
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
            }

            // Notify subscribers about the new token
            this.refreshSubscribers.forEach((callback) => callback(access_token));
            this.refreshSubscribers = [];
            
            return this.instance(originalRequest);
          } catch (refreshError) {
            // If refresh fails, clear tokens and redirect to login
            await this.clearTokens();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle other errors
        const message = error.response?.data?.message || error.message || 'An error occurred';
        const status = error.response?.status || 500;
        const data = error.response?.data;
        
        return Promise.reject(new ApiError(message, status, data));
      }
    );
  }

  /**
   * Clear authentication tokens
   */
  public async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(AUTH_REFRESH_TOKEN_KEY);
  }

  /**
   * Check if user is authenticated
   */
  public async isAuthenticated(): Promise<boolean> {
    const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    return !!token;
  }

  /**
   * Store authentication tokens
   */
  public async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(AUTH_REFRESH_TOKEN_KEY, refreshToken);
  }

  /**
   * Make a GET request
   */
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.instance.get(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Make a POST request
   */
  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.instance.post(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Make a PUT request
   */
  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.instance.put(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Make a PATCH request
   */
  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.instance.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Make a DELETE request
   */
  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.instance.delete(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): never {
    if (error instanceof ApiError) {
      throw error;
    }
    
    const message = error.message || 'An error occurred';
    const status = error.response?.status || 500;
    const data = error.response?.data;
    
    throw new ApiError(message, status, data);
  }
}

// Export a singleton instance
export const apiService = new ApiService();

export default apiService;
