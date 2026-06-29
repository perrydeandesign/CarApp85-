// DEPRECATED DATA PATH — this hook's fetch/insert target the `timeline_entries`
// table, which does NOT exist. Timeline data is sourced from `posts` (typed)
// via useProfileData/usePostsByCar instead. Only the TYPES exported here
// (TimelineEntry, NewTimelineEntry) are still imported by the Timeline UI.
// Do not call the data functions below until a timeline_entries migration
// exists; they will error against the live schema.
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { TimelineCategory, TimelineEntryRow } from '../types/database';

export type TimelineEntry = {
  id: string;
  userId: string;
  category: TimelineCategory;
  title: string;
  description: string;
  imageUrl: string | null;
  likeCount: number;
  commentCount: number;
  createdAt: string;
};

export type NewTimelineEntry = {
  category: TimelineCategory;
  title: string;
  description?: string;
  imageUrl?: string | null;
};

function mapRow(r: TimelineEntryRow): TimelineEntry {
  return {
    id: r.id,
    userId: r.user_id,
    category: r.category,
    title: r.title,
    description: r.description ?? '',
    imageUrl: r.image_url,
    likeCount: r.like_count,
    commentCount: r.comment_count,
    createdAt: r.created_at,
  };
}

/**
 * Per-user build timeline. Reads + writes against `timeline_entries`.
 *
 * - When `userId` is null/undefined the hook stays idle (no fetch).
 * - Inserts are optimistic; on server failure we revert and surface the error.
 * - Anyone may read; only the owner (auth.uid() === userId) can write.
 */
export function useTimeline(userId: string | null | undefined) {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setEntries([]);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('timeline_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    setEntries((data ?? []).map(mapRow));
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createEntry = useCallback(
    async (entry: NewTimelineEntry): Promise<TimelineEntry | null> => {
      if (!userId) return null;
      const title = entry.title.trim();
      if (!title) return null;

      // Optimistic temp row (negative-ish id namespace via "tmp:" prefix).
      const tempId = `tmp:${Date.now()}`;
      const optimistic: TimelineEntry = {
        id: tempId,
        userId,
        category: entry.category,
        title,
        description: entry.description?.trim() ?? '',
        imageUrl: entry.imageUrl ?? null,
        likeCount: 0,
        commentCount: 0,
        createdAt: new Date().toISOString(),
      };
      setEntries((prev) => [optimistic, ...prev]);

      const { data, error: err } = await supabase
        .from('timeline_entries')
        .insert({
          user_id: userId,
          category: entry.category,
          title,
          description: optimistic.description || null,
          image_url: optimistic.imageUrl,
        })
        .select('*')
        .single();

      if (err || !data) {
        // Roll back the optimistic insert.
        setEntries((prev) => prev.filter((e) => e.id !== tempId));
        setError(err?.message ?? 'Could not create entry');
        return null;
      }

      const saved = mapRow(data as TimelineEntryRow);
      setEntries((prev) => prev.map((e) => (e.id === tempId ? saved : e)));
      return saved;
    },
    [userId],
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      const prev = entries;
      setEntries((curr) => curr.filter((e) => e.id !== id));
      // Don't round-trip optimistic-only rows that never reached the server.
      if (id.startsWith('tmp:')) return;
      const { error: err } = await supabase
        .from('timeline_entries')
        .delete()
        .eq('id', id);
      if (err) {
        setEntries(prev);
        setError(err.message);
      }
    },
    [entries],
  );

  return { entries, loading, error, refresh, createEntry, deleteEntry };
}
