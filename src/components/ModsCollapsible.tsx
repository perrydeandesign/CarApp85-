import React from 'react';
import { Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { T } from '../constants/theme';

type Props = {
  mods?: string[];
};

export function ModsCollapsible({ mods = [] }: Props) {
  if (!mods || mods.length === 0) {
    return <Text style={{ color: T.mu, marginTop: 8 }}>No mods listed</Text>;
  }
  return (
    <View style={{ marginTop: 12 }}>
      {mods.map((m, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6 }}>
          <Ionicons name="checkmark-circle" size={14} color={T.accent} />
          <Text style={{ color: T.wh, marginLeft: 8, fontSize: 13 }}>{m}</Text>
        </View>
      ))}
    </View>
  );
}
