/**
 * OTP verification component for authentication
 */
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { AUTH_ENDPOINTS } from '../../constants/api';

// Define the form schema using zod
const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
});

type OTPFormData = z.infer<typeof otpSchema>;

interface OTPVerificationProps {
  email: string;
  onSuccess: (token: string) => void;
  onError: (error: string) => void;
  onBack: () => void;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({ email, onSuccess, onError, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { control, handleSubmit, formState: { errors }, setValue } = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });

  useEffect(() => {
    // Start countdown for resend button
    setCountdown(60);
    startCountdown();

    return () => {
      // Clear timer on component unmount
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startCountdown = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);
  };

  const onSubmit = async (data: OTPFormData) => {
    setLoading(true);
    try {
      // Verify OTP with the backend
      const response = await axios.post(AUTH_ENDPOINTS.VERIFY_OTP, {
        email,
        otp: data.otp,
      });

      // Store token in secure storage
      const token = response.data.access_token;
      await SecureStore.setItemAsync('auth_token', token);
      
      // Call success callback
      onSuccess(token);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        onError(error.response.data.detail || 'Failed to verify OTP. Please try again.');
      } else {
        onError('Network error. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setResendLoading(true);
    try {
      // Request new OTP
      await axios.post(AUTH_ENDPOINTS.REQUEST_OTP, {
        email,
      });
      
      // Reset countdown
      setCountdown(60);
      startCountdown();
      
      // Clear OTP input
      setValue('otp', '');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Handle rate limiting error
        if (error.response.status === 429) {
          onError('Too many OTP requests. Please try again later.');
        } else {
          onError(error.response.data.detail || 'Failed to resend OTP. Please try again.');
        }
      } else {
        onError('Network error. Please check your connection and try again.');
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter verification code</Text>
      <Text style={styles.subtitle}>
        We've sent a 6-digit verification code to {email}
      </Text>
      
      <Controller
        control={control}
        name="otp"
        render={({ field: { onChange, value, onBlur } }) => (
          <TextInput
            style={[styles.input, errors.otp && styles.inputError]}
            placeholder="6-digit code"
            keyboardType="number-pad"
            maxLength={6}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            editable={!loading}
            autoFocus
          />
        )}
      />
      
      {errors.otp && (
        <Text style={styles.errorText}>{errors.otp.message}</Text>
      )}
      
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Verify</Text>
        )}
      </TouchableOpacity>
      
      <View style={styles.resendContainer}>
        <TouchableOpacity 
          onPress={handleResendOTP} 
          disabled={countdown > 0 || resendLoading}
        >
          <Text style={[
            styles.resendText, 
            (countdown > 0 || resendLoading) && styles.resendTextDisabled
          ]}>
            {resendLoading ? 'Sending...' : 'Resend code'}
            {countdown > 0 && ` (${countdown}s)`}
          </Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>Use a different email</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 8,
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  errorText: {
    color: '#ff3b30',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007aff',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#a0c4ff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  resendText: {
    color: '#007aff',
    fontSize: 16,
  },
  resendTextDisabled: {
    color: '#999',
  },
  backButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
  },
});

export default OTPVerification;
