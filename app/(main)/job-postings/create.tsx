/**
 * Create Job Posting Screen
 * Allows providers to create new job postings
 */
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native';
import { Appbar, Snackbar } from 'react-native-paper';
import { router } from 'expo-router';
import styled from 'styled-components/native';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import JobPostingForm from '@components/job-posting/JobPostingForm';
import jobPostingService, { JobPostingCreatePayload } from '@services/job-posting';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
`;

const Content = styled.ScrollView`
  flex: 1;
  padding: 16px;
`;

export default function CreateJobPostingScreen() {
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const queryClient = useQueryClient();

  // Create job posting mutation
  const createMutation = useMutation({
    mutationFn: (data: JobPostingCreatePayload) => jobPostingService.createJobPosting(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobPostings'] });
      setSnackbarMessage('Job posting created successfully');
      setSnackbarVisible(true);
      
      // Navigate back to job postings list after successful creation
      setTimeout(() => {
        router.push('/(main)/job-postings');
      }, 1500);
    },
    onError: (error: any) => {
      setSnackbarMessage(error.message || 'Failed to create job posting');
      setSnackbarVisible(true);
    },
  });

  const handleSubmit = async (data: JobPostingCreatePayload) => {
    await createMutation.mutateAsync(data);
  };

  return (
    <Container>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Create Job Posting" />
      </Appbar.Header>

      <Content>
        <JobPostingForm
          isLoading={createMutation.isPending}
          error={createMutation.error ? (createMutation.error as Error).message : null}
          onSubmit={handleSubmit}
        />
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
