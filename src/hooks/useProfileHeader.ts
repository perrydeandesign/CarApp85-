import { supabase } from '../lib/supabase';
import { useCachedQuery } from './useCachedQuery';

export type ProfileHeader = {
  username: string | null;
  avatarUrl: string | null;
  bio: string | null;
  followers: number;
  following: number;
  posts: number;
};

async function fetchProfileHeader(profileId: string): Promise<ProfileHeader> {
  const [prof, followers, following, posts] = await Promise.all([
    supabase.from('profiles').select('username, avatar_url, bio').eq('id', profileId).maybeSingle(),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profileId),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profileId),
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('profile_id', profileId),
  ]);
  return {
    username: prof.data?.username ?? null,
    avatarUrl: prof.data?.avatar_url ?? null,
    bio: prof.data?.bio ?? null,
    followers: followers.count ?? 0,
    following: following.count ?? 0,
    posts: posts.count ?? 0,
  };
}

/**
 * Live profile-header data — bio, avatar, and follower/following/post counts —
 * for a given profile id. Replaces the demo-derived header fields on Profile so
 * a real user's profile shows their real bio and real counts (instead of a
 * generic bio and 0/0 stats).
 *
 * Cached by profile id (see {@link useCachedQuery}) so re-opening the same
 * profile from different screens doesn't re-run the four count queries; a
 * follow toggle invalidates `profileHeader:<id>` to refresh the counts.
 */
export function useProfileHeader(profileId: string | null): ProfileHeader | null {
  const { data } = useCachedQuery<ProfileHeader>(
    profileId ? `profileHeader:${profileId}` : null,
    () => fetchProfileHeader(profileId as string),
    { ttlMs: 30_000 },
  );
  return data;
}
