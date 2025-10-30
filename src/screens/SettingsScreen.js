import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Switch, Alert, ScrollView} from 'react-native';
import PasswordInput from '../components/PasswordInput';
import {changePassword, clearSensitiveData, saveSettings, getSettings} from '../services/AuthService';
import {resetAppData} from '../services/StorageService';

const SettingsRow = ({title, description, action}) => (
  <View style={styles.row}>
    <View style={styles.rowText}>
      <Text style={styles.rowTitle}>{title}</Text>
      {description ? <Text style={styles.rowDescription}>{description}</Text> : null}
    </View>
    {action}
  </View>
);

const SettingsScreen = ({navigation}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    const load = async () => {
      const settings = await getSettings();
      setNotificationsEnabled(settings.notificationsEnabled ?? true);
    };
    load();
  }, []);

  const handleChangePassword = async () => {
    try {
      if (!currentPassword || !newPassword) {
        Alert.alert('Missing information', 'Please fill in both password fields.');
        return;
      }
      await changePassword(currentPassword, newPassword);
      Alert.alert('Success', 'Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleResetApp = async () => {
    Alert.alert('Reset app', 'Are you sure you want to reset all settings?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          await resetAppData();
          await clearSensitiveData();
          navigation.reset({index: 0, routes: [{name: 'Onboarding'}]});
        },
      },
    ]);
  };

  const handleToggleNotifications = async value => {
    setNotificationsEnabled(value);
    await saveSettings({notificationsEnabled: value});
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>
      <SettingsRow
        title="Notifications"
        description="Receive alerts when a blocked app is opened."
        action={
          <Switch
            value={notificationsEnabled}
            onValueChange={handleToggleNotifications}
          />
        }
      />
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Change password</Text>
        <PasswordInput
          label="Current password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Enter current password"
        />
        <PasswordInput
          label="New password"
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Enter new password"
        />
        <TouchableOpacity style={styles.primaryButton} onPress={handleChangePassword}>
          <Text style={styles.primaryButtonText}>Update password</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Danger zone</Text>
        <TouchableOpacity style={styles.dangerButton} onPress={handleResetApp}>
          <Text style={styles.dangerButtonText}>Reset app</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>
          Focus Guardian uses an accessibility service and overlay permissions to
          monitor the apps you choose to block. We respect your privacy and do not
          collect personal data. Visit the documentation for a full walkthrough.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  rowText: {
    flex: 1,
    marginRight: 16,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  rowDescription: {
    color: '#6b7280',
  },
  section: {
    marginTop: 24,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: '#fee2e2',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#dc2626',
    fontWeight: '700',
  },
  aboutText: {
    color: '#475569',
    lineHeight: 20,
  },
});

export default SettingsScreen;
