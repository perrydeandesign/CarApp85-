import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from '../ui/Icon';
import { T, TYPO, RADIUS } from '../constants/theme';

type Props = {
  title?: string;
  message?: string | null;
  onRetry?: () => void;
};

/** Canonical error + retry state — one look for every failed load. */
export function ErrorState({ title = "Couldn't load", message, onRetry }: Props) {
  return (
    <View style={{ alignItems: 'center', marginTop: 48, paddingHorizontal: 32 }}>
      <Icon name="cloud-offline-outline" size="xl" color={T.mu} />
      <Text style={{ color: T.tx, fontSize: TYPO.title.fontSize, fontWeight: '700', marginTop: 12 }}>{title}</Text>
      {message ? (
        <Text style={{ color: T.mu, fontSize: TYPO.caption.fontSize, textAlign: 'center', marginTop: 4 }}>
          {message}
        </Text>
      ) : null}
      {onRetry ? (
        <TouchableOpacity
          onPress={onRetry}
          style={{ marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, borderRadius: RADIUS.pill, backgroundColor: T.accent }}
        >
          <Text style={{ color: T.onAccent, fontWeight: '700' }}>Try again</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
