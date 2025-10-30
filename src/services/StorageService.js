import AsyncStorage from '@react-native-async-storage/async-storage';

const BLOCKED_APPS_KEY = 'BLOCKED_APPS';
const PERMISSION_STATE_KEY = 'PERMISSION_STATE';
const DASHBOARD_STATS_KEY = 'DASHBOARD_STATS';

export const loadBlockedApps = async () => {
  const json = await AsyncStorage.getItem(BLOCKED_APPS_KEY);
  return json ? JSON.parse(json) : [];
};

export const saveBlockedApps = async appIds => {
  await AsyncStorage.setItem(BLOCKED_APPS_KEY, JSON.stringify(appIds));
};

export const loadPermissionState = async () => {
  const json = await AsyncStorage.getItem(PERMISSION_STATE_KEY);
  return json ? JSON.parse(json) : {};
};

export const savePermissionState = async state => {
  await AsyncStorage.setItem(PERMISSION_STATE_KEY, JSON.stringify(state));
};

export const loadDashboardStats = async () => {
  const json = await AsyncStorage.getItem(DASHBOARD_STATS_KEY);
  if (!json) {
    return {
      totalBlocks: 0,
      timeSavedMinutes: 0,
      lastReset: new Date().toISOString(),
    };
  }
  return JSON.parse(json);
};

export const updateDashboardStats = async updateFn => {
  const current = await loadDashboardStats();
  const updated = updateFn(current);
  await AsyncStorage.setItem(DASHBOARD_STATS_KEY, JSON.stringify(updated));
  return updated;
};

export const resetAppData = async () => {
  await AsyncStorage.multiRemove([
    BLOCKED_APPS_KEY,
    PERMISSION_STATE_KEY,
    DASHBOARD_STATS_KEY,
  ]);
};
