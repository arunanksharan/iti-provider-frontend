/**
 * Authentication context for the Provider Frontend app
 * Manages authentication state and provides auth-related functions
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import authService, { AuthResponse } from '../services/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  requestOTP: (email: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const authenticated = await authService.isAuthenticated();
        setIsAuthenticated(authenticated);
      } catch (err) {
        setError('Failed to check authentication status');
        console.error('Auth check error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const requestOTP = async (email: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.requestOTP(email);
    } catch (err: any) {
      setError(err.message || 'Failed to request OTP');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (email: string, otp: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.verifyOTP(email, otp);
      setIsAuthenticated(true);
      
      // Navigate to home screen after successful authentication
      router.replace('/');
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.logout();
      setIsAuthenticated(false);
      
      // Navigate to login screen after logout
      router.replace('/auth/login');
    } catch (err: any) {
      setError(err.message || 'Failed to logout');
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    error,
    requestOTP,
    verifyOTP,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
