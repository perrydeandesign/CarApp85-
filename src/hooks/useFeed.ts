import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  mapServerPost,
  SERVER_POST_SELECT,
  type EngagementFlags,
  type ServerPostRow,
} from '../social/data/mapServerPost';
import type { Post } from '../social/data/posts';
import { TABLES } from '../data/tables';

export type FeedState = {
  posts: Post[];
  loading: boolean;
  error: string | null;
};

const PAGE_SIZE = 20;

async function fetchEngagementFlags(
  postIds: string[],
  authorIds: string[],
): Promise<EngagementFlags> {
  const empty: EngagementFlags = {
    likedPostIds: new Set(),
    savedPostIds: new Set(),
    followedAuthorIds: new Set(),
  };
  if (postIds.length === 0 && authorIds.length === 0) return empty;

  const { data: session } = await supabase.auth.getSession();
  const uid = session.session?.user.id;
  if (!uid) return empty;

  const [likes, saves, follows] = await Promise.all([
    postIds.length > 0
      ? supabase.from(TABLES.postLikes).select('post_id').eq('user_id', uid).in('post_id', postIds)
      : Promise.resolve({ data: [] as { post_id: string }[], error: null } as any),
    // saved_posts table doesn't exist yet — guard so this never rejects the feed.
    postIds.length > 0
      ? supabase.from(TABLES.savedPosts).select('post_id').eq('user_id', uid).in('post_id', postIds).then((r) => r, () => ({ data: [], error: null }))
      : Promise.resolve({ data: [] as { post_id: string }[], error: null } as any),
    authorIds.length > 0
      ? supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', uid)
          .in('following_id', authorIds)
      : Promise.resolve({ data: [] as { following_id: string }[], error: null } as any),
  ]);

  return {
    likedPostIds: new Set((likes.data ?? []).map((r: any) => r.post_id)),
    savedPostIds: new Set((saves.data ?? []).map((r: any) => r.post_id)),
    followedAuthorIds: new Set((follows.data ?? []).map((r: any) => r.following_id)),
  };
}

/**
 * Reads the public feed of published posts, newest first.
 * Phase 1: chronological "everyone" feed. Phase 3 will replace this with
 * a personalized following+recommended feed served by an Edge Function.
 *
 * Also exposes `setAuthorFollowed(authorId, followed)` so the UI can flip
 * the "Follow" chip on every card by the same author at once after a
 * successful toggle.
 */
export function useFeed() {
  const [state, setState] = useState<FeedState>({ posts: [], loading: true, error: null });
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  // Keyset cursor — the created_at of the last post we've loaded.
  const cursorRef = useRef<string | null>(null);

  // Fetch one page. `before` = created_at cursor for the next page (null = first).
  const fetchPage = useCallback(async (before: string | null): Promise<Post[]> => {
    let q = supabase
      .from('posts')
      .select(SERVER_POST_SELECT)
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE);
    if (before) q = q.lt('created_at', before);

    const { data, error } = await q;
    if (error) throw error;

    const rows = (data ?? []) as unknown as ServerPostRow[];
    if (rows.length < PAGE_SIZE) setHasMore(false);
    if (rows.length > 0) cursorRef.current = rows[rows.length - 1].created_at;

    const flags = await fetchEngagementFlags(
      rows.map((r) => r.id),
      Array.from(new Set(rows.map((r) => r.author?.id).filter(Boolean) as string[])),
    );
    return rows.map((r) => mapServerPost(r, flags)).filter((p): p is Post => p !== null);
  }, []);

  // Refresh — reset to the first page.
  const fetchFeed = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    cursorRef.current = null;
    setHasMore(true);
    try {
      const page = await fetchPage(null);
      setState({ posts: page, loading: false, error: null });
    } catch (e: any) {
      setState({ posts: [], loading: false, error: e?.message ?? String(e) });
    }
  }, [fetchPage]);

  // Load the next page and append (de-duped).
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !cursorRef.current) return;
    setLoadingMore(true);
    try {
      const page = await fetchPage(cursorRef.current);
      setState((s) => {
        const seen = new Set(s.posts.map((p) => p.id));
        const fresh = page.filter((p) => !seen.has(p.id));
        return { ...s, posts: [...s.posts, ...fresh] };
      });
    } catch {
      // keep current posts on a paging error
    } finally {
      setLoadingMore(false);
    }
  }, [fetchPage, hasMore, loadingMore]);

  useEffect(() => {
    void fetchFeed();
  }, [fetchFeed]);

  const setAuthorFollowed = useCallback((authorId: string, followed: boolean) => {
    setState((s) => ({
      ...s,
      posts: s.posts.map((p) =>
        p.author.id === authorId
          ? { ...p, isAuthorFollowedByCurrentUser: followed }
          : p,
      ),
    }));
  }, []);

  return { ...state, loadingMore, hasMore, refresh: fetchFeed, loadMore, setAuthorFollowed };
}
