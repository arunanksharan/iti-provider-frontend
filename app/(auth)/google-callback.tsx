/**
 * Google authentication callback handler
 * Processes the OAuth callback from Google
 */
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import styled from 'styled-components/native';
import { useAuth } from '@store/auth-context';

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 16px;
  background-color: ${props => props.theme.colors?.background || '#F5F5F5'};
`;

const Message = styled.Text`
  font-size: 18px;
  margin-top: 16px;
  text-align: center;
`;

export default function GoogleCallbackScreen() {
  const params = useLocalSearchParams();
  const { googleSignIn, googleSignUp } = useAuth();
  
  useEffect(() => {
    // Process the callback parameters
    const processCallback = async () => {
      try {
        const token = params.token as string;
        const mode = params.mode as string;
        
        if (!token) {
          Alert.alert('Authentication Error', 'No authentication token received');
          router.replace('/(auth)/login');
          return;
        }
        
        // Handle the authentication based on the mode
        if (mode === 'signin') {
          await googleSignIn(token);
        } else if (mode === 'signup') {
          await googleSignUp(token);
        } else {
          // Default to sign in if mode is not specified
          await googleSignIn(token);
        }
        
        // The auth context will handle the navigation after successful authentication
      } catch (error: any) {
        Alert.alert('Authentication Error', error.message || 'Failed to complete authentication');
        router.replace('/(auth)/login');
      }
    };

    processCallback();
  }, [params]);

  return (
    <Container>
      <ActivityIndicator size="large" color="#1976D2" />
      <Message>Processing authentication, please wait...</Message>
    </Container>
  );
}
