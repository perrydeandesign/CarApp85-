import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
  mapServerPost,
  SERVER_POST_SELECT,
  type ServerPostRow,
} from '../data/mapServerPost';
import type { Post } from '../data/posts';

/**
 * Resolves a set of post IDs to full posts, read live from Supabase.
 * Used by Saved/Collections to turn saved post IDs into renderable cards —
 * replaces the old MOCK_POSTS_V2 lookup so a user's real saved posts resolve.
 */
export function usePostsByIds(ids: string[]): {
  postsById: Record<string, Post>;
  loading: boolean;
} {
  const [postsById, setPostsById] = useState<Record<string, Post>>({});
  const [loading, setLoading] = useState(false);
  // Stable dependency so we only refetch when the actual id set changes.
  const key = ids.slice().sort().join(',');

  useEffect(() => {
    if (ids.length === 0) {
      setPostsById({});
      return;
    }
    let cancelled = false;
    setLoading(true);
    supabase
      .from('posts')
      .select(SERVER_POST_SELECT)
      .in('id', ids)
      .then(({ data }) => {
        if (cancelled) return;
        const rows = (data ?? []) as unknown as ServerPostRow[];
        const map: Record<string, Post> = {};
        for (const row of rows) {
          const post = mapServerPost(row);
          if (post) map[post.id] = post;
        }
        setPostsById(map);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { postsById, loading };
}
