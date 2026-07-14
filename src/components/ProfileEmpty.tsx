import React from 'react';
import { View, Text } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { T } from '../constants/theme';

/**
 * Friendly empty state for profile tabs (garage / posts / videos) so a new or
 * sparse profile reads as intentional rather than broken. Copy is caller-driven
 * and typically owner-aware (encouraging CTA copy for `isMe`, neutral for
 * someone else's profile).
 */
export function ProfileEmpty({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={{ alignItems: 'center', paddingHorizontal: 32, paddingTop: 48, paddingBottom: 32, gap: 10 }}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: T.accentDim,
        }}
      >
        <MaterialCommunityIcons name={icon} size={30} color={T.accent} />
      </View>
      <Text style={{ color: T.tx, fontSize: 15, fontWeight: '700', textAlign: 'center' }}>{title}</Text>
      <Text style={{ color: T.mu, fontSize: 13, lineHeight: 19, textAlign: 'center' }}>{subtitle}</Text>
    </View>
  );
}
