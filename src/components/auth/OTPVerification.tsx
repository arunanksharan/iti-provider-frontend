/**
 * OTP verification component for authentication
 */
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TextInput as RNTextInput, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';
import { Text, Button, HelperText } from 'react-native-paper';
import styled from 'styled-components/native';
import authService from '../../services/auth';

const Container = styled.View`
  padding: 16px;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
`;

const Description = styled.Text`
  font-size: 16px;
  color: #757575;
  margin-bottom: 24px;
`;

const OTPContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const OTPInput = styled(RNTextInput)`
  width: 48px;
  height: 48px;
  border-width: 1px;
  border-radius: 8px;
  text-align: center;
  font-size: 20px;
  margin-horizontal: 4px;
`;

const ResendContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 16px;
  margin-bottom: 24px;
`;

const ResendText = styled.Text`
  font-size: 14px;
  color: #757575;
`;

const ResendButton = styled.TouchableOpacity`
  margin-left: 8px;
`;

const ResendButtonText = styled.Text`
  font-size: 14px;
  color: #1976D2;
  font-weight: bold;
`;

const ButtonContainer = styled.View`
  margin-top: 16px;
`;

const BackButton = styled.TouchableOpacity`
  margin-top: 16px;
  align-self: center;
`;

const BackButtonText = styled.Text`
  font-size: 14px;
  color: #757575;
  text-decoration: underline;
`;

interface OTPVerificationProps {
  email: string;
  onResendOTP: () => void;
  onBackToEmail: () => void;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({
  email,
  onResendOTP,
  onBackToEmail,
}) => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [otpError, setOtpError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(30);
  const inputRefs = useRef<(RNTextInput | null)[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (text: string, index: number) => {
    if (text.length > 1) {
      // Only take the first character if multiple are pasted
      text = text.charAt(0);
    }

    // Validate input is a number
    if (text && !/^\d+$/.test(text)) {
      return;
    }

    setOtpError('');
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if OTP is complete
    if (newOtp.every((digit) => digit !== '') && newOtp.join('').length === 6) {
      verifyOTP(newOtp.join(''));
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOTP = () => {
    if (countdown === 0) {
      onResendOTP();
      setCountdown(30);
    }
  };

  const verifyOTP = async (code: string) => {
    try {
      setIsLoading(true);
      setError('');
      await authService.verifyOTP(email, code);
      // OTP verification successful - handled by parent component
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
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
            ref={(ref: RNTextInput | null) => (inputRefs.current[index] = ref)}
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
        {countdown === 0 && (
          <ResendButton onPress={handleResendOTP}>
            <ResendButtonText>Resend</ResendButtonText>
          </ResendButton>
        )}
      </ResendContainer>

      <ButtonContainer>
        <Button
          mode="contained"
          onPress={() => verifyOTP(otp.join(''))}
          loading={isLoading}
          disabled={isLoading || otp.join('').length !== 6}
        >
          Verify
        </Button>
      </ButtonContainer>

      <BackButton onPress={onBackToEmail}>
        <BackButtonText>Back to Email</BackButtonText>
      </BackButton>
    </Container>
  );
};

export default OTPVerification;
