import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useMeProfile } from './useMeProfile';

export type ReportTarget = 'post' | 'comment' | 'user';

export const REPORT_REASONS = [
  'Spam or scam',
  'Harassment or hate',
  'Nudity or sexual content',
  'Violence or threats',
  'Stolen / counterfeit',
  'Other',
];

/**
 * UGC moderation actions: report content and block users. Backed by the
 * `reports` / `blocked_users` tables (migration 20260630000004). Block ids are
 * loaded so the feed/search can filter out blocked authors.
 */
export function useModeration() {
  const { data: me } = useMeProfile();
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());

  const loadBlocks = useCallback(async () => {
    if (!me?.id) return;
    const { data, error } = await supabase
      .from('blocked_users')
      .select('blocked_id')
      .eq('blocker_id', me.id);
    if (!error && data) setBlockedIds(new Set(data.map((r) => r.blocked_id)));
  }, [me?.id]);

  useEffect(() => {
    void loadBlocks();
  }, [loadBlocks]);

  const report = useCallback(
    async (targetType: ReportTarget, targetId: string, reason: string, details?: string) => {
      if (!me?.id) throw new Error('Sign in to report.');
      const { error } = await supabase.from('reports').insert({
        reporter_id: me.id,
        target_type: targetType,
        target_id: targetId,
        reason,
        details: details ?? null,
      });
      if (error) throw error;
    },
    [me?.id],
  );

  const blockUser = useCallback(
    async (userId: string) => {
      if (!me?.id || userId === me.id) return;
      setBlockedIds((prev) => new Set(prev).add(userId)); // optimistic
      const { error } = await supabase
        .from('blocked_users')
        .insert({ blocker_id: me.id, blocked_id: userId });
      if (error && !/duplicate key/i.test(error.message)) {
        setBlockedIds((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
        throw error;
      }
    },
    [me?.id],
  );

  const unblockUser = useCallback(
    async (userId: string) => {
      if (!me?.id) return;
      setBlockedIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
      await supabase.from('blocked_users').delete().eq('blocker_id', me.id).eq('blocked_id', userId);
    },
    [me?.id],
  );

  const isBlocked = useCallback((userId?: string) => !!userId && blockedIds.has(userId), [blockedIds]);

  return { blockedIds, isBlocked, report, blockUser, unblockUser, refreshBlocks: loadBlocks };
}
