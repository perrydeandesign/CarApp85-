import React from 'react';
import { Text, View } from 'react-native';
import { T } from '../constants/theme';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { captureError } from '../lib/observability';

type Props = { children: React.ReactNode };
type State = { error: Error | null };

/**
 * App-wide crash guard. Catches render/runtime errors anywhere below it, reports
 * them (Sentry seam) and shows a branded recovery screen instead of a white
 * crash. "Try again" remounts the subtree.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    captureError(error, { componentStack: info.componentStack });
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <View
        style={{
          flex: 1,
          backgroundColor: T.bg,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
          gap: 14,
        }}
      >
        <Icon name="warning" size="xl" color={T.accent} />
        <Text style={{ color: T.tx, fontSize: 18, fontWeight: '800' }}>Something went wrong</Text>
        <Text style={{ color: T.mu, fontSize: 13, textAlign: 'center', lineHeight: 19 }}>
          The screen hit an unexpected error. It's been logged — try again.
        </Text>
        <Button label="Try again" variant="primary" size="md" onPress={this.reset} style={{ marginTop: 6 }} />
      </View>
    );
  }
}
