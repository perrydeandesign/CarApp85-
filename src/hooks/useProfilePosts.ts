import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  mapServerPost,
  SERVER_POST_SELECT,
  type ServerPostRow,
} from '../social/data/mapServerPost';
import type { Post } from '../social/data/posts';
import { fetchEngagementFlags } from '../lib/engagement';

const PAGE_SIZE = 30;

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
    const flags = await fetchEngagementFlags(rows.map((r) => r.id), [userId]);
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
