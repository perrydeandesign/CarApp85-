import React from 'react';
import { View, Text } from 'react-native';
import { T } from '../../constants/theme';

type Props = {
  title?: string;
  footer?: string;
  children: React.ReactNode;
};

/** Titled group of settings rows on a rounded card, IG/FB-style. */
export function SettingsSection({ title, footer, children }: Props) {
  return (
    <View style={{ marginTop: 22 }}>
      {title ? (
        <Text
          style={{
            color: T.mu,
            fontSize: 12,
            fontWeight: '700',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            marginLeft: 16,
            marginBottom: 8,
          }}
        >
          {title}
        </Text>
      ) : null}
      <View
        style={{
          backgroundColor: T.card,
          borderRadius: 14,
          marginHorizontal: 12,
          borderWidth: 1,
          borderColor: T.bd,
          overflow: 'hidden',
        }}
      >
        {children}
      </View>
      {footer ? (
        <Text style={{ color: T.mu, fontSize: 12, marginHorizontal: 16, marginTop: 8, lineHeight: 17 }}>
          {footer}
        </Text>
      ) : null}
    </View>
  );
}
