// Pure notification types + row mapper. Kept free of the Supabase client (and
// therefore of react-native-url-polyfill / @env) so it can be unit-tested and
// imported without side effects. useNotifications re-exports these.

export type NotifType = 'like' | 'comment' | 'follow' | 'mention' | 'competition';

export type Notification = {
  id: string;
  type: NotifType;
  body: string | null;
  read: boolean;
  /** Compat shim: `readAt` mirrors `!!read` so legacy consumers keep working. */
  readAt: string | null;
  /** Compat shim — v2 schema has no postId; kept null for compatibility. */
  postId: string | null;
  createdAt: string;
  actor: { id: string; username: string; avatarUrl: string };
};

export type ServerRow = {
  id: string;
  type: NotifType;
  body: string | null;
  read: boolean;
  created_at: string;
  actor: { id: string; username: string; avatar_url: string | null } | null;
};

/**
 * Map a raw `notifications` row to the client model. Pure so the read-state
 * derivation (`read` boolean → `readAt` compat shim) is unit-testable.
 */
export function mapNotificationRow(r: ServerRow): Notification {
  return {
    id: r.id,
    type: r.type,
    body: r.body,
    read: r.read,
    readAt: r.read ? r.created_at : null,
    postId: null,
    createdAt: r.created_at,
    actor: {
      id: r.actor?.id ?? '',
      username: r.actor?.username ?? 'someone',
      avatarUrl: r.actor?.avatar_url ?? '',
    },
  };
}
