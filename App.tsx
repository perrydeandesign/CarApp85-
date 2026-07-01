import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider } from './src/auth/useAuth';
import { ConversationsProvider } from './src/hooks/useConversations';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { initObservability } from './src/lib/observability';
import { linking } from './src/navigation/linking';

// Init crash reporting once at startup (no-op until a Sentry DSN is configured).
initObservability();

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ConversationsProvider>
          <NavigationContainer linking={linking}>
            <AppNavigator />
          </NavigationContainer>
        </ConversationsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
