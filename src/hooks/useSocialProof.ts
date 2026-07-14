import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * For a batch of feed posts, resolves ONE recent liker's username per post so
 * the card can render "Liked by @jake_sti and N others". Two-step (likes →
 * profiles) to avoid depending on a PostgREST FK-embed alias.
 */
export function useSocialProof(postIds: string[]) {
  const [proof, setProof] = useState<Record<string, string>>({});

  // Stable key so the effect only re-runs when the set of ids actually changes.
  const key = postIds.slice().sort().join(',');

  useEffect(() => {
    if (postIds.length === 0) return;
    let cancelled = false;

    (async () => {
      // Most-recent likes for these posts.
      const { data: likes, error } = await supabase
        .from('post_likes')
        .select('post_id, user_id, created_at')
        .in('post_id', postIds)
        .order('created_at', { ascending: false })
        .limit(400);
      if (error || !likes || cancelled) return;

      // First liker we see per post (already newest-first).
      const firstByPost = new Map<string, string>();
      for (const l of likes) {
        if (!firstByPost.has(l.post_id)) firstByPost.set(l.post_id, l.user_id);
      }
      const userIds = [...new Set(firstByPost.values())];
      if (userIds.length === 0) return;

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);
      if (cancelled || !profiles) return;

      const nameById = new Map(profiles.map((p) => [p.id, p.username]));
      const out: Record<string, string> = {};
      for (const [postId, uid] of firstByPost) {
        const name = nameById.get(uid);
        if (name) out[postId] = name;
      }
      setProof(out);
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return proof;
}
