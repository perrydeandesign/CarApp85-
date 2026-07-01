import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { T } from '../constants/theme';

const REACTIONS = ['❤️', '😂', '😮', '🔥', '👍', '😢'] as const;

type Props = {
  visible?: boolean;
  onPick?: (emoji: string) => void;
};

/** Quick-reaction emoji bar — used to react to a chat message. */
export function ReactionPicker({ visible = true, onPick }: Props) {
  if (!visible) return null;
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 6,
        backgroundColor: T.card,
        padding: 6,
        borderRadius: 18,
        alignSelf: 'flex-start',
      }}
    >
      {REACTIONS.map((r) => (
        <TouchableOpacity
          key={r}
          onPress={() => onPick?.(r)}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Text style={{ fontSize: 20 }}>{r}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
