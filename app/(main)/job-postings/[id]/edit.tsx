/**
 * Edit Job Posting Screen
 * Allows providers to edit existing job postings
 */
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native';
import { Appbar, Snackbar, ActivityIndicator, Text } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import styled from 'styled-components/native';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import JobPostingForm from '@components/job-posting/JobPostingForm';
import jobPostingService, { JobPostingUpdatePayload } from '@services/job-posting';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${props => props.theme.colors?.background || '#F5F5F5'};
`;

const Content = styled.ScrollView`
  flex: 1;
  padding: 16px;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 32px;
`;

const ErrorContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 32px;
`;

const ErrorText = styled(Text)`
  text-align: center;
  margin-bottom: 16px;
  font-size: 16px;
  color: ${props => props.theme.colors?.error || '#FF0000'};
`;

export default function EditJobPostingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const jobId = parseInt(id as string);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const queryClient = useQueryClient();

  // Fetch job posting details
  const {
    data: jobPosting,
    isLoading: isLoadingJobPosting,
    error: jobPostingError,
    refetch,
  } = useQuery({
    queryKey: ['jobPosting', jobId],
    queryFn: () => jobPostingService.getJobPosting(jobId),
    enabled: !!jobId,
  });

  // Update job posting mutation
  const updateMutation = useMutation({
    mutationFn: (data: JobPostingUpdatePayload) => jobPostingService.updateJobPosting(jobId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobPosting', jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobPostings'] });
      setSnackbarMessage('Job posting updated successfully');
      setSnackbarVisible(true);
      
      // Navigate back to job posting details after successful update
      setTimeout(() => {
        router.push(`/(main)/job-postings/${jobId}`);
      }, 1500);
    },
    onError: (error: any) => {
      setSnackbarMessage(error.message || 'Failed to update job posting');
      setSnackbarVisible(true);
    },
  });

  const handleSubmit = async (data: JobPostingUpdatePayload) => {
    await updateMutation.mutateAsync(data);
  };

  // Check if job posting is in DRAFT status
  const canEdit = jobPosting?.status === 'DRAFT';

  if (isLoadingJobPosting) {
    return (
      <Container>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Edit Job Posting" />
        </Appbar.Header>
        <LoadingContainer>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 16 }}>Loading job posting...</Text>
        </LoadingContainer>
      </Container>
    );
  }

  if (jobPostingError || !jobPosting) {
    return (
      <Container>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Edit Job Posting" />
        </Appbar.Header>
        <ErrorContainer>
          <ErrorText>
            {jobPostingError 
              ? `Error: ${(jobPostingError as Error).message}` 
              : 'Job posting not found'}
          </ErrorText>
          <Text style={{ marginBottom: 16 }}>Unable to load job posting details.</Text>
          <Appbar.Action icon="refresh" onPress={() => refetch()} />
        </ErrorContainer>
      </Container>
    );
  }

  if (!canEdit) {
    return (
      <Container>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Edit Job Posting" />
        </Appbar.Header>
        <ErrorContainer>
          <ErrorText>
            This job posting cannot be edited because it is not in DRAFT status.
          </ErrorText>
          <Text style={{ marginBottom: 16 }}>
            Only job postings in DRAFT status can be edited.
          </Text>
          <Appbar.Action 
            icon="arrow-left" 
            onPress={() => router.push(`/(main)/job-postings/${jobId}`)} 
          />
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Edit Job Posting" />
      </Appbar.Header>

      <Content>
        <JobPostingForm
          initialData={jobPosting}
          isLoading={updateMutation.isPending}
          error={updateMutation.error ? (updateMutation.error as Error).message : null}
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
