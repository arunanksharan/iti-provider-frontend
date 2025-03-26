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

// Job posting endpoints
export const JOB_POSTING_ENDPOINTS = {
  LIST: `${API_URL}/job-postings`,
  DETAIL: (id: number) => `${API_URL}/job-postings/${id}`,
  CREATE: `${API_URL}/job-postings`,
  UPDATE: (id: number) => `${API_URL}/job-postings/${id}`,
  UPDATE_STATUS: (id: number) => `${API_URL}/job-postings/${id}/status`,
  BROADCAST: (id: number) => `${API_URL}/job-postings/${id}/broadcast`,
};

// Application endpoints
export const APPLICATION_ENDPOINTS = {
  LIST: `${API_URL}/applications`,
  DETAIL: (id: number) => `${API_URL}/applications/${id}`,
  UPDATE_STATUS: (id: number) => `${API_URL}/applications/${id}/status`,
  ADD_FEEDBACK: (id: number) => `${API_URL}/applications/${id}/feedback`,
  GET_FEEDBACK: (id: number) => `${API_URL}/applications/${id}/feedback`,
};

// Default request timeout in milliseconds
export const REQUEST_TIMEOUT = 10000;
