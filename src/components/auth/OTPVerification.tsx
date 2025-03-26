/**
 * OTP verification component for authentication
 */
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TextInput as RNTextInput } from 'react-native';
import { Button, Text, HelperText } from 'react-native-paper';
import styled from 'styled-components/native';
import { useAuth } from '../../store/auth-context';

const Container = styled.View`
  padding: 16px;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 24px;
  text-align: center;
`;

const Description = styled.Text`
  font-size: 16px;
  margin-bottom: 24px;
  text-align: center;
`;

const OTPContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const OTPInput = styled.TextInput`
  width: 48px;
  height: 56px;
  border-width: 1px;
  border-radius: 8px;
  text-align: center;
  font-size: 20px;
  margin-horizontal: 4px;
`;

const ResendContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  margin-top: 16px;
  margin-bottom: 24px;
`;

const ResendText = styled.Text`
  margin-right: 8px;
`;

const ResendButton = styled.TouchableOpacity``;

const ResendButtonText = styled.Text`
  color: ${props => props.theme.colors.primary};
  font-weight: bold;
`;

interface OTPVerificationProps {
  email: string;
  onResendOTP: () => void;
  onBackToEmail: () => void;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  email,
  onResendOTP,
  onBackToEmail,
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const { isLoading, error, verifyOTP } = useAuth();
  
  const inputRefs = useRef<Array<RNTextInput | null>>([]);

  // Set up countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [countdown]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleOtpChange = (text: string, index: number) => {
    if (text.length > 1) {
      text = text[0]; // Only take the first character
    }
    
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    
    // Clear error when user types
    if (otpError) setOtpError('');
    
    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOTP = () => {
    onResendOTP();
    setCountdown(300); // Reset countdown
  };

  const validateOTP = (): boolean => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setOtpError('Please enter the complete 6-digit OTP');
      return false;
    }
    if (!/^\d+$/.test(otpString)) {
      setOtpError('OTP should contain only digits');
      return false;
    }
    setOtpError('');
    return true;
  };

  const handleSubmit = async () => {
    if (validateOTP()) {
      try {
        await verifyOTP(email, otp.join(''));
      } catch (err) {
        // Error is handled by the auth context
      }
    }
  };

  return (
    <Container>
      <Title>Verify Your Email</Title>
      <Description>
        We've sent a 6-digit verification code to {email}
      </Description>

      <OTPContainer>
        {otp.map((digit, index) => (
          <OTPInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            value={digit}
            onChangeText={(text) => handleOtpChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            autoFocus={index === 0}
            style={{ borderColor: otpError ? '#F44336' : '#BDBDBD' }}
          />
        ))}
      </OTPContainer>

      {!!otpError && <HelperText type="error">{otpError}</HelperText>}
      {!!error && <HelperText type="error">{error}</HelperText>}

      <ResendContainer>
        <ResendText>
          {countdown > 0 ? `Resend code in ${formatTime(countdown)}` : "Didn't receive the code?"}
        </ResendText>
        {countdown <= 0 && (
          <ResendButton onPress={handleResendOTP} disabled={isLoading}>
            <ResendButtonText>Resend</ResendButtonText>
          </ResendButton>
        )}
      </ResendContainer>

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading || otp.join('').length !== 6}
      >
        Verify
      </Button>

      <Button
        mode="text"
        onPress={onBackToEmail}
        disabled={isLoading}
        style={{ marginTop: 16 }}
      >
        Change Email
      </Button>
    </Container>
  );
};

export default OTPVerification;
