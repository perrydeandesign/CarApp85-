import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SubPage } from '../../components/SubPage';
import { Avatar } from '../../components/Avatar';
import { ErrorState } from '../../components/ErrorState';
import { T } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

type Person = { id: string; username: string | null; avatar_url: string | null; bio: string | null };

/**
 * "Discover people" — suggested accounts to follow (cold-start fix). Lists
 * profiles the current user doesn't already follow, with inline Follow.
 */
export function DiscoverPeople({ onClose }: { onClose: () => void }) {
  const [people, setPeople] = useState<Person[]>([]);
  const [followed, setFollowed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const me = sess.session?.user?.id ?? null;
      setUid(me);

      const [profilesRes, followsRes] = await Promise.all([
        supabase.from('profiles').select('id, username, avatar_url, bio').limit(50),
        me
          ? supabase.from('follows').select('following_id').eq('follower_id', me)
          : Promise.resolve({ data: [] as any[] } as any),
      ]);
      if (profilesRes.error) throw profilesRes.error;

      const followingIds = new Set((followsRes.data ?? []).map((r: any) => r.following_id));
      const suggestions = (profilesRes.data ?? []).filter(
        (p: any) => p.id !== me && !followingIds.has(p.id),
      );
      setPeople(suggestions as Person[]);
    } catch (e: any) {
      setError(e?.message ?? 'Could not load suggestions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const follow = async (personId: string) => {
    if (!uid) return;
    setFollowed((prev) => new Set(prev).add(personId)); // optimistic
    const { error } = await supabase.from('follows').insert({ follower_id: uid, following_id: personId });
    if (error && !/duplicate key/i.test(error.message)) {
      setFollowed((prev) => {
        const next = new Set(prev);
        next.delete(personId);
        return next;
      });
    }
  };

  return (
    <SubPage title="Discover people" onBack={onClose}>
      {loading ? (
        <ActivityIndicator color={T.accent} style={{ marginTop: 40 }} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : people.length === 0 ? (
        <Text style={{ color: T.mu, textAlign: 'center', marginTop: 40 }}>No suggestions right now.</Text>
      ) : (
        <ScrollView contentContainerStyle={{ paddingVertical: 8 }}>
          {people.map((p) => {
            const isFollowing = followed.has(p.id);
            return (
              <View
                key={p.id}
                style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 }}
              >
                <Avatar initials={(p.username ?? 'U').slice(0, 1).toUpperCase()} size={44} img={p.avatar_url ?? undefined} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: T.tx, fontSize: 15, fontWeight: '600' }} numberOfLines={1}>
                    {p.username ?? 'user'}
                  </Text>
                  {p.bio ? (
                    <Text style={{ color: T.mu, fontSize: 12, marginTop: 1 }} numberOfLines={1}>
                      {p.bio}
                    </Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  disabled={isFollowing}
                  onPress={() => follow(p.id)}
                  style={{
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 7,
                    backgroundColor: isFollowing ? T.card2 : T.accent,
                  }}
                >
                  <Text style={{ color: isFollowing ? T.mu : '#fff', fontSize: 13, fontWeight: '700' }}>
                    {isFollowing ? 'Following' : 'Follow'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SubPage>
  );
}
