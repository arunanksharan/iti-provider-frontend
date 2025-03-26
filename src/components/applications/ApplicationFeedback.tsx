import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import axios from 'axios';
import { APPLICATION_ENDPOINTS } from '../../constants/api';
import { Ionicons } from '@expo/vector-icons';

interface FeedbackItem {
  text: string;
  created_at: string;
}

interface ApplicationFeedbackProps {
  applicationId: number;
  initialFeedback?: FeedbackItem[];
  onFeedbackAdded?: () => void;
}

const ApplicationFeedback: React.FC<ApplicationFeedbackProps> = ({
  applicationId,
  initialFeedback = [],
  onFeedbackAdded
}) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [feedback, setFeedback] = useState<FeedbackItem[]>(initialFeedback);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!initialFeedback || initialFeedback.length === 0) {
      fetchFeedback();
    }
  }, [applicationId, initialFeedback]);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const response = await axios.get(APPLICATION_ENDPOINTS.GET_FEEDBACK(applicationId));
      setFeedback(response.data || []);
    } catch (err) {
      console.error('Error fetching feedback:', err);
      Alert.alert('Error', 'Failed to load feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) return;
    
    setSubmitting(true);
    try {
      const response = await axios.post(
        APPLICATION_ENDPOINTS.ADD_FEEDBACK(applicationId),
        { text: feedbackText.trim() }
      );
      
      // Add new feedback to the list
      const newFeedback = {
        text: feedbackText.trim(),
        created_at: new Date().toISOString()
      };
      
      setFeedback([...feedback, newFeedback]);
      setFeedbackText('');
      
      // Notify parent component
      if (onFeedbackAdded) onFeedbackAdded();
      
      Alert.alert('Success', 'Feedback added successfully');
    } catch (err) {
      console.error('Error adding feedback:', err);
      Alert.alert('Error', 'Failed to add feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Feedback & Notes</Text>
      
      {/* Feedback input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add feedback or notes about this applicant..."
          multiline
          numberOfLines={3}
          value={feedbackText}
          onChangeText={setFeedbackText}
          editable={!submitting}
        />
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!feedbackText.trim() || submitting) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmitFeedback}
          disabled={!feedbackText.trim() || submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Ionicons name="send" size={16} color="#FFF" />
              <Text style={styles.submitButtonText}>Send</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Feedback list */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.loadingText}>Loading feedback...</Text>
        </View>
      ) : feedback.length > 0 ? (
        <ScrollView style={styles.feedbackList}>
          {feedback.map((item, index) => {
            const date = new Date(item.created_at).toLocaleDateString();
            const time = new Date(item.created_at).toLocaleTimeString();
            
            return (
              <View key={index} style={styles.feedbackItem}>
                <Text style={styles.feedbackText}>{item.text}</Text>
                <Text style={styles.feedbackDate}>{date} at {time}</Text>
              </View>
            );
          })}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbox-outline" size={32} color="#999" />
          <Text style={styles.emptyText}>No feedback added yet</Text>
        </View>
      )}
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
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#F9F9F9',
    marginBottom: 8,
    minHeight: 80,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  submitButtonDisabled: {
    backgroundColor: '#A0C4FF',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  feedbackList: {
    maxHeight: 300,
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
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});

export default ApplicationFeedback;
