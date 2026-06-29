import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Avatar } from './Avatar';
import { T } from '../constants/theme';
import { CONNS } from '../data/users';

type Props = {
  onProfile?: (c: any) => void;
};

export function DiscoverSection({ onProfile }: Props) {
  const [followed, setFollowed] = useState<Record<string, boolean>>({});
  const cards = CONNS.slice(0, 6);

  return (
    <View style={{ paddingTop: 6, paddingBottom: 12 }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: '700',
          color: T.tx,
          paddingHorizontal: 16,
          marginBottom: 12,
        }}
      >
        Discover
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
      >
        {cards.map((c) => {
          const isFollowing = !!followed[c.user];
          return (
            <TouchableOpacity
              key={c.user}
              activeOpacity={0.85}
              onPress={() => onProfile?.(c)}
              style={{
                width: 120,
                backgroundColor: T.card,
                borderWidth: 1,
                borderColor: isFollowing ? T.accent : T.bd,
                borderRadius: 14,
                paddingVertical: 14,
                paddingHorizontal: 8,
                alignItems: 'center',
              }}
            >
              <Avatar initials={c.av} img={c.img} size={44} ring />
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: T.tx,
                  marginTop: 8,
                  marginBottom: 10,
                  maxWidth: '100%',
                }}
              >
                {c.user}
              </Text>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  setFollowed((p) => ({ ...p, [c.user]: !p[c.user] }));
                }}
                style={{
                  width: '100%',
                  paddingVertical: 6,
                  backgroundColor: isFollowing
                    ? 'rgba(0,201,167,0.10)'
                    : 'transparent',
                  borderWidth: 1.5,
                  borderColor: T.accent,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{ fontSize: 11, fontWeight: '700', color: T.accent }}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
