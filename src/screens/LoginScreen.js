import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {NativeModules} from 'react-native';
import PasswordInput from '../components/PasswordInput';
import {
  verifyPassword,
  getFailedAttempts,
  getSecurityQuestion,
  resetPasswordWithAnswer,
} from '../services/AuthService';

const LoginScreen = ({navigation}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isRecovery, setIsRecovery] = useState(false);
  const [blockedPackage, setBlockedPackage] = useState('');

  useEffect(() => {
    const loadState = async () => {
      const attempts = await getFailedAttempts();
      setFailedAttempts(attempts.count);
      setLocked(attempts.locked);
      const question = await getSecurityQuestion();
      setSecurityQuestion(question);
    };
    loadState();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const loadBlocked = async () => {
        if (NativeModules.AppBlockerModule) {
          const last = await NativeModules.AppBlockerModule.getLastBlockedPackage();
          setBlockedPackage(last);
        }
      };
      loadBlocked();
      return () => setBlockedPackage('');
    }, []),
  );

  const handleLogin = async () => {
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    const result = await verifyPassword(password);
    if (result.success) {
      navigation.reset({index: 0, routes: [{name: 'Home'}]});
      return;
    }
    const attempts = await getFailedAttempts();
    setFailedAttempts(attempts.count);
    setLocked(attempts.locked);
    setError('Incorrect password. Try again.');
  };

  const handleRecovery = async () => {
    if (!answer) {
      setError('Please answer the security question.');
      return;
    }
    try {
      const success = await resetPasswordWithAnswer(answer, password);
      if (!success) {
        setError('Security answer is incorrect.');
        return;
      }
      Alert.alert('Success', 'Password has been reset. Please log in again.');
      navigation.reset({index: 0, routes: [{name: 'Login'}]});
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome back</Text>
        {blockedPackage ? (
          <Text style={styles.banner}>
            {blockedPackage} was blocked. Enter your password to unlock temporarily.
          </Text>
        ) : null}
        {!isRecovery ? (
          <>
            <PasswordInput
              label="Password"
              value={password}
              onChangeText={text => {
                setPassword(text);
                setError('');
              }}
              placeholder="Enter password"
              error={error}
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Unlock</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.securityQuestion}>{securityQuestion}</Text>
            <PasswordInput
              label="Security Answer"
              value={answer}
              onChangeText={text => {
                setAnswer(text);
                setError('');
              }}
              placeholder="Enter your answer"
              error={error}
            />
            <PasswordInput
              label="New Password"
              value={password}
              onChangeText={text => {
                setPassword(text);
                setError('');
              }}
              placeholder="Choose a new password"
              error={error}
            />
            <TouchableOpacity style={styles.button} onPress={handleRecovery}>
              <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>
          </>
        )}
        <View style={styles.footerRow}>
          <TouchableOpacity onPress={() => setIsRecovery(prev => !prev)}>
            <Text style={styles.link}>{isRecovery ? 'Back to login' : 'Forgot password?'}</Text>
          </TouchableOpacity>
          <Text style={styles.attempts}>Attempts: {failedAttempts}/5</Text>
        </View>
        {locked ? (
          <Text style={styles.lockedMessage}>
            Too many attempts. Please wait a few minutes before trying again.
          </Text>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#1f293733',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    color: '#111827',
  },
  banner: {
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#4f46e5',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    alignItems: 'center',
  },
  link: {
    color: '#4f46e5',
    fontWeight: '600',
  },
  attempts: {
    color: '#6b7280',
  },
  lockedMessage: {
    marginTop: 12,
    color: '#dc2626',
    fontWeight: '500',
  },
  securityQuestion: {
    color: '#1f2937',
    marginBottom: 8,
  },
});

export default LoginScreen;
