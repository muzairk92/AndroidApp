import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const steps = [
  {
    icon: 'shield-lock',
    title: 'Protect your focus',
    description: 'Choose which apps to block and stay productive throughout the day.',
  },
  {
    icon: 'account-lock',
    title: 'Secure access',
    description: 'Set a password and security question so only you can make changes.',
  },
  {
    icon: 'clock-check',
    title: 'Track progress',
    description: 'See how much time you save by reducing distractions.',
  },
];

const OnboardingScreen = ({navigation}) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Welcome to Focus Guardian</Text>
      {steps.map(step => (
        <View key={step.title} style={styles.card}>
          <Icon name={step.icon} size={32} color="#4f46e5" style={styles.icon} />
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>
        </View>
      ))}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('SetPassword')}>
        <Text style={styles.buttonText}>Get Started</Text>
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
  header: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
    color: '#1e293b',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#1f293733',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  icon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    color: '#6b7280',
  },
  button: {
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default OnboardingScreen;
