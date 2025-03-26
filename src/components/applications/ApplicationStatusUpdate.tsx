import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import axios from 'axios';
import { APPLICATION_ENDPOINTS } from '../../constants/api';

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

interface ApplicationStatusUpdateProps {
  applicationId: number;
  currentStatus: string;
  onStatusChange: (newStatus: string) => void;
}

const ApplicationStatusUpdate: React.FC<ApplicationStatusUpdateProps> = ({
  applicationId,
  currentStatus,
  onStatusChange
}) => {
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = async (newStatus: string) => {
    if (newStatus === currentStatus) return;
    
    setLoading(true);
    try {
      await axios.patch(
        APPLICATION_ENDPOINTS.UPDATE_STATUS(applicationId),
        { status: newStatus }
      );
      
      // Notify parent component
      onStatusChange(newStatus);
      
      Alert.alert('Success', 'Application status updated successfully');
    } catch (err) {
      console.error('Error updating application status:', err);
      Alert.alert('Error', 'Failed to update application status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter out current status from available statuses
  const availableStatuses = Object.keys(STATUS_LABELS).filter(
    status => status !== currentStatus
  ) as Array<keyof typeof STATUS_LABELS>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Update Status</Text>
      
      <View style={styles.currentStatusContainer}>
        <Text style={styles.currentStatusLabel}>Current Status:</Text>
        <View 
          style={[
            styles.statusBadge, 
            { backgroundColor: STATUS_COLORS[currentStatus as keyof typeof STATUS_COLORS] || '#999' }
          ]}
        >
          <Text style={styles.statusText}>
            {STATUS_LABELS[currentStatus as keyof typeof STATUS_LABELS] || currentStatus}
          </Text>
        </View>
      </View>
      
      <View style={styles.statusButtonsContainer}>
        {availableStatuses.map(status => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusButton,
              { backgroundColor: STATUS_COLORS[status] }
            ]}
            onPress={() => handleStatusUpdate(status)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.statusButtonText}>
                {STATUS_LABELS[status]}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  currentStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentStatusLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  statusButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statusButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  statusButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ApplicationStatusUpdate;
