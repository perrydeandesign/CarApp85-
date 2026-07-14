import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SubPage } from '../../components/SubPage';
import { Icon } from '../../ui/Icon';
import { T } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

type Stats = { posts: number; likes: number; comments: number; saved: number };

async function countFor(table: string, col: string, uid: string): Promise<number> {
  const { count } = await supabase
    .from(table as any)
    .select('*', { count: 'exact', head: true })
    .eq(col, uid);
  return count ?? 0;
}

/** "Your activity" dashboard — a snapshot of what you've done on MODIFIED. */
export function YourActivity({ onClose }: { onClose: () => void }) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id;
      if (!uid) {
        if (!cancelled) setStats({ posts: 0, likes: 0, comments: 0, saved: 0 });
        return;
      }
      const [posts, likes, comments, saved] = await Promise.all([
        countFor('posts', 'profile_id', uid),
        countFor('post_likes', 'user_id', uid),
        countFor('post_comments', 'author_id', uid),
        countFor('saved_posts', 'user_id', uid),
      ]);
      if (!cancelled) setStats({ posts, likes, comments, saved });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const Card = ({ icon, label, value }: { icon: string; label: string; value: number }) => (
    <View
      style={{
        flex: 1,
        minWidth: '44%',
        backgroundColor: T.card,
        borderWidth: 1,
        borderColor: T.bd,
        borderRadius: 14,
        padding: 16,
      }}
    >
      <Icon name={icon} size="md" color={T.accent} />
      <Text style={{ color: T.tx, fontSize: 26, fontWeight: '800', marginTop: 8 }}>{value}</Text>
      <Text style={{ color: T.mu, fontSize: 13, marginTop: 2 }}>{label}</Text>
    </View>
  );

  return (
    <SubPage title="Your activity" onBack={onClose}>
      {!stats ? (
        <ActivityIndicator color={T.accent} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            <Card icon="grid-outline" label="Posts" value={stats.posts} />
            <Card icon="heart-outline" label="Likes given" value={stats.likes} />
            <Card icon="chatbubble-outline" label="Comments" value={stats.comments} />
            <Card icon="bookmark-outline" label="Saved" value={stats.saved} />
          </View>
        </ScrollView>
      )}
    </SubPage>
  );
}
