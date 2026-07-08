import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Avatar } from './Avatar';
import { T } from '../constants/theme';
import { supabase } from '../lib/supabase';
import { useMeProfile } from '../hooks/useMeProfile';

type Props = {
  onProfile?: (c: any) => void;
};

type SuggestedProfile = {
  id: string;
  username: string;
  avatar_url: string | null;
};

export function DiscoverSection({ onProfile }: Props) {
  const { data: me } = useMeProfile();
  const [cards, setCards] = useState<SuggestedProfile[]>([]);
  const [followed, setFollowed] = useState<Record<string, boolean>>({});

  // Live suggestions: real profiles (excluding the current user) plus the set
  // this user already follows, so the button reflects real state.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [profilesRes, followsRes] = await Promise.all([
        supabase.from('profiles').select('id, username, avatar_url').order('username').limit(12),
        me?.id
          ? supabase.from('follows').select('following_id').eq('follower_id', me.id)
          : Promise.resolve({ data: [] as { following_id: string }[] } as any),
      ]);
      if (cancelled) return;
      const list = ((profilesRes.data ?? []) as SuggestedProfile[])
        .filter((p) => p.id !== me?.id)
        .slice(0, 6);
      setCards(list);
      const initial: Record<string, boolean> = {};
      for (const row of (followsRes.data ?? []) as { following_id: string }[]) {
        initial[row.following_id] = true;
      }
      setFollowed(initial);
    })();
    return () => {
      cancelled = true;
    };
  }, [me?.id]);

  const toggleFollow = async (p: SuggestedProfile) => {
    const uid = me?.id;
    if (!uid || uid === p.id) return;
    const next = !followed[p.id];
    setFollowed((prev) => ({ ...prev, [p.id]: next })); // optimistic
    if (next) {
      const { error } = await supabase.from('follows').insert({ follower_id: uid, following_id: p.id });
      if (error && !/duplicate key/i.test(error.message)) {
        setFollowed((prev) => ({ ...prev, [p.id]: false })); // rollback
      }
    } else {
      const { error } = await supabase.from('follows').delete().eq('follower_id', uid).eq('following_id', p.id);
      if (error) setFollowed((prev) => ({ ...prev, [p.id]: true })); // rollback
    }
  };

  if (cards.length === 0) return null;

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
          const isFollowing = !!followed[c.id];
          return (
            <TouchableOpacity
              key={c.id}
              activeOpacity={0.85}
              onPress={() =>
                onProfile?.({ userId: c.id, id: c.id, user: c.username, username: c.username, img: c.avatar_url })
              }
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
              <Avatar initials={c.username?.[0]?.toUpperCase()} img={c.avatar_url || undefined} size={44} ring />
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
                {c.username}
              </Text>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  void toggleFollow(c);
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
