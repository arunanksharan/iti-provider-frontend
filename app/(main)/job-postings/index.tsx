/**
 * Job Postings List Screen
 * Displays a list of all job postings with filtering and search capabilities
 */
import React, { useState } from 'react';
import { FlatList, View, StyleSheet, SafeAreaView } from 'react-native';
import { Text, Card, Button, Chip, Searchbar, FAB, ActivityIndicator, Divider, Menu } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { MaterialIcons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import jobPostingService, { JobPosting } from '@services/job-posting';

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

const JobCard = styled(Card)`
  margin-bottom: 16px;
`;

const JobCardContent = styled(Card.Content)`
  padding: 16px;
`;

const JobTitle = styled(Text)`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 4px;
`;

const JobMeta = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 8px;
  margin-bottom: 8px;
`;

const JobMetaItem = styled.View`
  flex-direction: row;
  align-items: center;
  margin-right: 16px;
  margin-bottom: 4px;
`;

const JobMetaText = styled(Text)`
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

const FloatingButton = styled(FAB)`
  position: absolute;
  right: 16px;
  bottom: 16px;
`;

export default function JobPostingsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  // Fetch job postings
  const {
    data: jobPostingsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['jobPostings', { status: statusFilter }],
    queryFn: () => jobPostingService.getJobPostings({ status: statusFilter as any }),
  });

  const jobPostings = jobPostingsData?.items || [];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // In a real app, we would call the API with a search parameter
    // For now, we'll just filter the results client-side
  };

  const handleFilterByStatus = (status: string | null) => {
    setStatusFilter(status);
  };

  const filteredJobPostings = jobPostings.filter((job) => {
    if (!searchQuery) return true;
    return (
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.short_description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

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

  const renderJobCard = ({ item }: { item: JobPosting }) => (
    <JobCard>
      <JobCardContent>
        <JobTitle>{item.title}</JobTitle>
        <Text>{item.short_description}</Text>
        
        <JobMeta>
          <JobMetaItem>
            <MaterialIcons name="location-on" size={16} color="#757575" />
            <JobMetaText>{item.location}</JobMetaText>
          </JobMetaItem>
          
          <JobMetaItem>
            <MaterialIcons name="work" size={16} color="#757575" />
            <JobMetaText>{item.employment_type.replace('_', ' ')}</JobMetaText>
          </JobMetaItem>
          
          <JobMetaItem>
            <MaterialIcons name="attach-money" size={16} color="#757575" />
            <JobMetaText>
              {item.salary_lower.toLocaleString()} - {item.salary_upper.toLocaleString()}
            </JobMetaText>
          </JobMetaItem>
        </JobMeta>
        
        <StatusChip
          mode="flat"
          style={{ backgroundColor: getStatusColor(item.status) + '20' }}
          textStyle={{ color: getStatusColor(item.status) }}
        >
          {item.status}
        </StatusChip>
        
        <Text style={{ marginTop: 8, fontSize: 12, color: '#757575' }}>
          Broadcast: {getBroadcastStatusText(item.broadcast_status)}
        </Text>
      </JobCardContent>
      
      <Card.Actions>
        <Button onPress={() => router.push(`/(main)/job-postings/${item.id}`)}>
          View Details
        </Button>
        <Button
          mode="contained"
          disabled={item.status !== 'DRAFT'}
          onPress={() => router.push(`/(main)/job-postings/${item.id}/edit`)}
        >
          Edit
        </Button>
      </Card.Actions>
    </JobCard>
  );

  return (
    <Container>
      <Content>
        <SearchContainer>
          <Searchbar
            placeholder="Search job postings"
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
            selected={statusFilter === 'DRAFT'}
            onPress={() => handleFilterByStatus('DRAFT')}
          >
            Draft
          </FilterChip>
          <FilterChip
            selected={statusFilter === 'LIVE'}
            onPress={() => handleFilterByStatus('LIVE')}
          >
            Live
          </FilterChip>
          <FilterChip
            selected={statusFilter === 'CLOSED'}
            onPress={() => handleFilterByStatus('CLOSED')}
          >
            Closed
          </FilterChip>
        </FilterContainer>

        {isLoading ? (
          <LoadingContainer>
            <ActivityIndicator size="large" />
          </LoadingContainer>
        ) : error ? (
          <EmptyContainer>
            <MaterialIcons name="error-outline" size={48} color="#F44336" />
            <EmptyText>Failed to load job postings. Please try again.</EmptyText>
            <Button mode="contained" onPress={() => refetch()}>
              Retry
            </Button>
          </EmptyContainer>
        ) : filteredJobPostings.length === 0 ? (
          <EmptyContainer>
            <MaterialIcons name="work-off" size={48} color="#9E9E9E" />
            <EmptyText>
              {searchQuery
                ? 'No job postings match your search criteria.'
                : 'You haven\'t created any job postings yet.'}
            </EmptyText>
            <Button
              mode="contained"
              onPress={() => router.push('/(main)/job-postings/create')}
            >
              Create Job Posting
            </Button>
          </EmptyContainer>
        ) : (
          <FlatList
            data={filteredJobPostings}
            renderItem={renderJobCard}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 80 }}
          />
        )}
      </Content>

      <FloatingButton
        icon="plus"
        onPress={() => router.push('/(main)/job-postings/create')}
      />
    </Container>
  );
}
