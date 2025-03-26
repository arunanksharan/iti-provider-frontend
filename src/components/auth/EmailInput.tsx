/**
 * Email input component for authentication
 */
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
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

const InputContainer = styled.View`
  margin-bottom: 24px;
`;

interface EmailInputProps {
  onEmailSubmit: (email: string) => void;
}

export const EmailInput: React.FC<EmailInputProps> = ({ onEmailSubmit }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const { isLoading, error, clearError } = useAuth();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = () => {
    clearError();
    if (validateEmail(email)) {
      onEmailSubmit(email);
    }
  };

  return (
    <Container>
      <Title>Welcome to Provider Portal</Title>
      <Description>
        Enter your email address to receive a one-time password for login
      </Description>

      <InputContainer>
        <TextInput
          label="Email Address"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (emailError) validateEmail(text);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={!!emailError}
          disabled={isLoading}
        />
        {!!emailError && <HelperText type="error">{emailError}</HelperText>}
        {!!error && <HelperText type="error">{error}</HelperText>}
      </InputContainer>

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading}
      >
        Continue
      </Button>
    </Container>
  );
};

export default EmailInput;
