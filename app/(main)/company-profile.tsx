/**
 * Company profile screen
 * Handles creating and updating company profiles
 */
import React, { useState } from 'react';
import { ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { Snackbar } from 'react-native-paper';
import styled from 'styled-components/native';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import CompanyProfileForm from '@components/company-profile/CompanyProfileForm';
import companyProfileService, {
  CompanyProfile,
  CompanyProfileCreatePayload,
  CompanyProfileUpdatePayload,
} from '@services/company-profile';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: #F5F5F5;
`;

const Content = styled.ScrollView`
  flex: 1;
  padding: 16px;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export default function CompanyProfileScreen() {
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const queryClient = useQueryClient();

  // Fetch company profile
  const {
    data: profile,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useQuery({
    queryKey: ['companyProfile'],
    queryFn: () => companyProfileService.getProfile(),
    retry: (failureCount: number, error: any) => {
      // If 404, it means profile doesn't exist yet, which is fine
      if (error.status === 404) return false;
      return failureCount < 3;
    }
  });

  // Create company profile mutation
  const createMutation = useMutation({
    mutationFn: (data: CompanyProfileCreatePayload) => companyProfileService.createProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyProfile'] });
      setSnackbarMessage('Company profile created successfully');
      setSnackbarVisible(true);
    },
    onError: (error: any) => {
      setSnackbarMessage(error.message || 'Failed to create company profile');
      setSnackbarVisible(true);
    },
  });

  // Update company profile mutation
  const updateMutation = useMutation({
    mutationFn: (data: CompanyProfileUpdatePayload) => companyProfileService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyProfile'] });
      setSnackbarMessage('Company profile updated successfully');
      setSnackbarVisible(true);
    },
    onError: (error: any) => {
      setSnackbarMessage(error.message || 'Failed to update company profile');
      setSnackbarVisible(true);
    },
  });

  // GSTIN verification mutation
  const verifyGSTINMutation = useMutation({
    mutationFn: (gstin: string) => companyProfileService.verifyGSTIN(gstin),
    onError: (error: any) => {
      setSnackbarMessage(error.message || 'Failed to verify GSTIN');
      setSnackbarVisible(true);
    },
  });

  const handleSubmit = async (data: CompanyProfileCreatePayload | CompanyProfileUpdatePayload) => {
    if (profile) {
      updateMutation.mutate(data as CompanyProfileUpdatePayload);
    } else {
      createMutation.mutate(data as CompanyProfileCreatePayload);
    }
  };

  const handleVerifyGSTIN = async (gstin: string) => {
    return verifyGSTINMutation.mutateAsync(gstin);
  };

  // Convert error object to string message for the form
  const errorMessage = profileError ? (profileError as Error).message : null;

  return (
    <Container>
      <Content>
        {isLoadingProfile ? (
          <LoadingContainer>
            <ActivityIndicator size="large" />
          </LoadingContainer>
        ) : (
          <CompanyProfileForm
            initialData={profile as CompanyProfile | undefined}
            isLoading={createMutation.isPending || updateMutation.isPending}
            error={errorMessage}
            onSubmit={handleSubmit}
            onVerifyGSTIN={handleVerifyGSTIN}
          />
        )}
      </Content>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </Container>
  );
}
