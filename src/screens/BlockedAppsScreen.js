import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity} from 'react-native';
import AppListItem from '../components/AppListItem';
import {
  getInstalledApps,
  setBlockedApps as syncBlockedApps,
} from '../services/AppBlockingService';
import {DEFAULT_BLOCKED_PACKAGES} from '../utils/constants';
import {loadBlockedApps, saveBlockedApps} from '../services/StorageService';

const BlockedAppsScreen = () => {
  const [installedApps, setInstalledApps] = useState([]);
  const [blockedApps, setBlockedApps] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      const apps = await getInstalledApps();
      const saved = await loadBlockedApps();
      const nextBlocked = saved.length ? saved : DEFAULT_BLOCKED_PACKAGES;
      setInstalledApps(apps);
      setBlockedApps(nextBlocked);
      await syncBlockedApps(nextBlocked);
      setLoading(false);
    };
    bootstrap();
  }, []);

  const filteredApps = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return installedApps;
    }
    return installedApps.filter(app =>
      [app.label, app.packageName].some(field => field.toLowerCase().includes(q)),
    );
  }, [installedApps, query]);

  const handleToggle = useCallback(
    async (app, value) => {
      const next = value
        ? Array.from(new Set([...blockedApps, app.packageName]))
        : blockedApps.filter(pkg => pkg !== app.packageName);
      setBlockedApps(next);
      await saveBlockedApps(next);
      await syncBlockedApps(next);
    },
    [blockedApps],
  );

  const renderItem = ({item}) => (
    <AppListItem
      app={item}
      blocked={blockedApps.includes(item.packageName)}
      onToggle={handleToggle}
    />
  );

  const clearSelection = async () => {
    setBlockedApps([]);
    await saveBlockedApps([]);
    await syncBlockedApps([]);
  };

  const selectAll = async () => {
    const allPackages = installedApps.map(app => app.packageName);
    setBlockedApps(allPackages);
    await saveBlockedApps(allPackages);
    await syncBlockedApps(allPackages);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Blocked Apps</Text>
      <Text style={styles.subtitle}>
        Toggle the apps you want to block. Changes are applied instantly.
      </Text>
      <TextInput
        style={styles.search}
        placeholder="Search apps"
        value={query}
        onChangeText={setQuery}
      />
      <View style={styles.bulkActions}>
        <TouchableOpacity style={styles.bulkButton} onPress={selectAll}>
          <Text style={styles.bulkButtonText}>Select all</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bulkButton} onPress={clearSelection}>
          <Text style={styles.bulkButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredApps}
        keyExtractor={item => item.packageName}
        renderItem={renderItem}
        refreshing={loading}
        onRefresh={async () => {
          setLoading(true);
          const apps = await getInstalledApps();
          setInstalledApps(apps);
          setLoading(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    color: '#6b7280',
    marginBottom: 16,
  },
  search: {
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  bulkActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
    gap: 12,
  },
  bulkButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
  },
  bulkButtonText: {
    color: '#4f46e5',
    fontWeight: '600',
  },
});

export default BlockedAppsScreen;
