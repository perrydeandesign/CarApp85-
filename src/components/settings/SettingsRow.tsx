import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from '../../ui/Icon';
import { T } from '../../constants/theme';

type Variant = 'nav' | 'value' | 'destructive';

type Props = {
  icon?: string;
  label: string;
  value?: string;
  subtitle?: string;
  variant?: Variant;
  right?: React.ReactNode; // overrides the default chevron/value
  onPress?: () => void;
  last?: boolean; // suppress bottom divider
};

/**
 * One settings line: [icon] label ……… [value] [chevron | custom right].
 * variant='destructive' tints the label with T.danger and drops the chevron.
 */
export function SettingsRow({
  icon,
  label,
  value,
  subtitle,
  variant = 'nav',
  right,
  onPress,
  last,
}: Props) {
  const destructive = variant === 'destructive';
  const labelColor = destructive ? T.danger : T.tx;

  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 13,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: T.bd,
      }}
    >
      {icon ? (
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            backgroundColor: destructive ? 'rgba(248,113,113,0.12)' : T.accentDim,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Icon name={icon} size="sm" color={destructive ? T.danger : T.accent} />
        </View>
      ) : null}

      <View style={{ flex: 1 }}>
        <Text style={{ color: labelColor, fontSize: 15, fontWeight: '500' }}>{label}</Text>
        {subtitle ? (
          <Text style={{ color: T.mu, fontSize: 12, marginTop: 2 }} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {right !== undefined ? (
        right
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {value ? <Text style={{ color: T.mu, fontSize: 14, marginRight: 6 }}>{value}</Text> : null}
          {!destructive && onPress ? (
            <Icon name="chevron-forward" size="sm" color={T.mu} />
          ) : null}
        </View>
      )}
    </View>
  );

  if (!onPress) return content;
  return (
    <TouchableOpacity activeOpacity={0.6} onPress={onPress}>
      {content}
    </TouchableOpacity>
  );
}
