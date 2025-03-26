import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import ApplicationList from '../components/applications/ApplicationList';
import ApplicationDetail from '../components/applications/ApplicationDetail';

interface RouteParams {
  jobId?: number;
}

const ApplicationManagementScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { jobId } = route.params as RouteParams || {};
  
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  useEffect(() => {
    // Set screen title based on whether we're viewing all applications or job-specific ones
    navigation.setOptions({
      title: jobId ? 'Job Applications' : 'All Applications',
    });
  }, [jobId, navigation]);

  const handleSelectApplication = (applicationId: number) => {
    setSelectedApplicationId(applicationId);
  };

  const handleBackToList = () => {
    setSelectedApplicationId(null);
  };

  const handleStatusChange = () => {
    // Trigger a refresh of the application list when status changes
    setRefreshKey(prev => prev + 1);
  };

  return (
    <SafeAreaView style={styles.container}>
      {selectedApplicationId ? (
        <ApplicationDetail 
          applicationId={selectedApplicationId} 
          onBack={handleBackToList}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <ApplicationList 
          jobId={jobId} 
          onSelectApplication={handleSelectApplication}
          key={refreshKey} // Use numeric key for better refresh handling
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
});

export default ApplicationManagementScreen;
