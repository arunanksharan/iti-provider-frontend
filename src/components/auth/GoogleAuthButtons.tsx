/**
 * Google authentication buttons component
 * Provides Sign In with Google option and a Sign Up link
 */
import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import styled from 'styled-components/native';
import { useAuth } from '../../store/auth-context';
import Constants from 'expo-constants';

const Container = styled.View`
  margin-top: 24px;
`;

const Divider = styled.View`
  flex-direction: row;
  align-items: center;
  margin-vertical: 16px;
`;

const DividerLine = styled.View`
  flex: 1;
  height: 1px;
  background-color: #E0E0E0;
`;

const DividerText = styled.Text`
  margin-horizontal: 8px;
  color: #757575;
  font-size: 14px;
`;

const GoogleButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: #FFFFFF;
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 12px;
  border-width: 1px;
  border-color: #DADCE0;
`;

const GoogleIcon = styled.Image`
  width: 24px;
  height: 24px;
  margin-right: 12px;
`;

const ButtonText = styled.Text`
  font-size: 16px;
  color: #3C4043;
  font-weight: 500;
`;

const SignUpContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: 16px;
`;

const SignUpText = styled.Text`
  font-size: 14px;
  color: #757575;
`;

const SignUpLink = styled.Text`
  font-size: 14px;
  color: #1976D2;
  font-weight: 500;
  margin-left: 4px;
`;

// Backend API base URL
const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:8000/api/v1';

interface GoogleAuthButtonsProps {
  mode?: 'signin' | 'signup' | 'both';
}

const GoogleAuthButtons: React.FC<GoogleAuthButtonsProps> = ({ mode = 'both' }) => {
  const { isLoading } = useAuth();
  const [localLoading, setLocalLoading] = useState<{signin: boolean, signup: boolean}>({
    signin: false,
    signup: false
  });
  const [isSignUp, setIsSignUp] = useState(false);

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    try {
      setLocalLoading(prev => ({ ...prev, signin: true }));
      
      // Open the backend's Google auth URL in the device browser
      const authUrl = `${API_BASE_URL}/auth/google/signin?redirect_uri=${encodeURIComponent('provider-frontend://auth/google/callback?mode=signin')}`;
      const supported = await Linking.canOpenURL(authUrl);
      
      if (supported) {
        // Open the authentication URL
        await Linking.openURL(authUrl);
      } else {
        Alert.alert('Error', 'Cannot open the authentication page');
      }
    } catch (error: any) {
      Alert.alert('Authentication Error', error.message || 'Failed to sign in with Google');
    } finally {
      setLocalLoading(prev => ({ ...prev, signin: false }));
    }
  };

  // Handle Google Sign Up
  const handleGoogleSignUp = async () => {
    try {
      setLocalLoading(prev => ({ ...prev, signup: true }));
      
      // Open the backend's Google auth URL in the device browser
      const authUrl = `${API_BASE_URL}/auth/google/signup?redirect_uri=${encodeURIComponent('provider-frontend://auth/google/callback?mode=signup')}`;
      const supported = await Linking.canOpenURL(authUrl);
      
      if (supported) {
        // Open the authentication URL
        await Linking.openURL(authUrl);
      } else {
        Alert.alert('Error', 'Cannot open the authentication page');
      }
    } catch (error: any) {
      Alert.alert('Authentication Error', error.message || 'Failed to sign up with Google');
    } finally {
      setLocalLoading(prev => ({ ...prev, signup: false }));
    }
  };

  // Toggle between sign in and sign up
  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
  };

  // Handle authentication based on current mode
  const handleAuthentication = () => {
    if (isSignUp) {
      handleGoogleSignUp();
    } else {
      handleGoogleSignIn();
    }
  };

  return (
    <Container>
      <Divider>
        <DividerLine />
        <DividerText>or</DividerText>
        <DividerLine />
      </Divider>

      <GoogleButton 
        onPress={handleAuthentication}
        disabled={isLoading || localLoading.signin || localLoading.signup}
      >
        {(localLoading.signin || localLoading.signup) ? (
          <ActivityIndicator size="small" color="#4285F4" style={{ marginRight: 12 }} />
        ) : (
          <GoogleIcon source={require('../../../assets/google-icon.png')} />
        )}
        <ButtonText>{isSignUp ? 'Sign up with Google' : 'Sign in with Google'}</ButtonText>
      </GoogleButton>

      <SignUpContainer>
        <SignUpText>{isSignUp ? 'Already have an account?' : 'Don\'t have an account?'}</SignUpText>
        <TouchableOpacity onPress={toggleSignUp}>
          <SignUpLink>{isSignUp ? 'Sign in' : 'Sign up'}</SignUpLink>
        </TouchableOpacity>
      </SignUpContainer>
    </Container>
  );
};

export default GoogleAuthButtons;
