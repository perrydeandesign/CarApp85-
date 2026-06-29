import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useMeProfile } from './useMeProfile';

/**
 * Persists a text-only status post (no car, no media). `posts.car_id` is
 * nullable and `type='text'` is accepted; `title` is NOT NULL so we derive a
 * short title from the body.
 *
 * Returns the inserted post id, or throws on failure so the caller can revert
 * its optimistic UI.
 */
export function useCreatePost() {
  const { data: me } = useMeProfile();

  const createTextPost = useCallback(
    async (text: string): Promise<string> => {
      const body = text.trim();
      if (!body) throw new Error('Empty post.');
      if (!me?.id) throw new Error('No active profile.');

      // Title is NOT NULL — use the first ~60 chars as a headline.
      const title = body.length > 60 ? `${body.slice(0, 57)}…` : body;

      const { data, error } = await supabase
        .from('posts')
        .insert({
          profile_id: me.id,
          car_id: null,
          type: 'text',
          title,
          body,
          like_count: 0,
          comment_count: 0,
        })
        .select('id')
        .single();
      if (error) throw error;
      return data.id as string;
    },
    [me?.id],
  );

  return { createTextPost };
}
