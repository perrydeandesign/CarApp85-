import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type FollowUser = {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
};

/**
 * Live followers / following list for a profile. Two-step (ids → profiles) so
 * it doesn't depend on a specific FK-constraint name for the join.
 *  - 'followers': profiles who follow `profileId`
 *  - 'following': profiles that `profileId` follows
 */
export function useFollowList(
  profileId: string | null,
  type: 'followers' | 'following',
): { users: FollowUser[]; loading: boolean } {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profileId) {
      setUsers([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      // followers → match rows by following_id, take the follower_id column.
      const matchCol = type === 'followers' ? 'following_id' : 'follower_id';
      const pickCol = type === 'followers' ? 'follower_id' : 'following_id';

      const { data: rows } = await supabase.from('follows').select(pickCol).eq(matchCol, profileId);
      const ids = Array.from(new Set((rows ?? []).map((r: any) => r[pickCol]).filter(Boolean)));
      if (ids.length === 0) {
        if (!cancelled) {
          setUsers([]);
          setLoading(false);
        }
        return;
      }
      const { data: profs } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, bio')
        .in('id', ids);
      if (cancelled) return;
      setUsers((profs ?? []) as FollowUser[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [profileId, type]);

  return { users, loading };
}
