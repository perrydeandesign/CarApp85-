import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useMeProfile } from './useMeProfile';

/**
 * Server-backed like toggle for the v2 `post_likes` table.
 * Returns `toggleLike(postId, currentlyLiked) → newLikedState`.
 *
 * Resolves the current user via useMeProfile (works in DEV_SKIP_AUTH mode
 * since the seeded first profile stands in for "me").
 *
 * The caller is responsible for the optimistic UI update — this hook only
 * persists the row. `posts.like_count` is denormalized; the feed query
 * refetches to pick up the canonical count.
 */
export function useLikePost() {
  const { data: me } = useMeProfile();

  const toggleLike = useCallback(
    async (postId: string, currentlyLiked: boolean): Promise<boolean> => {
      if (!me?.id) throw new Error('No active profile.');

      if (currentlyLiked) {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('user_id', me.id)
          .eq('post_id', postId);
        if (error) throw error;
        return false;
      }

      const { error } = await supabase
        .from('post_likes')
        .insert({ user_id: me.id, post_id: postId });
      // Duplicate inserts (race) → treat as already liked.
      if (error && !/duplicate key/i.test(error.message)) throw error;
      return true;
    },
    [me?.id],
  );

  return { toggleLike };
}
