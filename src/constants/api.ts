/**
 * API constants for the provider frontend
 */

// Base API URL - should be configured based on environment
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Auth endpoints
export const AUTH_ENDPOINTS = {
  REQUEST_OTP: `${API_URL}/auth/request-otp`,
  VERIFY_OTP: `${API_URL}/auth/verify-otp`,
  LOGIN: `${API_URL}/auth/login`,
  GOOGLE_AUTH: `${API_URL}/auth/google`,
};

// Provider endpoints
export const PROVIDER_ENDPOINTS = {
  PROFILE: `${API_URL}/providers/me`,
  UPDATE_PROFILE: `${API_URL}/providers/me`,
};

// Default request timeout in milliseconds
export const REQUEST_TIMEOUT = 10000;
