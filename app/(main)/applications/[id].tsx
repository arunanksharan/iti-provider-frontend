/**
 * Application Detail Screen
 * Shows details of a specific job application and allows status updates
 */
import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Linking } from 'react-native';
import { Text, Card, Button, Chip, Divider, ActivityIndicator, Snackbar, Dialog, Portal, List, TextInput } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MaterialIcons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import applicationService, { ApplicationStatusUpdatePayload } from '@services/application';
import jobPostingService from '@services/job-posting';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
`;

const Content = styled.ScrollView`
  flex: 1;
  padding: 16px;
`;

const HeaderCard = styled(Card)`
  margin-bottom: 16px;
`;

const HeaderCardContent = styled(Card.Content)`
  padding: 16px;
`;

const ApplicantName = styled(Text)`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
`;

const JobTitle = styled(Text)`
  font-size: 18px;
  margin-bottom: 16px;
`;

const StatusChip = styled(Chip)`
  align-self: flex-start;
  margin-bottom: 16px;
`;

const MetaContainer = styled.View`
  margin-bottom: 16px;
`;

const MetaRow = styled.View`
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

const SectionCard = styled(Card)`
  margin-bottom: 16px;
`;

const SectionTitle = styled(Text)`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
`;

const ActionButtonsContainer = styled.View`
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
`;

const DocumentLink = styled(Button)`
  margin-bottom: 8px;
`;

