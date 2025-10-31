import {Linking, Platform} from 'react-native';
import Permissions, {PERMISSIONS as RN_PERMISSIONS} from 'react-native-permissions';
import {PERMISSIONS as CUSTOM_PERMISSIONS} from './constants';

export const requestUsageStatsPermission = async () => {
  if (Platform.OS !== 'android') {
    return true;
  }
  const status = await Permissions.check(RN_PERMISSIONS.ANDROID.PACKAGE_USAGE_STATS);
  if (status === 'granted') {
    return true;
  }
  await Permissions.request(RN_PERMISSIONS.ANDROID.PACKAGE_USAGE_STATS);
  const finalStatus = await Permissions.check(RN_PERMISSIONS.ANDROID.PACKAGE_USAGE_STATS);
  if (finalStatus !== 'granted') {
    await Linking.openSettings();
    return false;
  }
  return true;
};

export const requestOverlayPermission = async () => {
  if (Platform.OS !== 'android') {
    return true;
  }
  const status = await Permissions.check(RN_PERMISSIONS.ANDROID.SYSTEM_ALERT_WINDOW);
  if (status === 'granted') {
    return true;
  }
  const result = await Permissions.request(RN_PERMISSIONS.ANDROID.SYSTEM_ALERT_WINDOW);
  if (result !== 'granted') {
    await Linking.openSettings();
    return false;
  }
  return true;
};

export const ensureAllPermissions = async () => {
  if (Platform.OS !== 'android') {
    return {granted: true};
  }
  const usageGranted = await requestUsageStatsPermission();
  const overlayGranted = await requestOverlayPermission();
  return {
    granted: usageGranted && overlayGranted,
    details: {
      [CUSTOM_PERMISSIONS.usageStats]: usageGranted,
      [CUSTOM_PERMISSIONS.overlay]: overlayGranted,
    },
  };
};
