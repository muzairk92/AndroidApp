import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import PasswordInput from '../components/PasswordInput';
import {storePassword} from '../services/AuthService';
import {ensureAllPermissions} from '../utils/permissions';

const SetPasswordScreen = ({navigation}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('What motivates you?');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [error, setError] = useState('');

  const onContinue = async () => {
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await storePassword(password, securityQuestion, securityAnswer);
      await ensureAllPermissions();
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
    } catch (err) {
      Alert.alert('Error', err.message || 'Unable to save password.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create your password</Text>
      <PasswordInput
        label="Password"
        value={password}
        onChangeText={text => {
          setPassword(text);
          setError('');
        }}
        placeholder="Enter a secure password"
        error={error}
      />
      <PasswordInput
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={text => {
          setConfirmPassword(text);
          setError('');
        }}
        placeholder="Repeat your password"
        error={error}
      />
      <PasswordInput
        label="Security Answer"
        value={securityAnswer}
        onChangeText={setSecurityAnswer}
        placeholder="Answer to security question"
      />
      <Text style={styles.securityQuestionLabel}>Security Question</Text>
      <Text style={styles.securityQuestion}>{securityQuestion}</Text>
      <TouchableOpacity style={styles.button} onPress={onContinue}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
    color: '#1f2937',
  },
  securityQuestionLabel: {
    marginTop: 8,
    color: '#6b7280',
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  securityQuestion: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default SetPasswordScreen;
