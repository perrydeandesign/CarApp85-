import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../auth/useAuth';
import AuthNavigator from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { T } from '../constants/theme';
import { SKIP_AUTH } from '../config';

export function AppNavigator() {
  const { session, loading } = useAuth();

  // Demo mode: skip the login gate. Real auth still works when a session exists.
  if (SKIP_AUTH) {
    return <MainNavigator />;
  }

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: T.bg,
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session) {
    return <AuthNavigator />;
  }

  return <MainNavigator />;
}
