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
          .select('followee_id')
          .eq('follower_id', uid)
          .in('followee_id', authorIds)
      : Promise.resolve({ data: [] as { followee_id: string }[], error: null } as any),
  ]);

  return {
    likedPostIds: new Set((likes.data ?? []).map((r: any) => r.post_id)),
    savedPostIds: new Set((saves.data ?? []).map((r: any) => r.post_id)),
    followedAuthorIds: new Set((follows.data ?? []).map((r: any) => r.followee_id)),
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

  const fetchFeed = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    const { data, error } = await supabase
      .from('posts')
      .select(SERVER_POST_SELECT)
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE);

    if (error) {
      setState({ posts: [], loading: false, error: error.message });
      return;
    }

    const rows = (data ?? []) as unknown as ServerPostRow[];
    const flags = await fetchEngagementFlags(
      rows.map((r) => r.id),
      Array.from(new Set(rows.map((r) => r.author?.id).filter(Boolean) as string[])),
    );
    const mapped = rows
      .map((r) => mapServerPost(r, flags))
      .filter((p): p is Post => p !== null);

    setState({ posts: mapped, loading: false, error: null });
  }, []);

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

  return { ...state, refresh: fetchFeed, setAuthorFollowed };
}
