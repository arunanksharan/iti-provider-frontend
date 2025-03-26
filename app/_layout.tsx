/**
 * Root layout for the Provider Frontend app
 * Sets up providers and global configuration
 */
import React, { useEffect } from 'react';
import { Slot, Stack, useRouter, useSegments } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@theme/ThemeProvider';
import { AuthProvider, useAuth } from '@store/auth-context';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Root layout component
export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <StatusBar style="auto" />
          <RootLayoutNav />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Root layout navigation component
function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Configure deep linking
  useEffect(() => {
    // Set up deep linking configuration
    const config = {
      screens: {
        '(auth)/google-callback': 'auth/google/callback',
      },
    };
    
    // Subscribe to deep links
    const subscription = Linking.addEventListener('url', ({ url }) => {
      // Handle the deep link
      console.log('Deep link received:', url);
    });
    
    return () => {
      // Clean up the subscription
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isAuthenticated && inAuthGroup && segments[1] !== 'google-callback') {
      // Redirect to home if authenticated and trying to access auth screens
      // (except the Google callback screen)
      router.replace('/');
    } else if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated and trying to access protected screens
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, segments, isLoading]);

  return <Slot />;
}
