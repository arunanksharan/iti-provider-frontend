import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import axios from 'axios';
import { APPLICATION_ENDPOINTS } from '../../constants/api';
import { Ionicons } from '@expo/vector-icons';

// Application status colors
const STATUS_COLORS = {
  pending: '#FFC107',
  reviewing: '#2196F3',
  shortlisted: '#4CAF50',
  rejected: '#F44336',
  hired: '#9C27B0',
};

// Application status labels
const STATUS_LABELS = {
  pending: 'Pending',
  reviewing: 'Reviewing',
  shortlisted: 'Shortlisted',
  rejected: 'Rejected',
  hired: 'Hired',
};

// Application interface
interface Application {
  application_id: number;
  job_title: string;
  applicant_name: string;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired';
  applied_at: string;
  experience_years: number;
  skills: string[];
}

interface ApplicationListProps {
  jobId?: number;
  onSelectApplication: (applicationId: number) => void;
}

const ApplicationList: React.FC<ApplicationListProps> = ({ jobId, onSelectApplication }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [jobId, statusFilter]);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (jobId) params.append('job_id', jobId.toString());
      if (statusFilter) params.append('status', statusFilter);

      // Fetch applications
      const response = await axios.get(
        `${APPLICATION_ENDPOINTS.LIST}?${params.toString()}`
      );
      setApplications(response.data.items || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    const color = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#999';
    const label = STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status;
    
    return (
      <View style={[styles.statusBadge, { backgroundColor: color }]}>
        <Text style={styles.statusText}>{label}</Text>
      </View>
    );
  };

  const renderStatusFilter = () => {
    const statuses = ['pending', 'reviewing', 'shortlisted', 'rejected', 'hired'];
    
    return (
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by status:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              statusFilter === null && styles.activeFilterChip
            ]}
            onPress={() => setStatusFilter(null)}
          >
            <Text style={statusFilter === null ? styles.activeFilterText : styles.filterText}>
              All
            </Text>
          </TouchableOpacity>
          
          {statuses.map(status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterChip,
                statusFilter === status && styles.activeFilterChip
              ]}
              onPress={() => setStatusFilter(status)}
            >
              <Text 
                style={statusFilter === status ? styles.activeFilterText : styles.filterText}
              >
                {STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderApplicationItem = ({ item }: { item: Application }) => {
    const formattedDate = new Date(item.applied_at).toLocaleDateString();
    
    return (
      <TouchableOpacity
        style={styles.applicationCard}
        onPress={() => onSelectApplication(item.application_id)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.jobTitle}>{item.job_title}</Text>
          {renderStatusBadge(item.status)}
        </View>
        
        <View style={styles.applicantInfo}>
          <Text style={styles.applicantName}>{item.applicant_name}</Text>
          <Text style={styles.applicationDate}>Applied on {formattedDate}</Text>
        </View>
        
        <View style={styles.experienceContainer}>
          <Text style={styles.experienceLabel}>Experience:</Text>
          <Text style={styles.experienceValue}>{item.experience_years} years</Text>
        </View>
        
        <View style={styles.skillsContainer}>
          <Text style={styles.skillsLabel}>Skills:</Text>
          <View style={styles.skillsWrapper}>
            {item.skills.slice(0, 3).map((skill, index) => (
              <View key={index} style={styles.skillChip}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
            {item.skills.length > 3 && (
              <View style={styles.skillChip}>
                <Text style={styles.skillText}>+{item.skills.length - 3}</Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.cardFooter}>
          <TouchableOpacity 
            style={styles.viewButton}
            onPress={() => onSelectApplication(item.application_id)}
          >
            <Text style={styles.viewButtonText}>View Details</Text>
            <Ionicons name="chevron-forward" size={16} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && applications.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading applications...</Text>
      </View>
    );
  }

  if (error && applications.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchApplications}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (applications.length === 0) {
    return (
      <View style={styles.container}>
        {renderStatusFilter()}
        <View style={styles.centerContainer}>
          <Ionicons name="document-text-outline" size={48} color="#999" />
          <Text style={styles.emptyText}>No applications found</Text>
          <Text style={styles.emptySubtext}>
            {statusFilter 
              ? `Try changing the status filter or check back later.`
              : `When candidates apply to your job postings, they'll appear here.`
            }
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderStatusFilter()}
      <FlatList
        data={applications}
        renderItem={renderApplicationItem}
        keyExtractor={(item) => item.application_id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshing={loading}
        onRefresh={fetchApplications}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    maxWidth: '80%',
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  applicationCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  applicantInfo: {
    marginBottom: 12,
  },
  applicantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  applicationDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  experienceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  experienceLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  experienceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  skillsContainer: {
    marginBottom: 12,
  },
  skillsLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  skillsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillChip: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    color: '#1976D2',
    fontSize: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  filterContainer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    color: '#666',
    fontSize: 14,
  },
  activeFilterText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ApplicationList;
