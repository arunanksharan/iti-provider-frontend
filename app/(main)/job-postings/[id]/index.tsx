/**
 * Job Posting Detail Screen
 * Shows details of a specific job posting and allows actions like broadcasting
 */
import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Text, Card, Button, Chip, Divider, ActivityIndicator, Snackbar, Dialog, Portal } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MaterialIcons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import jobPostingService from '@services/job-posting';
import applicationService from '@services/application';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: #F5F5F5;
`;

const Content = styled(ScrollView)`
  flex: 1;
  padding: 16px;
`;

const HeaderCard = styled(Card)`
  margin-bottom: 16px;
`;

const HeaderCardContent = styled(Card.Content)`
  padding: 16px;
`;

const JobTitle = styled(Text)`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
`;

const JobDescription = styled(Text)`
  margin-bottom: 16px;
`;

const MetaContainer = styled(View)`
  margin-bottom: 16px;
`;

const MetaRow = styled(View)`
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
`;

const MetaLabel = styled(Text)`
  font-weight: bold;
  width: 120px;
`;

const MetaValue = styled(Text)`
  flex: 1;
`;

const StatusChip = styled(Chip)`
  align-self: flex-start;
  margin-bottom: 16px;
`;

const SectionCard = styled(Card)`
  margin-bottom: 16px;
`;

const SectionTitle = styled(Text)`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
`;

const ActionButtonsContainer = styled(View)`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-top: 16px;
  margin-bottom: 32px;
`;

const ActionButton = styled(Button)`
  margin-bottom: 8px;
  width: 48%;
`;

const LoadingContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 32px;
`;

const ErrorContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 32px;
`;

const ErrorText = styled(Text)`
  text-align: center;
  margin-bottom: 16px;
  font-size: 16px;
