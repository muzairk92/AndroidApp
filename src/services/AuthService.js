import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {sha256} from 'js-sha256';
import {createContext} from 'react';

const PASSWORD_SERVICE = 'APP_BLOCKER_PASSWORD';
const SETTINGS_KEY = 'APP_BLOCKER_SETTINGS';
const FAILED_ATTEMPTS_KEY = 'APP_BLOCKER_FAILED_ATTEMPTS';
const SESSION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export const AuthContext = createContext({
  isAuthenticated: false,
  hasPassword: false,
  isSessionActive: false,
  signIn: async () => {},
  signOut: async () => {},
  setPassword: async () => {},
  changePassword: async () => {},
  getSecurityQuestion: async () => '',
  resetPasswordWithAnswer: async () => false,
  trackActivity: () => {},
});

export const getSettings = async () => {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.warn('Failed to load settings', error);
    return {};
  }
};

export const saveSettings = async settings => {
  try {
    const nextSettings = {...(await getSettings()), ...settings};
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(nextSettings));
    return nextSettings;
  } catch (error) {
    console.error('Failed to save settings', error);
    throw error;
  }
};

export const hasPassword = async () => {
  const credentials = await Keychain.getGenericPassword({service: PASSWORD_SERVICE});
  return Boolean(credentials);
};

export const storePassword = async (password, securityQuestion, securityAnswer) => {
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }
  await Keychain.setGenericPassword('user', password, {
    service: PASSWORD_SERVICE,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  if (securityQuestion && securityAnswer) {
    await saveSettings({
      securityQuestion,
      securityAnswerHash: sha256(securityAnswer.trim().toLowerCase()),
    });
  }
  await AsyncStorage.removeItem(FAILED_ATTEMPTS_KEY);
};

export const verifyPassword = async password => {
  const credentials = await Keychain.getGenericPassword({service: PASSWORD_SERVICE});
  if (!credentials) {
    return {success: false, reason: 'NO_PASSWORD'};
  }
  const success = credentials.password === password;
  await trackFailedAttempts(success);
  return {success};
};

export const changePassword = async (oldPassword, newPassword) => {
  const verification = await verifyPassword(oldPassword);
  if (!verification.success) {
    throw new Error('The current password is incorrect.');
  }
  await storePassword(newPassword);
};

export const trackFailedAttempts = async success => {
  if (success) {
    await AsyncStorage.removeItem(FAILED_ATTEMPTS_KEY);
    return {count: 0, locked: false};
  }
  const rawCount = await AsyncStorage.getItem(FAILED_ATTEMPTS_KEY);
  const count = rawCount ? parseInt(rawCount, 10) + 1 : 1;
  const locked = count >= 5;
  await AsyncStorage.setItem(FAILED_ATTEMPTS_KEY, count.toString());
  return {count, locked};
};

export const getFailedAttempts = async () => {
  const rawCount = await AsyncStorage.getItem(FAILED_ATTEMPTS_KEY);
  const count = rawCount ? parseInt(rawCount, 10) : 0;
  return {
    count,
    locked: count >= 5,
  };
};

export const getSecurityQuestion = async () => {
  const settings = await getSettings();
  return settings.securityQuestion || '';
};

export const resetPasswordWithAnswer = async (answer, newPassword) => {
  const settings = await getSettings();
  if (!settings.securityAnswerHash) {
    throw new Error('Security question has not been configured.');
  }
  if (sha256(answer.trim().toLowerCase()) !== settings.securityAnswerHash) {
    return false;
  }
  await storePassword(newPassword);
  return true;
};

export const clearSensitiveData = async () => {
  await Keychain.resetGenericPassword({service: PASSWORD_SERVICE});
  await AsyncStorage.multiRemove([FAILED_ATTEMPTS_KEY, SETTINGS_KEY]);
};

export const createSessionTracker = () => {
  let lastInteraction = Date.now();
  const trackActivity = () => {
    lastInteraction = Date.now();
  };
  const isSessionActive = () => Date.now() - lastInteraction < SESSION_TIMEOUT_MS;
  return {trackActivity, isSessionActive};
};
