import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle } from 'react-native';
import { T, RADIUS, TYPO } from '../constants/theme';
import { haptic } from '../lib/haptics';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
};

/**
 * Canonical primary call-to-action. Teal accent fill with dark on-accent text
 * (white-on-teal fails WCAG). Use for the main action on a screen/sheet:
 * Save, Create, Host, etc.
 */
export function PrimaryButton({ label, onPress, loading, disabled, icon, style }: Props) {
  const off = disabled || loading;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => {
        haptic('light');
        onPress();
      }}
      disabled={off}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          backgroundColor: T.accent,
          borderRadius: RADIUS.md,
          paddingVertical: 14,
          paddingHorizontal: 20,
          opacity: off ? 0.6 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={T.onAccent} />
      ) : (
        <>
          {icon}
          <Text style={{ color: T.onAccent, fontSize: TYPO.body.fontSize, fontWeight: '700' }}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
