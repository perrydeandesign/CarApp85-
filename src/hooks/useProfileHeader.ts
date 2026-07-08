import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type ProfileHeader = {
  username: string | null;
  avatarUrl: string | null;
  bio: string | null;
  followers: number;
  following: number;
  posts: number;
};

/**
 * Live profile-header data — bio, avatar, and follower/following/post counts —
 * for a given profile id. Replaces the demo-derived header fields on Profile so
 * a real user's profile shows their real bio and real counts (instead of a
 * generic bio and 0/0 stats).
 */
export function useProfileHeader(profileId: string | null): ProfileHeader | null {
  const [data, setData] = useState<ProfileHeader | null>(null);

  useEffect(() => {
    if (!profileId) {
      setData(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const [prof, followers, following, posts] = await Promise.all([
        supabase.from('profiles').select('username, avatar_url, bio').eq('id', profileId).maybeSingle(),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profileId),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profileId),
        supabase.from('posts').select('*', { count: 'exact', head: true }).eq('profile_id', profileId),
      ]);
      if (cancelled) return;
      setData({
        username: prof.data?.username ?? null,
        avatarUrl: prof.data?.avatar_url ?? null,
        bio: prof.data?.bio ?? null,
        followers: followers.count ?? 0,
        following: following.count ?? 0,
        posts: posts.count ?? 0,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [profileId]);

  return data;
}
