import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  mapServerPost,
  SERVER_POST_SELECT,
  type EngagementFlags,
  type ServerPostRow,
} from '../social/data/mapServerPost';
import type { Post } from '../social/data/posts';
import { TABLES } from '../data/tables';

const PAGE_SIZE = 30;

/** Strip-down of useFeed's engagement fetcher — same shape, scoped to the post set. */
async function fetchEngagementFlags(
  postIds: string[],
  authorId: string,
): Promise<EngagementFlags> {
  const empty: EngagementFlags = {
    likedPostIds: new Set(),
    savedPostIds: new Set(),
    followedAuthorIds: new Set(),
  };
  if (postIds.length === 0) return empty;

  const { data: session } = await supabase.auth.getSession();
  const uid = session.session?.user.id;
  if (!uid) return empty;

  const [likes, saves, follow] = await Promise.all([
    supabase.from(TABLES.postLikes).select('post_id').eq('user_id', uid).in('post_id', postIds),
    supabase.from(TABLES.savedPosts).select('post_id').eq('user_id', uid).in('post_id', postIds).then((r) => r, () => ({ data: [], error: null })),
    supabase
      .from(TABLES.follows)
      .select('following_id')
      .eq('follower_id', uid)
      .eq('following_id', authorId)
      .maybeSingle(),
  ]);

  return {
    likedPostIds: new Set((likes.data ?? []).map((r: any) => r.post_id)),
    savedPostIds: new Set((saves.data ?? []).map((r: any) => r.post_id)),
    followedAuthorIds: follow.data ? new Set([authorId]) : new Set(),
  };
}

/**
 * Reads posts authored by `userId`, newest first. Used by the own-profile
 * screen (current user's posts grid) and the public profile screen.
 * Returns the same Post shape useFeed does, with engagement flags resolved.
 */
export function useProfilePosts(userId: string | null) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    if (!userId) {
      setPosts([]);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('posts')
      .select(SERVER_POST_SELECT)
      .eq('profile_id', userId)
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE);

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as unknown as ServerPostRow[];
    const flags = await fetchEngagementFlags(rows.map((r) => r.id), userId);
    const mapped = rows
      .map((r) => mapServerPost(r, flags))
      .filter((p): p is Post => p !== null);

    setPosts(mapped);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, error, refresh: fetchPosts };
}