`;

export default function JobPostingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const jobId = parseInt(id as string);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [confirmDialogAction, setConfirmDialogAction] = useState<'broadcast' | 'withdraw' | 'delete'>('broadcast');
  const queryClient = useQueryClient();

  // Fetch job posting details
  const {
    data: jobPosting,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['jobPosting', jobId],
    queryFn: () => jobPostingService.getJobPosting(jobId),
    enabled: !!jobId,
  });

  // Fetch applications for this job posting
  const {
    data: applicationsData,
  } = useQuery({
    queryKey: ['applications', { jobPostingId: jobId }],
    queryFn: () => applicationService.getApplicationsByJobPosting(jobId),
    enabled: !!jobId,
  });

  // Broadcast job posting mutation
  const broadcastMutation = useMutation({
    mutationFn: () => jobPostingService.broadcastJobPosting(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobPosting', jobId] });
      setSnackbarMessage('Job posting broadcast successfully');
      setSnackbarVisible(true);
    },
    onError: (error: any) => {
      setSnackbarMessage(error.message || 'Failed to broadcast job posting');
      setSnackbarVisible(true);
    },
  });

  // Withdraw job posting mutation
  const withdrawMutation = useMutation({
    mutationFn: () => jobPostingService.withdrawJobPosting(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobPosting', jobId] });
      setSnackbarMessage('Job posting withdrawn successfully');
      setSnackbarVisible(true);
    },
    onError: (error: any) => {
      setSnackbarMessage(error.message || 'Failed to withdraw job posting');
      setSnackbarVisible(true);
    },
  });

  // Delete job posting mutation
  const deleteMutation = useMutation({
    mutationFn: () => jobPostingService.deleteJobPosting(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobPostings'] });
      setSnackbarMessage('Job posting deleted successfully');
      setSnackbarVisible(true);
      
      // Navigate back to job postings list after successful deletion
      setTimeout(() => {
        router.push('/(main)/job-postings');
      }, 1500);
    },
    onError: (error: any) => {
      setSnackbarMessage(error.message || 'Failed to delete job posting');
      setSnackbarVisible(true);
    },
  });

  const handleBroadcast = () => {
    setConfirmDialogAction('broadcast');
    setConfirmDialogVisible(true);
  };

  const handleWithdraw = () => {
    setConfirmDialogAction('withdraw');
    setConfirmDialogVisible(true);
  };

  const handleDelete = () => {
    setConfirmDialogAction('delete');
    setConfirmDialogVisible(true);
  };

  const confirmAction = () => {
    setConfirmDialogVisible(false);
    
    switch (confirmDialogAction) {
      case 'broadcast':
        broadcastMutation.mutate();
        break;
      case 'withdraw':
        withdrawMutation.mutate();
        break;
      case 'delete':
        deleteMutation.mutate();
        break;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return '#9E9E9E';
      case 'LIVE':
        return '#4CAF50';
      case 'CLOSED':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getBroadcastStatusText = (status: string) => {
    switch (status) {
      case 'NOT_BROADCAST':
        return 'Not Broadcast';
      case 'BROADCASTING':
        return 'Broadcasting...';
      case 'BROADCAST_SUCCESS':
        return 'Broadcast Success';
      case 'BROADCAST_FAILED':
        return 'Broadcast Failed';
      default:
        return 'Unknown';
    }
  };

  const getConfirmDialogContent = () => {
    switch (confirmDialogAction) {
      case 'broadcast':
        return {
          title: 'Broadcast Job Posting',
          content: 'Are you sure you want to broadcast this job posting to ONEST? This will make it available to job seekers.',
          confirmText: 'Broadcast',
        };
      case 'withdraw':
        return {
          title: 'Withdraw Job Posting',
          content: 'Are you sure you want to withdraw this job posting from ONEST? This will make it unavailable to job seekers.',
          confirmText: 'Withdraw',
        };
      case 'delete':
        return {
          title: 'Delete Job Posting',
          content: 'Are you sure you want to delete this job posting? This action cannot be undone.',
          confirmText: 'Delete',
        };
    }
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingContainer>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 16 }}>Loading job posting details...</Text>
        </LoadingContainer>
      </Container>
    );
  }

  if (error || !jobPosting) {
    return (
      <Container>
        <ErrorContainer>
          <MaterialIcons name="error-outline" size={48} color="#F44336" />
          <ErrorText>Failed to load job posting details.</ErrorText>
          <Button mode="contained" onPress={() => refetch()}>
            Retry
          </Button>
        </ErrorContainer>
      </Container>
    );
  }

  const dialogContent = getConfirmDialogContent();
  const applicationsCount = applicationsData?.total || 0;

  return (
    <Container>
      <Content>
        <HeaderCard>
          <HeaderCardContent>
            <JobTitle>{jobPosting.title}</JobTitle>
            <JobDescription>{jobPosting.short_description}</JobDescription>
            
            <StatusChip
              mode="flat"
              style={{ backgroundColor: getStatusColor(jobPosting.status) + '20' }}
              textStyle={{ color: getStatusColor(jobPosting.status) }}
            >
              {jobPosting.status}
            </StatusChip>
            
            <MetaContainer>
              <MetaRow>
                <MetaLabel>Role:</MetaLabel>
                <MetaValue>{jobPosting.role}</MetaValue>
              </MetaRow>
              
              <MetaRow>
                <MetaLabel>Domain:</MetaLabel>
                <MetaValue>{jobPosting.domain}</MetaValue>
              </MetaRow>
              
              <MetaRow>
                <MetaLabel>Location:</MetaLabel>
                <MetaValue>{jobPosting.location}</MetaValue>
              </MetaRow>
              
              <MetaRow>
                <MetaLabel>Salary Range:</MetaLabel>
                <MetaValue>
                  {jobPosting.salary_lower.toLocaleString()} - {jobPosting.salary_upper.toLocaleString()}
                </MetaValue>
              </MetaRow>
              
              <MetaRow>
                <MetaLabel>Employment Type:</MetaLabel>
                <MetaValue>{jobPosting.employment_type.replace('_', ' ')}</MetaValue>
              </MetaRow>
              
              <MetaRow>
                <MetaLabel>Duration:</MetaLabel>
                <MetaValue>{jobPosting.start_date} to {jobPosting.end_date}</MetaValue>
              </MetaRow>
              
              <MetaRow>
                <MetaLabel>Shift:</MetaLabel>
                <MetaValue>
                  {jobPosting.shift_start_time} - {jobPosting.shift_end_time} ({jobPosting.timezone})
                </MetaValue>
              </MetaRow>
              
              <MetaRow>
                <MetaLabel>Broadcast Status:</MetaLabel>
                <MetaValue>{getBroadcastStatusText(jobPosting.broadcast_status)}</MetaValue>
              </MetaRow>
              
              <MetaRow>
                <MetaLabel>Applications:</MetaLabel>
                <MetaValue>{applicationsCount}</MetaValue>
              </MetaRow>
            </MetaContainer>
          </HeaderCardContent>
        </HeaderCard>

        {jobPosting.long_description && (
          <SectionCard>
            <Card.Content>
              <SectionTitle>Description</SectionTitle>
              <Text>{jobPosting.long_description}</Text>
            </Card.Content>
          </SectionCard>
        )}

        {jobPosting.roles_responsibilities && (
          <SectionCard>
            <Card.Content>
              <SectionTitle>Roles & Responsibilities</SectionTitle>
              <Text>{jobPosting.roles_responsibilities}</Text>
            </Card.Content>
          </SectionCard>
        )}

        {jobPosting.requirements && (
          <SectionCard>
            <Card.Content>
              <SectionTitle>Requirements</SectionTitle>
              <Text>{jobPosting.requirements}</Text>
            </Card.Content>
          </SectionCard>
        )}

        {jobPosting.benefits && (
          <SectionCard>
            <Card.Content>
              <SectionTitle>Benefits</SectionTitle>
              <Text>{jobPosting.benefits}</Text>
            </Card.Content>
          </SectionCard>
        )}

        {jobPosting.cancellation_terms && (
          <SectionCard>
            <Card.Content>
              <SectionTitle>Cancellation Terms</SectionTitle>
              <Text>{jobPosting.cancellation_terms}</Text>
            </Card.Content>
          </SectionCard>
        )}

        <ActionButtonsContainer>
          {jobPosting.status === 'DRAFT' && (
            <ActionButton
              mode="contained"
              onPress={() => router.push(`/(main)/job-postings/${jobId}/edit`)}
              icon="pencil"
            >
              Edit
            </ActionButton>
          )}
          
          {jobPosting.status === 'DRAFT' && (
            <ActionButton
              mode="contained"
              onPress={handleBroadcast}
              icon="send"
              loading={broadcastMutation.isPending}
              disabled={broadcastMutation.isPending}
            >
              Broadcast
            </ActionButton>
          )}
          
          {jobPosting.status === 'LIVE' && (
            <ActionButton
              mode="contained"
              onPress={handleWithdraw}
              icon="close-circle"
              loading={withdrawMutation.isPending}
              disabled={withdrawMutation.isPending}
            >
              Withdraw
            </ActionButton>
          )}
          
          <ActionButton
            mode="outlined"
            onPress={() => router.push(`/(main)/job-postings/${jobId}/applications`)}
            icon="account-multiple"
          >
            Applications ({applicationsCount})
          </ActionButton>
          
          <ActionButton
            mode="outlined"
            onPress={handleDelete}
            icon="delete"
            loading={deleteMutation.isPending}
            disabled={deleteMutation.isPending}
            buttonColor="#F44336"
            textColor="#F44336"
          >
            Delete
          </ActionButton>
        </ActionButtonsContainer>
      </Content>

      <Portal>
        <Dialog visible={confirmDialogVisible} onDismiss={() => setConfirmDialogVisible(false)}>
          <Dialog.Title>{dialogContent?.title}</Dialog.Title>
          <Dialog.Content>
            <Text>{dialogContent?.content}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmDialogVisible(false)}>Cancel</Button>
            <Button onPress={confirmAction}>{dialogContent?.confirmText}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

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
