/**
 * Dashboard screen for the Provider Frontend app
 * Shows overview of company profile, job postings, and applications
 */
import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Text, Card, Button, Title, Paragraph, useTheme } from 'react-native-paper';
import { Link } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import styled from 'styled-components/native';
import { useQuery } from '@tanstack/react-query';
import { MaterialIcons } from '@expo/vector-icons';
import companyProfileService from '@services/company-profile';
import jobPostingService from '@services/job-posting';
import applicationService from '@services/application';

const Container = styled.ScrollView`
  flex: 1;
  background-color: ${props => props.theme.colors?.background || '#F5F5F5'};
`;

const Content = styled.View`
  padding: 16px;
`;

const WelcomeCard = styled(Card)`
  margin-bottom: 16px;
  background-color: ${props => props.theme.colors?.primary || '#3498db'};
`;

const WelcomeCardContent = styled(Card.Content)`
  padding: 16px;
`;

const WelcomeTitle = styled(Title)`
  color: white;
  font-size: 22px;
  margin-bottom: 8px;
`;

const WelcomeText = styled(Paragraph)`
  color: white;
  margin-bottom: 16px;
`;

const StatsContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const StatCard = styled(Card)`
  width: 48%;
  margin-bottom: 16px;
`;

const StatCardContent = styled(Card.Content)`
  align-items: center;
  padding: 16px;
`;

const StatValue = styled(Title)`
  font-size: 32px;
  margin-bottom: 4px;
`;

const StatLabel = styled(Paragraph)`
  text-align: center;
`;

const SectionTitle = styled(Title)`
  font-size: 18px;
  margin-top: 8px;
  margin-bottom: 16px;
`;

const ActionCard = styled(Card)`
  margin-bottom: 16px;
`;

export default function DashboardScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  
  // Fetch company profile
  const { data: profile } = useQuery({
    queryKey: ['companyProfile'],
    queryFn: () => companyProfileService.getProfile(),
    // Don't show error for 404 (profile doesn't exist yet)
    retry: (failureCount, error: any) => {
      return failureCount < 3 && error.status !== 404;
    },
  });
  
  // Fetch job postings count
  const { data: jobPostings } = useQuery({
    queryKey: ['jobPostings', { limit: 1 }],
    queryFn: () => jobPostingService.getJobPostings({ limit: 1 }),
    enabled: !!profile,
  });
  
  // Fetch applications count
  const { data: applications } = useQuery({
    queryKey: ['applications', { limit: 1 }],
    queryFn: () => applicationService.getApplications({ limit: 1 }),
    enabled: !!profile,
  });

  const jobPostingsCount = jobPostings?.total || 0;
  const applicationsCount = applications?.total || 0;
  const hasProfile = !!profile;

  return (
    <Container>
      <Content>
        <WelcomeCard>
          <WelcomeCardContent>
            <WelcomeTitle>
              Welcome to Provider Portal
            </WelcomeTitle>
            <WelcomeText>
              {hasProfile
                ? `Welcome back, ${profile.name}! Manage your job postings and applications.`
                : 'Complete your company profile to start posting jobs and receiving applications.'}
            </WelcomeText>
            {!hasProfile && (
              <Button
                mode="contained"
                buttonColor="white"
                textColor={theme.colors?.primary || '#3498db'}
                onPress={() => {}}
              >
                <Link href="/(main)/company-profile">Complete Profile</Link>
              </Button>
            )}
          </WelcomeCardContent>
        </WelcomeCard>

        {hasProfile && (
          <>
            <StatsContainer>
              <StatCard>
                <StatCardContent>
                  <MaterialIcons name="work" size={32} color={theme.colors?.primary || '#3498db'} />
                  <StatValue>{jobPostingsCount}</StatValue>
                  <StatLabel>Job Postings</StatLabel>
                </StatCardContent>
              </StatCard>
              
              <StatCard>
                <StatCardContent>
                  <MaterialIcons name="people" size={32} color={theme.colors?.primary || '#3498db'} />
                  <StatValue>{applicationsCount}</StatValue>
                  <StatLabel>Applications</StatLabel>
                </StatCardContent>
              </StatCard>
            </StatsContainer>

            <SectionTitle>Quick Actions</SectionTitle>
            
            <ActionCard>
              <Card.Content>
                <Title>Post a New Job</Title>
                <Paragraph>Create a new job posting to find the right candidates</Paragraph>
              </Card.Content>
              <Card.Actions>
                <Button>
                  <Link href="/(main)/job-postings/create">Create Job</Link>
                </Button>
              </Card.Actions>
            </ActionCard>
            
            <ActionCard>
              <Card.Content>
                <Title>Review Applications</Title>
                <Paragraph>Check applications for your job postings</Paragraph>
              </Card.Content>
              <Card.Actions>
                <Button>
                  <Link href="/(main)/applications">View Applications</Link>
                </Button>
              </Card.Actions>
            </ActionCard>
            
            <ActionCard>
              <Card.Content>
                <Title>Update Company Profile</Title>
                <Paragraph>Keep your company information up to date</Paragraph>
              </Card.Content>
              <Card.Actions>
                <Button>
                  <Link href="/(main)/company-profile">Edit Profile</Link>
                </Button>
              </Card.Actions>
            </ActionCard>
          </>
        )}
      </Content>
    </Container>
  );
}
