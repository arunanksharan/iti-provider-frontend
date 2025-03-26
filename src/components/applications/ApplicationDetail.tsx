import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  TextInput,
  Alert
} from 'react-native';
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
interface ApplicationDetail {
  application_id: number;
  job_title: string;
  job_id: number;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired';
  applied_at: string;
  experience_years: number;
  skills: string[];
  education: {
    degree: string;
    institution: string;
    year: number;
  }[];
  work_experience: {
    company: string;
    position: string;
    start_date: string;
    end_date: string | null;
    description: string;
  }[];
  resume_url: string | null;
  cover_letter: string | null;
  feedback: {
    text: string;
    created_at: string;
  }[];
}

interface ApplicationDetailProps {
  applicationId: number;
  onBack: () => void;
  onStatusChange?: () => void;
}

const ApplicationDetail: React.FC<ApplicationDetailProps> = ({ 
  applicationId, 
  onBack,
  onStatusChange
}) => {
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    fetchApplicationDetail();
  }, [applicationId]);

  const fetchApplicationDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(APPLICATION_ENDPOINTS.DETAIL(applicationId));
      setApplication(response.data);
    } catch (err) {
      console.error('Error fetching application details:', err);
      setError('Failed to load application details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!application) return;
    
    setStatusUpdateLoading(true);
    try {
      await axios.patch(
        APPLICATION_ENDPOINTS.UPDATE_STATUS(applicationId),
        { status: newStatus }
      );
      
      // Update local state
      setApplication({
        ...application,
        status: newStatus as ApplicationDetail['status']
      });
      
      // Notify parent component
      if (onStatusChange) onStatusChange();
      
      Alert.alert('Success', 'Application status updated successfully');
    } catch (err) {
      console.error('Error updating application status:', err);
      Alert.alert('Error', 'Failed to update application status. Please try again.');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim() || !application) return;
    
    setSubmittingFeedback(true);
    try {
      const response = await axios.post(
        APPLICATION_ENDPOINTS.ADD_FEEDBACK(applicationId),
        { text: feedbackText.trim() }
      );
      
      // Update local state with new feedback
      setApplication({
        ...application,
        feedback: [
          ...application.feedback,
          {
            text: feedbackText.trim(),
            created_at: new Date().toISOString()
          }
        ]
      });
      
      // Clear feedback input
      setFeedbackText('');
      
      Alert.alert('Success', 'Feedback added successfully');
    } catch (err) {
      console.error('Error adding feedback:', err);
      Alert.alert('Error', 'Failed to add feedback. Please try again.');
    } finally {
      setSubmittingFeedback(false);
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

  const renderStatusActions = () => {
    if (!application) return null;
    
    const currentStatus = application.status;
    const availableStatuses = Object.keys(STATUS_LABELS).filter(
      status => status !== currentStatus
    ) as Array<keyof typeof STATUS_LABELS>;
    
    return (
      <View style={styles.statusActionsContainer}>
        <Text style={styles.sectionTitle}>Update Status</Text>
        <View style={styles.statusButtonsContainer}>
          {availableStatuses.map(status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusButton,
                { backgroundColor: STATUS_COLORS[status] }
              ]}
              onPress={() => handleStatusUpdate(status)}
              disabled={statusUpdateLoading}
            >
              {statusUpdateLoading ? (
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

  const renderFeedbackSection = () => {
    if (!application) return null;
    
    return (
      <View style={styles.feedbackContainer}>
        <Text style={styles.sectionTitle}>Feedback</Text>
        
        {/* Feedback input */}
        <View style={styles.feedbackInputContainer}>
          <TextInput
            style={styles.feedbackInput}
            placeholder="Add feedback or notes about this applicant..."
            multiline
            numberOfLines={3}
            value={feedbackText}
            onChangeText={setFeedbackText}
            editable={!submittingFeedback}
          />
          <TouchableOpacity
            style={[
              styles.feedbackSubmitButton,
              (!feedbackText.trim() || submittingFeedback) && styles.feedbackSubmitButtonDisabled
            ]}
            onPress={handleSubmitFeedback}
            disabled={!feedbackText.trim() || submittingFeedback}
          >
            {submittingFeedback ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.feedbackSubmitButtonText}>Add</Text>
            )}
          </TouchableOpacity>
        </View>
        
        {/* Existing feedback */}
        {application.feedback.length > 0 ? (
          <View style={styles.feedbackList}>
            {application.feedback.map((item, index) => {
              const date = new Date(item.created_at).toLocaleDateString();
              const time = new Date(item.created_at).toLocaleTimeString();
              
              return (
                <View key={index} style={styles.feedbackItem}>
                  <Text style={styles.feedbackText}>{item.text}</Text>
                  <Text style={styles.feedbackDate}>{date} at {time}</Text>
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={styles.noFeedbackText}>No feedback added yet</Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading application details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchApplicationDetail}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!application) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="document-text-outline" size={48} color="#999" />
        <Text style={styles.emptyText}>Application not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
          <Text style={styles.backButtonText}>Back to List</Text>
        </TouchableOpacity>
      </View>
      
      {/* Job and status info */}
      <View style={styles.jobInfoContainer}>
        <Text style={styles.jobTitle}>{application.job_title}</Text>
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status:</Text>
          {renderStatusBadge(application.status)}
        </View>
      </View>
      
      {/* Applicant basic info */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Applicant Information</Text>
        <View style={styles.applicantInfoContainer}>
          <Text style={styles.applicantName}>{application.applicant_name}</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{application.applicant_email}</Text>
          </View>
          
          {application.applicant_phone && (
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={16} color="#666" />
              <Text style={styles.infoText}>{application.applicant_phone}</Text>
            </View>
          )}
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.infoText}>
              Applied on {new Date(application.applied_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Skills */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Skills</Text>
        <View style={styles.skillsContainer}>
          {application.skills.map((skill, index) => (
            <View key={index} style={styles.skillChip}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>
      
      {/* Experience */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Work Experience</Text>
        {application.work_experience.length > 0 ? (
          application.work_experience.map((exp, index) => (
            <View key={index} style={styles.experienceItem}>
              <View style={styles.experienceHeader}>
                <Text style={styles.companyName}>{exp.company}</Text>
                <Text style={styles.experienceDuration}>
                  {new Date(exp.start_date).getFullYear()} - 
                  {exp.end_date ? new Date(exp.end_date).getFullYear() : 'Present'}
                </Text>
              </View>
              <Text style={styles.positionTitle}>{exp.position}</Text>
              <Text style={styles.experienceDescription}>{exp.description}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No work experience provided</Text>
        )}
      </View>
      
      {/* Education */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Education</Text>
        {application.education.length > 0 ? (
          application.education.map((edu, index) => (
            <View key={index} style={styles.educationItem}>
              <Text style={styles.degree}>{edu.degree}</Text>
              <Text style={styles.institution}>{edu.institution}</Text>
              <Text style={styles.graduationYear}>Graduated: {edu.year}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No education information provided</Text>
        )}
      </View>
      
      {/* Resume and Cover Letter */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Documents</Text>
        <View style={styles.documentsContainer}>
          {application.resume_url ? (
            <TouchableOpacity style={styles.documentButton}>
              <Ionicons name="document-text-outline" size={20} color="#007AFF" />
              <Text style={styles.documentButtonText}>View Resume</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.noDataText}>No resume provided</Text>
          )}
          
          {application.cover_letter ? (
            <View style={styles.coverLetterContainer}>
              <Text style={styles.coverLetterLabel}>Cover Letter:</Text>
              <Text style={styles.coverLetterText}>{application.cover_letter}</Text>
            </View>
          ) : null}
        </View>
      </View>
      
      {/* Status Actions */}
      <View style={styles.card}>
        {renderStatusActions()}
      </View>
      
      {/* Feedback Section */}
      <View style={styles.card}>
        {renderFeedbackSection()}
      </View>
    </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    marginLeft: 4,
  },
  jobInfoContainer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
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
  card: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  applicantInfoContainer: {
    marginBottom: 8,
  },
  applicantName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillChip: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    color: '#1976D2',
    fontSize: 14,
  },
  experienceItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  experienceDuration: {
    fontSize: 14,
    color: '#666',
  },
  positionTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  experienceDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  educationItem: {
    marginBottom: 12,
  },
  degree: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  institution: {
    fontSize: 16,
    color: '#333',
  },
  graduationYear: {
    fontSize: 14,
    color: '#666',
  },
  documentsContainer: {
    marginTop: 8,
  },
  documentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  documentButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  coverLetterContainer: {
    marginTop: 16,
  },
  coverLetterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  coverLetterText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statusActionsContainer: {
    marginBottom: 8,
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
  feedbackContainer: {
    marginBottom: 8,
  },
  feedbackInputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  feedbackInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#F9F9F9',
    marginRight: 8,
  },
  feedbackSubmitButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  feedbackSubmitButtonDisabled: {
    backgroundColor: '#A0C4FF',
  },
  feedbackSubmitButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  feedbackList: {
    marginTop: 8,
  },
  feedbackItem: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  feedbackDate: {
    fontSize: 12,
    color: '#999',
  },
  noFeedbackText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
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
});

export default ApplicationDetail;
