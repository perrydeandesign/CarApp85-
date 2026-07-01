import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Reads whether the current user follows `targetUserId` and exposes
 * `toggleFollow()`. Counters on `profiles` are maintained server-side
 * by the follows trigger — refetch the target profile for canonical numbers.
 */
export function useFollow(targetUserId: string | null) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!targetUserId) return;
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUid = sessionData.session?.user.id ?? null;
      if (cancelled) return;
      setUid(currentUid);
      if (!currentUid || currentUid === targetUserId) {
        setIsFollowing(false);
        return;
      }
      const { data, error } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('follower_id', currentUid)
        .eq('following_id', targetUserId)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        console.warn('useFollow read failed', error);
        return;
      }
      setIsFollowing(!!data);
    })();
    return () => {
      cancelled = true;
    };
  }, [targetUserId]);

  const toggleFollow = useCallback(async () => {
    if (!uid || !targetUserId || uid === targetUserId || loading) return;
    setLoading(true);
    const next = !isFollowing;
    setIsFollowing(next); // optimistic
    const { error } = next
      ? await supabase.from('follows').insert({ follower_id: uid, following_id: targetUserId })
      : await supabase
          .from('follows')
          .delete()
          .eq('follower_id', uid)
          .eq('following_id', targetUserId);
    setLoading(false);
    if (error && !/duplicate key/i.test(error.message)) {
      setIsFollowing(!next); // rollback
      console.warn('toggleFollow failed', error);
    }
  }, [uid, targetUserId, isFollowing, loading]);

  return { isFollowing, loading, toggleFollow };
}
