/**
 * Job Posting Applications Screen
 * Shows all applications for a specific job posting
 */
import React, { useState } from 'react';
import { FlatList, View, StyleSheet, SafeAreaView } from 'react-native';
import { Text, Card, Button, Chip, Searchbar, ActivityIndicator, Divider, Appbar } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { MaterialIcons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import applicationService from '@services/application';
import jobPostingService from '@services/job-posting';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: #F5F5F5;
`;

const Content = styled(View)`
  flex: 1;
  padding: 16px;
`;

const SearchContainer = styled(View)`
  margin-bottom: 16px;
`;

const FilterContainer = styled(View)`
  flex-direction: row;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

const FilterChip = styled(Chip)`
  margin-right: 8px;
  margin-bottom: 8px;
`;

const ApplicationCard = styled(Card)`
  margin-bottom: 16px;
`;

const ApplicationCardContent = styled(Card.Content)`
  padding: 16px;
`;

const ApplicantName = styled(Text)`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 4px;
`;

const ApplicationMeta = styled(View)`
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 8px;
  margin-bottom: 8px;
`;

const ApplicationMetaItem = styled(View)`
  flex-direction: row;
  align-items: center;
  margin-right: 16px;
  margin-bottom: 4px;
`;

const ApplicationMetaText = styled(Text)`
  margin-left: 4px;
  color: #757575;
`;

const StatusChip = styled(Chip)`
  align-self: flex-start;
`;

const EmptyContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 32px;
`;

const EmptyText = styled(Text)`
  text-align: center;
  margin-bottom: 16px;
  font-size: 16px;
`;

const LoadingContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const JobTitle = styled(Text)`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
`;

export default function JobPostingApplicationsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const jobId = parseInt(id as string);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  // Fetch job posting details
  const {
    data: jobPosting,
    isLoading: isLoadingJobPosting,
    error: jobPostingError,
  } = useQuery({
    queryKey: ['jobPosting', jobId],
    queryFn: () => jobPostingService.getJobPosting(jobId),
    enabled: !!jobId,
  });

  // Fetch applications for this job posting
  const {
    data: applicationsData,
    isLoading: isLoadingApplications,
    error: applicationsError,
    refetch,
  } = useQuery({
    queryKey: ['applications', { jobPostingId: jobId, status: statusFilter }],
    queryFn: () => applicationService.getApplicationsByJobPosting(jobId, { status: statusFilter as any }),
    enabled: !!jobId,
  });

  const applications = applicationsData?.items || [];
  const isLoading = isLoadingJobPosting || isLoadingApplications;
  const error = jobPostingError || applicationsError;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // In a real app, we would call the API with a search parameter
    // For now, we'll just filter the results client-side
  };

  const handleFilterByStatus = (status: string | null) => {
    setStatusFilter(status);
  };

  const filteredApplications = applications.filter((application) => {
    if (!searchQuery) return true;
    return (
      application.applicant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      application.applicant_email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

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

  const renderApplicationCard = ({ item }: { item: any }) => (
    <ApplicationCard>
      <ApplicationCardContent>
        <ApplicantName>{item.applicant_name}</ApplicantName>
        
        <ApplicationMeta>
          <ApplicationMetaItem>
            <MaterialIcons name="email" size={16} color="#757575" />
            <ApplicationMetaText>{item.applicant_email}</ApplicationMetaText>
          </ApplicationMetaItem>
          
          <ApplicationMetaItem>
            <MaterialIcons name="phone" size={16} color="#757575" />
            <ApplicationMetaText>{item.applicant_phone}</ApplicationMetaText>
          </ApplicationMetaItem>
          
          <ApplicationMetaItem>
            <MaterialIcons name="calendar-today" size={16} color="#757575" />
            <ApplicationMetaText>
              {new Date(item.created_at).toLocaleDateString()}
            </ApplicationMetaText>
          </ApplicationMetaItem>
        </ApplicationMeta>
        
        <StatusChip
          mode="flat"
          style={{ backgroundColor: getStatusColor(item.status) + '20' }}
          textStyle={{ color: getStatusColor(item.status) }}
        >
          {item.status}
        </StatusChip>
      </ApplicationCardContent>
      
      <Card.Actions>
        <Button onPress={() => router.push(`/(main)/applications/${item.id}`)}>
          View Details
        </Button>
      </Card.Actions>
    </ApplicationCard>
  );

  return (
    <Container>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.push(`/(main)/job-postings/${jobId}`)} />
        <Appbar.Content title="Applications" />
      </Appbar.Header>

      <Content>
        {jobPosting && (
          <JobTitle>{jobPosting.title}</JobTitle>
        )}

        <SearchContainer>
          <Searchbar
            placeholder="Search applications"
            onChangeText={handleSearch}
            value={searchQuery}
          />
        </SearchContainer>

        <FilterContainer>
          <FilterChip
            selected={statusFilter === null}
            onPress={() => handleFilterByStatus(null)}
          >
            All
          </FilterChip>
          <FilterChip
            selected={statusFilter === 'PENDING'}
            onPress={() => handleFilterByStatus('PENDING')}
          >
            Pending
          </FilterChip>
          <FilterChip
            selected={statusFilter === 'REVIEWING'}
            onPress={() => handleFilterByStatus('REVIEWING')}
          >
            Reviewing
          </FilterChip>
          <FilterChip
            selected={statusFilter === 'SHORTLISTED'}
            onPress={() => handleFilterByStatus('SHORTLISTED')}
          >
            Shortlisted
          </FilterChip>
          <FilterChip
            selected={statusFilter === 'REJECTED'}
            onPress={() => handleFilterByStatus('REJECTED')}
          >
            Rejected
          </FilterChip>
          <FilterChip
            selected={statusFilter === 'HIRED'}
            onPress={() => handleFilterByStatus('HIRED')}
          >
            Hired
          </FilterChip>
        </FilterContainer>

        {isLoading ? (
          <LoadingContainer>
            <ActivityIndicator size="large" />
          </LoadingContainer>
        ) : error ? (
          <EmptyContainer>
            <MaterialIcons name="error-outline" size={48} color="#F44336" />
            <EmptyText>Failed to load applications. Please try again.</EmptyText>
            <Button mode="contained" onPress={() => refetch()}>
              Retry
            </Button>
          </EmptyContainer>
        ) : filteredApplications.length === 0 ? (
          <EmptyContainer>
            <MaterialIcons name="people-outline" size={48} color="#9E9E9E" />
            <EmptyText>
              {searchQuery
                ? 'No applications match your search criteria.'
                : 'This job posting has no applications yet.'}
            </EmptyText>
            <Button
              mode="contained"
              onPress={() => router.push('/(main)/job-postings')}
            >
              Back to Job Postings
            </Button>
          </EmptyContainer>
        ) : (
          <FlatList
            data={filteredApplications}
            renderItem={renderApplicationCard}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        )}
      </Content>
    </Container>
  );
}
