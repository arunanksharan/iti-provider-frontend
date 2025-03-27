/**
 * Applications List Screen
 * Displays a list of all job applications with filtering and search capabilities
 */
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ApplicationList } from '../../../src/components/applications';

export default function ApplicationsScreen() {
  const handleSelectApplication = (applicationId: number) => {
    router.push(`/(main)/applications/${applicationId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ApplicationList onSelectApplication={handleSelectApplication} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
});
