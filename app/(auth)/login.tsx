/**
 * Login screen for the Provider Frontend app
 * Handles email input and OTP verification
 */
import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import styled from 'styled-components/native';
import { useAuth } from '../../app/store/auth-context';
import EmailInput from '../../app/components/auth/EmailInput';
import OTPVerification from '../../app/components/auth/OTPVerification';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
`;

const KeyboardView = styled(KeyboardAvoidingView)`
  flex: 1;
  justify-content: center;
  padding: 16px;
`;

const LogoContainer = styled.View`
  align-items: center;
  margin-bottom: 32px;
`;

const Logo = styled.Image`
  width: 120px;
  height: 120px;
  resize-mode: contain;
`;

const CardContainer = styled.View`
  background-color: ${props => props.theme.colors.surface};
  border-radius: 12px;
  padding: 16px;
  elevation: 4;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
`;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const { requestOTP } = useAuth();

  const handleEmailSubmit = async (submittedEmail: string) => {
    try {
      await requestOTP(submittedEmail);
      setEmail(submittedEmail);
      setStep('otp');
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  const handleResendOTP = async () => {
    try {
      await requestOTP(email);
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
  };

  return (
    <Container>
      <KeyboardView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LogoContainer>
          <Logo source={require('../../app/assets/logo.png')} />
        </LogoContainer>
        
        <CardContainer>
          {step === 'email' ? (
            <EmailInput onEmailSubmit={handleEmailSubmit} />
          ) : (
            <OTPVerification
              email={email}
              onResendOTP={handleResendOTP}
              onBackToEmail={handleBackToEmail}
            />
          )}
        </CardContainer>
      </KeyboardView>
    </Container>
  );
}
