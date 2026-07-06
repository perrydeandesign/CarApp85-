import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider } from './src/auth/useAuth';
import { ConversationsProvider } from './src/hooks/useConversations';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { ShareProvider } from './src/components/ShareProvider';
import { initObservability } from './src/lib/observability';
import { linking } from './src/navigation/linking';
import { AppPrefsProvider } from './src/context/AppPrefsContext';

// Init crash reporting once at startup (no-op until a Sentry DSN is configured).
initObservability();

export default function App() {
  return (
    <ErrorBoundary>
      <AppPrefsProvider>
        <AuthProvider>
          <ConversationsProvider>
            <ShareProvider>
              <NavigationContainer linking={linking}>
                <AppNavigator />
              </NavigationContainer>
            </ShareProvider>
          </ConversationsProvider>
        </AuthProvider>
      </AppPrefsProvider>
    </ErrorBoundary>
  );
}
