import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { mapServerPost, type ServerPostRow } from '../social/data/mapServerPost';
import type { Post } from '../social/data/posts';

// Posts whose media is a VIDEO, newest first. `post_media!inner` + the
// media_type filter returns only posts that actually have a video attached,
// so the first media (what mapServerPost reads) is always the video.
const REELS_SELECT = `
  id, title, body, created_at, like_count, comment_count,
  author:profiles!posts_profile_id_fkey ( id, username, avatar_url ),
  post_media:post_media!inner ( id, media_url, media_type )
`;

const PAGE_SIZE = 10;

/** Vertical video ("Reels") feed. Same shape as useFeed, filtered to videos. */
export function useReels() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const cursorRef = useRef<string | null>(null);

  const fetchPage = useCallback(async (before: string | null): Promise<Post[]> => {
    let q = supabase
      .from('posts')
      .select(REELS_SELECT)
      .eq('post_media.media_type', 'video')
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE);
    if (before) q = q.lt('created_at', before);

    const { data, error: err } = await q;
    if (err) throw err;
    const rows = (data ?? []) as unknown as ServerPostRow[];
    if (rows.length < PAGE_SIZE) setHasMore(false);
    if (rows.length > 0) cursorRef.current = rows[rows.length - 1].created_at;
    return rows.map((r) => mapServerPost(r)).filter((p): p is Post => p !== null);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    cursorRef.current = null;
    setHasMore(true);
    try {
      setPosts(await fetchPage(null));
    } catch (e: any) {
      setError(e?.message ?? String(e));
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !cursorRef.current) return;
    setLoadingMore(true);
    try {
      const page = await fetchPage(cursorRef.current);
      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...page.filter((p) => !seen.has(p.id))];
      });
    } catch {
      /* keep current on paging error */
    } finally {
      setLoadingMore(false);
    }
  }, [fetchPage, hasMore, loadingMore]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { posts, loading, error, loadingMore, hasMore, refresh, loadMore };
}
