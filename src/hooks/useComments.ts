import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { checkText } from '../lib/moderation';
import { TABLES } from '../data/tables';
import type { Comment } from '../social/data/posts';

type ServerCommentRow = {
  id: string;
  body: string;
  created_at: string;
  author: { id: string; username: string; avatar_url: string | null } | null;
};

// Canonical comments live in `post_comments` (no parent_comment_id column —
// threading is a future migration). FK alias verified against the live schema.
const COMMENTS_SELECT = `
  id,
  body,
  created_at,
  author:profiles!post_comments_author_id_fkey ( id, username, avatar_url )
`;

function mapComment(row: ServerCommentRow, postId: string): Comment | null {
  if (!row.author) return null;
  return {
    id: row.id,
    postId,
    author: {
      id: row.author.id,
      username: row.author.username,
      avatarUrl: row.author.avatar_url ?? '',
    },
    text: row.body,
    createdAt: row.created_at,
  };
}

/**
 * Reads comments for a single post (oldest-first). Phase 2.5 keeps it flat;
 * `parent_comment_id` is present in the schema so thread rendering can be
 * layered on without changing this hook.
 */
export function useComments(postId: string | null) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    if (!postId) {
      setComments([]);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from(TABLES.postComments)
      .select(COMMENTS_SELECT)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    const mapped = ((data ?? []) as unknown as ServerCommentRow[])
      .map((r) => mapComment(r, postId))
      .filter((c): c is Comment => c !== null);
    setComments(mapped);
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    void fetchComments();
  }, [fetchComments]);

  const addComment = useCallback(
    async (text: string) => {
      if (!postId || !text.trim()) return;
      const check = checkText(text);
      if (!check.ok) throw new Error(check.reason);
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData.session?.user.id;
      if (!uid) throw new Error('You must be signed in to comment.');

      const { data, error: insertError } = await supabase
        .from(TABLES.postComments)
        .insert({
          post_id: postId,
          author_id: uid,
          body: text.trim(),
        })
        .select(COMMENTS_SELECT)
        .single();
      if (insertError) throw insertError;

      const mapped = data ? mapComment(data as unknown as ServerCommentRow, postId) : null;
      if (mapped) {
        setComments((prev) => [...prev, mapped]);
      }
    },
    [postId],
  );

  return { comments, loading, error, addComment, refresh: fetchComments };
}
