import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, View, StatusBar, AppState} from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import {
  AuthContext,
  hasPassword,
  storePassword,
  verifyPassword,
  changePassword,
  resetPasswordWithAnswer,
  getSecurityQuestion,
  createSessionTracker,
} from './src/services/AuthService';

const App = () => {
  const [isReady, setReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState('Onboarding');
  const [isAuthenticated, setAuthenticated] = useState(false);
  const session = useMemo(() => createSessionTracker(), []);

  useEffect(() => {
    const bootstrap = async () => {
      const passwordExists = await hasPassword();
      setInitialRoute(passwordExists ? 'Login' : 'Onboarding');
      setReady(true);
    };
    bootstrap();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'background' || !session.isSessionActive()) {
        setAuthenticated(false);
      }
    });
    return () => subscription.remove();
  }, [session]);

  const authContextValue = useMemo(
    () => ({
      isAuthenticated,
      hasPassword: initialRoute !== 'Onboarding',
      isSessionActive: session.isSessionActive(),
      trackActivity: session.trackActivity,
      async signIn(password) {
        const result = await verifyPassword(password);
        if (result.success) {
          setAuthenticated(true);
          session.trackActivity();
        }
        return result;
      },
      async signOut() {
        setAuthenticated(false);
      },
      async setPassword(password, question, answer) {
        await storePassword(password, question, answer);
        setInitialRoute('Login');
      },
      async changePassword(oldPassword, newPassword) {
        await changePassword(oldPassword, newPassword);
      },
      async getSecurityQuestion() {
        return getSecurityQuestion();
      },
      async resetPasswordWithAnswer(answer, newPassword) {
        const success = await resetPasswordWithAnswer(answer, newPassword);
        if (success) {
          setAuthenticated(false);
        }
        return success;
      },
    }),
    [isAuthenticated, initialRoute, session],
  );

  if (!isReady) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      <StatusBar barStyle="dark-content" />
      <AppNavigator initialRouteName={initialRoute} />
    </AuthContext.Provider>
  );
};

export default App;
