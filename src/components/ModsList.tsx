import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '../ui/Icon';
import { T } from '../constants/theme';

const VISIBLE_LIMIT = 3;

type Props = {
  items: string[];
  categoryLabel: string;
};

/**
 * Bullet-list of mods with collapse/expand. Defaults to showing 3; "+N more"
 * reveals the rest. Matches the existing dark/teal theme + bullet style.
 */
export function ModsList({ items, categoryLabel }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0) {
    return (
      <Text style={{ fontSize: 12, color: T.mu, paddingVertical: 6, marginTop: 16 }}>
        No mods yet for {categoryLabel}.
      </Text>
    );
  }

  const visible = expanded ? items : items.slice(0, VISIBLE_LIMIT);
  const hidden = items.length - VISIBLE_LIMIT;

  return (
    <View style={{ marginTop: 16 }}>
      {visible.map((m, i) => (
        <View
          key={`${categoryLabel}-${i}`}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingVertical: 6,
          }}
        >
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: T.accent,
            }}
          />
          <Text style={{ fontSize: 13, color: T.wh, flex: 1 }}>{m}</Text>
        </View>
      ))}

      {hidden > 0 ? (
        <TouchableOpacity
          onPress={() => setExpanded((p) => !p)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingVertical: 8,
          }}
        >
          <Icon
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={T.accent}
          />
          <Text style={{ fontSize: 12, fontWeight: '700', color: T.accent }}>
            {expanded ? 'Show less' : 'Show more'}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
