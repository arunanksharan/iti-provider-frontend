/**
 * Authentication layout for the Provider Frontend app
 * Handles authentication flow screens
 */
import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuth } from '../../app/store/auth-context';

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Skip redirect during initial loading
    if (isLoading) return;

    // If user is authenticated and trying to access auth screens, redirect to home
    if (isAuthenticated) {
      router.replace('/(main)');
    }
  }, [isAuthenticated, isLoading, segments, router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    />
  );
}
