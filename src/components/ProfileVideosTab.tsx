import React from 'react';
import { Text, View } from 'react-native';
import { T } from '../constants/theme';

export function ProfileVideosTab(_props: { videos?: string[] } = {}) {
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ color: T.mu, textAlign: 'center' }}>Videos will appear here</Text>
    </View>
  );
}
