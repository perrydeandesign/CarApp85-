import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from '../ui/Icon';
import { T, TYPO } from '../constants/theme';

type Props = {
  title: string;
  onBack?: () => void;
  /** Optional trailing action (e.g. a compose button). */
  right?: React.ReactNode;
};

/**
 * Canonical top bar for screens that need a header with an optional back button
 * and trailing action — the same look as SubPage, for surfaces that also need a
 * right-side control (Messaging, Vendor sub-screens). One title size (h2), one
 * back affordance, one divider.
 */
export function ScreenHeader({ title, onBack, right }: Props) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: T.bd,
      }}
    >
      {onBack ? (
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={{ marginRight: 12 }}>
          <Icon name="chevron-back" size="md" color={T.tx} />
        </TouchableOpacity>
      ) : null}
      <Text style={{ color: T.tx, fontSize: TYPO.h2.fontSize, fontWeight: TYPO.h2.fontWeight, flex: 1 }} numberOfLines={1}>
        {title}
      </Text>
      {right}
    </View>
  );
}
