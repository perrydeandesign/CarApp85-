import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type StoryPerson = {
  id: string;
  username: string;
  avatarUrl: string | null;
};

/**
 * People to surface in the Stories rail: the most-recent distinct post authors.
 * Reads live from Supabase — replaces the old CONNS (demo users) slice so the
 * rail reflects real activity and updates as users post.
 */
export function useStoryPeople(limit = 8): StoryPerson[] {
  const [people, setPeople] = useState<StoryPerson[]>([]);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('posts')
      .select('created_at, author:profiles!posts_profile_id_fkey ( id, username, avatar_url )')
      .order('created_at', { ascending: false })
      .limit(60)
      .then(({ data }) => {
        if (cancelled) return;
        const seen = new Set<string>();
        const out: StoryPerson[] = [];
        for (const row of (data ?? []) as any[]) {
          const a = row.author;
          if (!a?.id || seen.has(a.id)) continue;
          seen.add(a.id);
          out.push({ id: a.id, username: a.username, avatarUrl: a.avatar_url });
          if (out.length >= limit) break;
        }
        setPeople(out);
      });
    return () => {
      cancelled = true;
    };
  }, [limit]);

  return people;
}
