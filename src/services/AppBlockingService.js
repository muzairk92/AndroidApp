import {NativeModules, NativeEventEmitter, Platform} from 'react-native';
import {updateDashboardStats} from './StorageService';

const {AppBlockerModule} = NativeModules;

const emitter = AppBlockerModule
  ? new NativeEventEmitter(AppBlockerModule)
  : {addListener: () => ({remove: () => {}})};

const BLOCK_EVENT = 'AppBlockedEvent';
let subscription;

export const requestServicePermissions = async () => {
  if (!AppBlockerModule || Platform.OS !== 'android') {
    return {granted: true};
  }
  const result = await AppBlockerModule.requestAllPermissions();
  return result;
};

export const getInstalledApps = async () => {
  if (!AppBlockerModule || Platform.OS !== 'android') {
    return [];
  }
  const apps = await AppBlockerModule.getInstalledApps();
  return apps.sort((a, b) => a.label.localeCompare(b.label));
};

export const setBlockedApps = async packageNames => {
  if (!AppBlockerModule || Platform.OS !== 'android') {
    return;
  }
  await AppBlockerModule.setBlockedApps(packageNames);
};

export const listenForBlocks = onBlocked => {
  if (subscription) {
    subscription.remove();
  }
  subscription = emitter.addListener(BLOCK_EVENT, async event => {
    onBlocked(event);
    await updateDashboardStats(stats => ({
      ...stats,
      totalBlocks: stats.totalBlocks + 1,
      timeSavedMinutes: stats.timeSavedMinutes + 5,
    }));
  });
};

export const stopListening = () => {
  if (subscription) {
    subscription.remove();
    subscription = undefined;
  }
};

export const showBlockingOverlay = async packageName => {
  if (!AppBlockerModule || Platform.OS !== 'android') {
    return;
  }
  await AppBlockerModule.showBlockingOverlay(packageName);
};

export const hideBlockingOverlay = async () => {
  if (!AppBlockerModule || Platform.OS !== 'android') {
    return;
  }
  await AppBlockerModule.hideBlockingOverlay();
};

export default {
  requestServicePermissions,
  getInstalledApps,
  setBlockedApps,
  listenForBlocks,
  stopListening,
  showBlockingOverlay,
  hideBlockingOverlay,
};
