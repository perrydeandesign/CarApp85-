import { supabase } from './supabase';
import { TABLES } from '../data/tables';
import type { EngagementFlags } from '../social/data/mapServerPost';

type LikeRow = { post_id: string };
type FollowRow = { following_id: string };
// A resolved-or-guarded Supabase query result, narrowed to the columns we read.
type Result<T> = { data: T[] | null; error: unknown };

/**
 * Resolves the current user's engagement flags — liked posts, saved posts, and
 * followed authors — for a set of posts/authors. Shared by {@link useFeed} and
 * {@link useProfilePosts} so the like/save/follow lookup lives in exactly one
 * place (previously duplicated in both hooks).
 *
 * - Returns empty sets when signed out or given nothing to look up.
 * - Skips the `.in()` query for an empty id list (avoids a pointless round-trip).
 * - `saved_posts` may not exist in every environment (see {@link TABLES}); that
 *   query is guarded so it never rejects the caller.
 *
 * Callers with a single author pass a one-element array.
 */
export async function fetchEngagementFlags(
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

  const noLikes: Result<LikeRow> = { data: [], error: null };
  const noFollows: Result<FollowRow> = { data: [], error: null };

  const [likes, saves, follows] = await Promise.all([
    postIds.length > 0
      ? supabase.from(TABLES.postLikes).select('post_id').eq('user_id', uid).in('post_id', postIds)
      : Promise.resolve(noLikes),
    // saved_posts may not exist yet — guard so this never rejects the caller.
    postIds.length > 0
      ? supabase
          .from(TABLES.savedPosts)
          .select('post_id')
          .eq('user_id', uid)
          .in('post_id', postIds)
          .then((r) => r, () => noLikes)
      : Promise.resolve(noLikes),
    authorIds.length > 0
      ? supabase.from(TABLES.follows).select('following_id').eq('follower_id', uid).in('following_id', authorIds)
      : Promise.resolve(noFollows),
  ]);

  return {
    likedPostIds: new Set(((likes.data ?? []) as LikeRow[]).map((r) => r.post_id)),
    savedPostIds: new Set(((saves.data ?? []) as LikeRow[]).map((r) => r.post_id)),
    followedAuthorIds: new Set(((follows.data ?? []) as FollowRow[]).map((r) => r.following_id)),
  };
}
