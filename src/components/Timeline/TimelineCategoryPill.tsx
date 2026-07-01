import React from 'react';
import { Text, View } from 'react-native';
import { CAT, TL_LABELS } from '../../constants/theme';
import type { TimelineCategory } from '../../types/database';

type Props = {
  category: TimelineCategory;
};

export function TimelineCategoryPill({ category }: Props) {
  const cc = CAT[category];
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: cc.border,
        backgroundColor: cc.bg,
      }}
    >
      <Text style={{ fontSize: 11, fontWeight: '700', color: cc.text }}>
        {TL_LABELS[category]}
      </Text>
    </View>
  );
}
