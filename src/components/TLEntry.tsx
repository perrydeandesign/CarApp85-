import React from 'react';
import { Text, View } from 'react-native';
import { T } from '../constants/theme';
import type { TimelineEntry } from '../constants/types';

type Props = { entry: TimelineEntry };

export function TLEntry({ entry }: Props) {
  const title = (entry as any).title ?? '';
  const desc = (entry as any).desc ?? '';
  return (
    <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: T.bd }}>
      {title ? <Text style={{ color: T.wh, fontWeight: '700' }}>{title}</Text> : null}
      {desc ? <Text style={{ color: T.mu, marginTop: 4 }}>{desc}</Text> : null}
    </View>
  );
}
