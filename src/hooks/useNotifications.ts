import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { mapNotificationRow, type Notification, type ServerRow } from './notificationMapper';

// Re-exported so existing consumers can keep importing these from useNotifications.
export type { NotifType, Notification, ServerRow } from './notificationMapper';
export { mapNotificationRow } from './notificationMapper';

const SELECT = `
  id, type, body, read, created_at,
  actor:profiles!notifications_actor_id_fkey ( id, username, avatar_url )
`;

/**
 * V2 notifications. Pass a profileId (resolved via useMeProfile).
 * `profileId === null` returns an empty list (no fetch fired).
 */
export function useNotifications(profileId: string | null, pageSize = 30) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!profileId) { setNotifications([]); return; }
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('notifications')
      .select(SELECT)
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(pageSize);
    if (err) { setError(err.message); setLoading(false); return; }
    const rows = (data ?? []) as unknown as ServerRow[];
    setNotifications(rows.map(mapNotificationRow));
    setLoading(false);
  }, [profileId, pageSize]);

  useEffect(() => { void fetchNotifications(); }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    const prev = notifications;
    setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, read: true } : n)));
    const { error: err } = await supabase.from('notifications').update({ read: true }).eq('id', id);
    if (err) setNotifications(prev);
  }, [notifications]);

  const markAllAsRead = useCallback(async () => {
    if (!profileId) return;
    const prev = notifications;
    setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
    const { error: err } = await supabase
      .from('notifications').update({ read: true })
      .eq('profile_id', profileId).eq('read', false);
    if (err) setNotifications(prev);
  }, [notifications, profileId]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  return {
    notifications,
    loading,
    error,
    unreadCount,
    refresh: fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}
