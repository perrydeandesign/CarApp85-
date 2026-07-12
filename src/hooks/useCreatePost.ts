import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useMeProfile } from './useMeProfile';
import { extractMentions } from '../social/components/RichCaption';
import { persistPostTags } from '../social/tagging';

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

      const postId = data.id as string;

      // Persist @-mentions as post_tags so the DB trigger fires a 'mention'
      // notification (mirrors the camera path in PostPreview). persistPostTags
      // resolves handles → profiles/vendors and swallows its own errors, so a
      // tagging hiccup never fails an otherwise-successful post.
      const mentions = extractMentions(body);
      if (mentions.length) await persistPostTags(postId, mentions);

      return postId;
    },
    [me?.id],
  );

  return { createTextPost };
}
