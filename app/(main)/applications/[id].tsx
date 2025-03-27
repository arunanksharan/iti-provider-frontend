/**
 * Application Detail Screen
 * Shows details of a specific job application and allows status updates
 */
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ApplicationDetail } from '../../../src/components/applications';

export default function ApplicationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const applicationId = parseInt(id as string, 10);

  const handleBack = () => {
    router.back();
  };

  const handleStatusChange = () => {
    // This will be called when the status is updated
    // We could refresh data or show a notification
  };

  return (
    <SafeAreaView style={styles.container}>
      <ApplicationDetail
        applicationId={applicationId}
        onBack={handleBack}
        onStatusChange={handleStatusChange}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
});
