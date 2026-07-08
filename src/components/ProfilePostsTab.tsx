import React from 'react';
import { Text, View } from 'react-native';
import { T } from '../constants/theme';

export function ProfilePostsTab(_props: { photos?: string[] } = {}) {
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ color: T.mu, textAlign: 'center' }}>Posts will appear here</Text>
    </View>
  );
}
