import React from 'react';
import { Text, View } from 'react-native';
import { T } from '../constants/theme';

type LegacyComment = {
  id: number | string;
  user: string;
  text: string;
};

type Props = {
  comments?: LegacyComment[];
  /** Accepted but unused — preserves call-site compatibility with the legacy App.tsx component. */
  postId?: number | string;
};

/**
 * Legacy in-feed comments thread from the old App.tsx. The newer
 * server-backed thread lives at src/social/components/CommentsThread.tsx
 * and is what PostDetailScreen renders.
 */
export function CommentsThread({ comments = [] }: Props) {
  if (!comments || comments.length === 0) return null;
  return (
    <View style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
      {comments.map((c) => (
        <View key={c.id} style={{ flexDirection: 'row', marginBottom: 4 }}>
          <Text style={{ color: T.wh, fontWeight: '600', marginRight: 6 }}>{c.user}</Text>
          <Text style={{ color: T.wh, flexShrink: 1 }}>{c.text}</Text>
        </View>
      ))}
    </View>
  );
}