export default function ApplicationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const applicationId = parseInt(id as string);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [statusDialogVisible, setStatusDialogVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [feedbackDialogVisible, setFeedbackDialogVisible] = useState(false);
  const [feedback, setFeedback] = useState('');
  const queryClient = useQueryClient();

  // Fetch application details
  const {
    data: application,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['application', applicationId],
    queryFn: () => applicationService.getApplication(applicationId),
    enabled: !!applicationId,
  });

  // Fetch job posting details
  const {
    data: jobPosting,
  } = useQuery({
    queryKey: ['jobPosting', application?.job_posting_id],
    queryFn: () => jobPostingService.getJobPosting(application!.job_posting_id),
    enabled: !!application?.job_posting_id,
  });

  // Update application status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (data: ApplicationStatusUpdatePayload) => 
      applicationService.updateApplicationStatus(applicationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setSnackbarMessage('Application status updated successfully');
      setSnackbarVisible(true);
    },
    onError: (error: any) => {
      setSnackbarMessage(error.message || 'Failed to update application status');
      setSnackbarVisible(true);
    },
  });

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setStatusDialogVisible(true);
  };

  const confirmStatusChange = () => {
    if (!selectedStatus) return;
    
    updateStatusMutation.mutate({
      status: selectedStatus as any,
      feedback: feedback || undefined,
    });
    
    setStatusDialogVisible(false);
    setFeedbackDialogVisible(false);
    setFeedback('');
  };

  const handleStatusDialogConfirm = () => {
    if (['SHORTLISTED', 'REJECTED', 'HIRED'].includes(selectedStatus || '')) {
      setStatusDialogVisible(false);
      setFeedbackDialogVisible(true);
    } else {
      confirmStatusChange();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '#FFC107';
      case 'REVIEWING':
        return '#2196F3';
      case 'SHORTLISTED':
        return '#4CAF50';
      case 'REJECTED':
        return '#F44336';
      case 'HIRED':
        return '#9C27B0';
      default:
        return '#9E9E9E';
    }
  };

  const handleOpenDocument = (url: string) => {
    Linking.openURL(url);
  };

  const handleDownloadResume = () => {
    if (application?.resume_url) {
      Linking.openURL(application.resume_url);
    }
  };

  const handleContactApplicant = () => {
    if (application?.applicant_email) {
      Linking.openURL(`mailto:${application.applicant_email}`);
    }
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingContainer>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 16 }}>Loading application details...</Text>
        </LoadingContainer>
      </Container>
    );
  }

  if (error || !application) {
    return (
      <Container>
        <ErrorContainer>
          <MaterialIcons name="error-outline" size={48} color="#F44336" />
          <ErrorText>Failed to load application details.</ErrorText>
          <Button mode="contained" onPress={() => refetch()}>
            Retry
          </Button>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Content>
        <HeaderCard>
          <HeaderCardContent>
            <ApplicantName>{application.applicant_name}</ApplicantName>
            <JobTitle>{jobPosting?.title || 'Loading job title...'}</JobTitle>
            
            <StatusChip
              mode="flat"
              style={{ backgroundColor: getStatusColor(application.status) + '20' }}
              textStyle={{ color: getStatusColor(application.status) }}
            >
              {application.status}
            </StatusChip>
            
            <MetaContainer>
              <MetaRow>
                <MetaLabel>Email:</MetaLabel>
                <MetaValue>{application.applicant_email}</MetaValue>
              </MetaRow>
              
              <MetaRow>
                <MetaLabel>Phone:</MetaLabel>
                <MetaValue>{application.applicant_phone}</MetaValue>
              </MetaRow>
              
              <MetaRow>
                <MetaLabel>Applied On:</MetaLabel>
                <MetaValue>
                  {new Date(application.created_at).toLocaleDateString()}
                </MetaValue>
              </MetaRow>
              
              <MetaRow>
                <MetaLabel>Experience:</MetaLabel>
                <MetaValue>{application.experience_years} years</MetaValue>
              </MetaRow>
              
              <MetaRow>
                <MetaLabel>Education:</MetaLabel>
                <MetaValue>{application.education}</MetaValue>
              </MetaRow>
              
              <MetaRow>
                <MetaLabel>Skills:</MetaLabel>
                <MetaValue>{application.skills?.join(', ') || 'N/A'}</MetaValue>
              </MetaRow>
              
              <MetaRow>
                <MetaLabel>Expected Salary:</MetaLabel>
                <MetaValue>₹{application.expected_salary ? application.expected_salary.toLocaleString() : 'N/A'}</MetaValue>
              </MetaRow>
              
              <MetaRow>
                <MetaLabel>Notice Period:</MetaLabel>
                <MetaValue>{application.notice_period || 'N/A'} {application.notice_period ? 'days' : ''}</MetaValue>
              </MetaRow>
            </MetaContainer>
          </HeaderCardContent>
        </HeaderCard>

        {application.cover_letter && (
          <SectionCard>
            <Card.Content>
              <SectionTitle>Cover Letter</SectionTitle>
              <Text>{application.cover_letter}</Text>
            </Card.Content>
          </SectionCard>
        )}

        <SectionCard>
          <Card.Content>
            <SectionTitle>Documents</SectionTitle>
            <DocumentLink
              mode="outlined"
              icon="file-pdf-box"
              onPress={handleDownloadResume}
            >
              Resume
            </DocumentLink>
            
            {application.additional_documents?.map((doc, index) => (
              <DocumentLink
                key={index}
                mode="outlined"
                icon="file-document-outline"
                onPress={() => handleOpenDocument(doc.url)}
              >
                {doc.name}
              </DocumentLink>
            ))}
          </Card.Content>
        </SectionCard>

        {application.feedback && (
          <SectionCard>
            <Card.Content>
              <SectionTitle>Feedback</SectionTitle>
              <Text>{application.feedback}</Text>
            </Card.Content>
          </SectionCard>
        )}

        <ActionButtonsContainer>
          <ActionButton
            mode="contained"
            onPress={handleContactApplicant}
            icon="email"
          >
            Contact
          </ActionButton>
          
          <ActionButton
            mode="outlined"
            onPress={() => router.push(`/(main)/job-postings/${application.job_posting_id}`)}
            icon="briefcase"
          >
            View Job
          </ActionButton>
          
          <Button
            mode="contained"
            style={{ width: '100%', marginBottom: 8 }}
            onPress={() => setStatusDialogVisible(true)}
            loading={updateStatusMutation.isPending}
            disabled={updateStatusMutation.isPending}
          >
            Update Status
          </Button>
        </ActionButtonsContainer>
      </Content>

      <Portal>
        <Dialog visible={statusDialogVisible} onDismiss={() => setStatusDialogVisible(false)}>
          <Dialog.Title>Update Application Status</Dialog.Title>
          <Dialog.Content>
            <List.Section>
              <List.Item
                title="Pending"
                description="Application received but not reviewed yet"
                left={props => <List.Icon {...props} icon="clock-outline" color={getStatusColor('PENDING')} />}
                onPress={() => handleStatusChange('PENDING')}
              />
              <List.Item
                title="Reviewing"
                description="Application is being reviewed"
                left={props => <List.Icon {...props} icon="eye-outline" color={getStatusColor('REVIEWING')} />}
                onPress={() => handleStatusChange('REVIEWING')}
              />
              <List.Item
                title="Shortlisted"
                description="Candidate has been shortlisted"
                left={props => <List.Icon {...props} icon="check-circle-outline" color={getStatusColor('SHORTLISTED')} />}
                onPress={() => handleStatusChange('SHORTLISTED')}
              />
              <List.Item
                title="Rejected"
                description="Application has been rejected"
                left={props => <List.Icon {...props} icon="close-circle-outline" color={getStatusColor('REJECTED')} />}
                onPress={() => handleStatusChange('REJECTED')}
              />
              <List.Item
                title="Hired"
                description="Candidate has been hired"
                left={props => <List.Icon {...props} icon="account-check-outline" color={getStatusColor('HIRED')} />}
                onPress={() => handleStatusChange('HIRED')}
              />
            </List.Section>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setStatusDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleStatusDialogConfirm}>Update</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={feedbackDialogVisible} onDismiss={() => setFeedbackDialogVisible(false)}>
          <Dialog.Title>Add Feedback</Dialog.Title>
          <Dialog.Content>
            <Text style={{ marginBottom: 16 }}>
              {selectedStatus === 'SHORTLISTED'
                ? 'Add feedback for the shortlisted candidate'
                : selectedStatus === 'REJECTED'
                ? 'Add rejection reason (will be shared with the candidate)'
                : 'Add feedback for the hired candidate'}
            </Text>
            <TextInput
              multiline
              numberOfLines={4}
              value={feedback}
              onChangeText={setFeedback}
              placeholder="Enter feedback here..."
              style={{ backgroundColor: '#f5f5f5', padding: 10, borderRadius: 4 }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setFeedbackDialogVisible(false)}>Cancel</Button>
            <Button onPress={confirmStatusChange}>Submit</Button>
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
