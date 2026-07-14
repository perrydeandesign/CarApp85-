import React from 'react';
import { View, Text } from 'react-native';

export function ModifiedLogo() {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 32, fontWeight: '900', color: 'white' }}>MODIFIED</Text>
      <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#3B82F6' }} />
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FBBF24' }} />
      </View>
    </View>
  );
}
