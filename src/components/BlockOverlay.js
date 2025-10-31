import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

const BlockOverlay = ({appName, onUnlockPress, onClose}) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{appName} is blocked</Text>
        <Text style={styles.subtitle}>
          This app is currently blocked to help you stay focused.
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={onUnlockPress}>
          <Text style={styles.primaryButtonText}>Unblock Temporarily</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
          <Text style={styles.secondaryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827cc',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4f46e5',
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#4f46e5',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default BlockOverlay;
