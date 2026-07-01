import React from 'react';
import { View, Text, Switch } from 'react-native';
import { Icon } from '../../ui/Icon';
import { T } from '../../constants/theme';
import { useFontScale } from '../../context/AppPrefsContext';

type Props = {
  icon?: string;
  label: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
  last?: boolean;
};

/** Settings line with a trailing Switch (device/account boolean prefs). */
export function SettingsToggleRow({
  icon,
  label,
  subtitle,
  value,
  onValueChange,
  disabled,
  last,
}: Props) {
  const fs = useFontScale();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 11,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: T.bd,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {icon ? (
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            backgroundColor: T.accentDim,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Icon name={icon} size="sm" color={T.accent} />
        </View>
      ) : null}

      <View style={{ flex: 1, marginRight: 10 }}>
        <Text style={{ color: T.tx, fontSize: 15 * fs, fontWeight: '500' }}>{label}</Text>
        {subtitle ? (
          <Text style={{ color: T.mu, fontSize: 12 * fs, marginTop: 2 }}>{subtitle}</Text>
        ) : null}
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: T.card2, true: T.accent }}
        thumbColor="#FFFFFF"
        ios_backgroundColor={T.card2}
      />
    </View>
  );
}
