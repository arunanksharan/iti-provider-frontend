/**
 * Applications List Screen
 * Displays a list of all job applications with filtering and search capabilities
 */
import React, { useState } from 'react';
import { FlatList, View, StyleSheet, SafeAreaView } from 'react-native';
import { Text, Card, Button, Chip, Searchbar, ActivityIndicator, Divider, Menu } from 'react-native-paper';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { MaterialIcons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import applicationService, { JobApplication } from '@services/application';
import jobPostingService from '@services/job-posting';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${props => props.theme.colors?.background || '#F5F5F5'};
`;

const Content = styled.View`
  flex: 1;
  padding: 16px;
`;

const SearchContainer = styled.View`
  margin-bottom: 16px;
`;

const FilterContainer = styled.View`
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

const JobTitle = styled(Text)`
  font-size: 16px;
  margin-bottom: 8px;
`;

const ApplicationMeta = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 8px;
  margin-bottom: 8px;
`;

const ApplicationMetaItem = styled.View`
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

const EmptyContainer = styled.View`
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

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export default function ApplicationsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  // Fetch applications
  const {
    data: applicationsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['applications', { status: statusFilter }],
    queryFn: () => applicationService.getApplications({ status: statusFilter as any }),
  });

  // Fetch job postings for reference
  const { data: jobPostingsData } = useQuery({
    queryKey: ['jobPostings', { limit: 100 }],
    queryFn: () => jobPostingService.getJobPostings({ limit: 100 }),
  });

  const applications = applicationsData?.items || [];
  const jobPostings = jobPostingsData?.items || [];

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

  const getJobTitle = (jobPostingId: number) => {
    const jobPosting = jobPostings.find(job => job.id === jobPostingId);
    return jobPosting ? jobPosting.title : 'Unknown Job';
  };

  const renderApplicationCard = ({ item }: { item: JobApplication }) => (
    <ApplicationCard>
      <ApplicationCardContent>
        <ApplicantName>{item.applicant_name}</ApplicantName>
        <JobTitle>{getJobTitle(item.job_posting_id)}</JobTitle>
        
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
        <Button
          mode="contained"
          onPress={() => router.push(`/(main)/applications/${item.id}`)}
        >
          Review
        </Button>
      </Card.Actions>
    </ApplicationCard>
  );

  return (
    <Container>
      <Content>
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
                : 'You haven\'t received any applications yet.'}
            </EmptyText>
            <Button
              mode="contained"
              onPress={() => router.push('/(main)/job-postings')}
            >
              View Job Postings
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
