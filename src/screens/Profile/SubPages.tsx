import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { T } from '../../constants/theme';
import { Avatar } from '../../components/Avatar';
import { FadeInImage } from '../../ui/FadeInImage';
import { supabase } from '../../lib/supabase';
import { useMeProfile } from '../../hooks/useMeProfile';
import { useProfilePosts } from '../../hooks/useProfileData';
import { useFollowList, type FollowUser } from '../../hooks/useFollowList';

type SubPageProps = {
  onProfile?: (p: any) => void;
  onOpenProfile?: (p: any) => void;
  user?: any;
  onClose?: () => void;
  onOpenPost?: (id: string) => void;
};

/** Posts — the profile's real posts as a 3-column photo grid. */
export function PostsPage({ user, onOpenPost }: SubPageProps) {
  const { data, loading } = useProfilePosts(user?.id ?? null);
  const grid = (data ?? [])
    .map((p: any) => ({ id: p.id, url: p.post_media?.[0]?.media_url ?? null }))
    .filter((p: { url: string | null }) => !!p.url);

  if (loading && grid.length === 0) return <View style={{ paddingTop: 48 }}><ActivityIndicator color={T.accent} /></View>;
  if (grid.length === 0) return <EmptyList label="No posts yet" />;

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {grid.map((p) => (
        <TouchableOpacity
          key={p.id}
          activeOpacity={0.85}
          onPress={() => onOpenPost?.(p.id)}
          style={{ width: '33.3333%', aspectRatio: 1, padding: 1 }}
        >
          <FadeInImage source={{ uri: p.url! }} containerStyle={{ width: '100%', height: '100%' }} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

// Navigation object Profile.tsx expects when a row is tapped.
const toConn = (u: FollowUser) => ({
  userId: u.id,
  id: u.id,
  user: u.username,
  username: u.username,
  img: u.avatar_url,
});

function EmptyList({ label }: { label: string }) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 48, gap: 8 }}>
      <Text style={{ color: T.mu, fontSize: 13 }}>{label}</Text>
    </View>
  );
}

/** Followers — profiles that follow this user. */
export function ConnectedPage({ user, onProfile, onOpenProfile }: SubPageProps) {
  const handler = onProfile || onOpenProfile || (() => {});
  const { users, loading } = useFollowList(user?.id ?? null, 'followers');

  if (loading) return <View style={{ paddingTop: 48 }}><ActivityIndicator color={T.accent} /></View>;
  if (users.length === 0) return <EmptyList label="No followers yet" />;

  return (
    <View>{users.map((c) => (
      <TouchableOpacity key={c.id} onPress={() => handler(toConn(c))} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: T.bd }}>
        <Avatar initials={c.username?.[0]?.toUpperCase()} size={44} ring img={c.avatar_url || undefined} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: T.tx }}>{c.username}</Text>
          {c.bio ? <Text numberOfLines={1} style={{ fontSize: 12, color: T.mu, marginTop: 2 }}>{c.bio}</Text> : null}
        </View>
      </TouchableOpacity>
    ))}</View>
  );
}

/** Following — profiles this user follows, with a live Follow/Unfollow toggle. */
export function ConnectionsPage({ user, onProfile, onOpenProfile }: SubPageProps) {
  const handler = onProfile || onOpenProfile || (() => {});
  const { data: me } = useMeProfile();
  const { users, loading } = useFollowList(user?.id ?? null, 'following');
  const [followed, setFollowed] = useState<Record<string, boolean>>({});

  // Seed the toggle state from who the current user already follows.
  useEffect(() => {
    if (!me?.id || users.length === 0) return;
    let cancelled = false;
    supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', me.id)
      .in('following_id', users.map((u) => u.id))
      .then(({ data }) => {
        if (cancelled) return;
        const map: Record<string, boolean> = {};
        for (const r of (data ?? []) as { following_id: string }[]) map[r.following_id] = true;
        setFollowed(map);
      });
    return () => { cancelled = true; };
  }, [me?.id, users]);

  const toggle = async (id: string) => {
    const uid = me?.id;
    if (!uid || uid === id) return;
    const next = !followed[id];
    setFollowed((prev) => ({ ...prev, [id]: next }));
    if (next) {
      const { error } = await supabase.from('follows').insert({ follower_id: uid, following_id: id });
      if (error && !/duplicate key/i.test(error.message)) setFollowed((prev) => ({ ...prev, [id]: false }));
    } else {
      const { error } = await supabase.from('follows').delete().eq('follower_id', uid).eq('following_id', id);
      if (error) setFollowed((prev) => ({ ...prev, [id]: true }));
    }
  };

  if (loading) return <View style={{ paddingTop: 48 }}><ActivityIndicator color={T.accent} /></View>;
  if (users.length === 0) return <EmptyList label="Not following anyone yet" />;

  return (
    <View>{users.map((c) => {
      const isFollowing = !!followed[c.id];
      const isSelf = me?.id === c.id;
      return (
        <TouchableOpacity key={c.id} onPress={() => handler(toConn(c))} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: T.bd }}>
          <Avatar initials={c.username?.[0]?.toUpperCase()} size={44} ring img={c.avatar_url || undefined} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: T.tx }}>{c.username}</Text>
            {c.bio ? <Text numberOfLines={1} style={{ fontSize: 12, color: T.mu, marginTop: 2 }}>{c.bio}</Text> : null}
          </View>
          {!isSelf && (
            <TouchableOpacity
              onPress={() => void toggle(c.id)}
              style={{ paddingHorizontal: 16, paddingVertical: 7, backgroundColor: isFollowing ? T.card2 : T.accent, borderWidth: 1, borderColor: isFollowing ? T.bd : T.accent, borderRadius: 20 }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: isFollowing ? T.tx2 : '#051210' }}>{isFollowing ? 'Following' : 'Follow'}</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      );
    })}</View>
  );
}
