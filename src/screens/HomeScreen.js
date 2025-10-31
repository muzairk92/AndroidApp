import React, {useCallback, useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useFocusEffect} from '@react-navigation/native';
import {loadBlockedApps, loadDashboardStats} from '../services/StorageService';
import {
  listenForBlocks,
  stopListening,
  requestServicePermissions,
} from '../services/AppBlockingService';

const StatCard = ({icon, label, value, color}) => (
  <View style={styles.statCard}>
    <Icon name={icon} size={24} color={color} style={styles.statIcon} />
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const HomeScreen = ({navigation}) => {
  const [blockedCount, setBlockedCount] = useState(0);
  const [stats, setStats] = useState({totalBlocks: 0, timeSavedMinutes: 0});

  const refreshData = useCallback(async () => {
    const blockedApps = await loadBlockedApps();
    setBlockedCount(blockedApps.length);
    const dashboardStats = await loadDashboardStats();
    setStats(dashboardStats);
  }, []);

  useEffect(() => {
    requestServicePermissions();
    listenForBlocks(() => refreshData());
    return () => stopListening();
  }, [refreshData]);

  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [refreshData]),
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Focus Guardian</Text>
      <Text style={styles.subtitle}>Keep distractions away and achieve your goals.</Text>
      <View style={styles.statsRow}>
        <StatCard
          icon="block-helper"
          label="Blocked Apps"
          value={blockedCount}
          color="#ef4444"
        />
        <StatCard
          icon="shield-check"
          label="Blocks Prevented"
          value={stats.totalBlocks}
          color="#22c55e"
        />
      </View>
      <View style={styles.statsRow}>
        <StatCard
          icon="clock-outline"
          label="Time Saved"
          value={`${stats.timeSavedMinutes} min`}
          color="#3b82f6"
        />
      </View>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('BlockedApps')}>
        <Icon name="shield-lock" size={20} color="#fff" />
        <Text style={styles.primaryButtonText}>Manage blocked apps</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('Settings')}>
        <Icon name="cog" size={20} color="#4f46e5" />
        <Text style={styles.secondaryButtonText}>Settings</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef2ff',
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    color: '#6b7280',
    marginBottom: 24,
    fontSize: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginRight: 12,
    shadowColor: '#1f293722',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  statIcon: {
    marginBottom: 12,
  },
  statLabel: {
    color: '#6b7280',
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  primaryButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    borderColor: '#4f46e5',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  secondaryButtonText: {
    color: '#4f46e5',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default HomeScreen;
