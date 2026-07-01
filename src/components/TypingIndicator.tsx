import React from 'react';
import { Text, View } from 'react-native';
import { T } from '../constants/theme';

/** Three-dot "typing…" indicator for the chat screen. */
export function TypingIndicator() {
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: T.card,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 14,
        marginVertical: 4,
        marginLeft: 12,
      }}
    >
      <Text style={{ color: T.mu, fontSize: 13 }}>typing…</Text>
    </View>
  );
}
