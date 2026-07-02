import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Muted keywords — posts/comments containing any of these are hidden for the
 * user. Backed by the `muted_keywords` table (RLS owner-only). The feed/comment
 * filters call `matchesMuted()` to decide what to hide.
 */
export function useMutedKeywords() {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data: sess } = await supabase.auth.getSession();
    const id = sess.session?.user?.id ?? null;
    setUid(id);
    if (!id) {
      setKeywords([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('muted_keywords')
      .select('keyword')
      .eq('user_id', id)
      .order('created_at', { ascending: false });
    setKeywords((data ?? []).map((r: any) => r.keyword));
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const add = useCallback(
    async (raw: string) => {
      const keyword = raw.trim().toLowerCase();
      if (!uid || !keyword || keywords.includes(keyword)) return;
      setKeywords((prev) => [keyword, ...prev]); // optimistic
      const { error } = await supabase.from('muted_keywords').insert({ user_id: uid, keyword });
      if (error && !/duplicate key/i.test(error.message)) {
        setKeywords((prev) => prev.filter((k) => k !== keyword)); // rollback
      }
    },
    [uid, keywords],
  );

  const remove = useCallback(
    async (keyword: string) => {
      if (!uid) return;
      const prev = keywords;
      setKeywords((k) => k.filter((x) => x !== keyword));
      const { error } = await supabase
        .from('muted_keywords')
        .delete()
        .eq('user_id', uid)
        .eq('keyword', keyword);
      if (error) setKeywords(prev);
    },
    [uid, keywords],
  );

  /** True if `text` contains any muted keyword (case-insensitive). */
  const matchesMuted = useCallback(
    (text?: string | null) => {
      if (!text) return false;
      const lower = text.toLowerCase();
      return keywords.some((k) => lower.includes(k));
    },
    [keywords],
  );

  return { keywords, loading, add, remove, matchesMuted, refresh: load };
}
