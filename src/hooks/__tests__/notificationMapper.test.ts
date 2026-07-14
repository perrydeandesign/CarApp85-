import { mapNotificationRow, type ServerRow } from '../notificationMapper';

function row(overrides: Partial<ServerRow> = {}): ServerRow {
  return {
    id: 'n1',
    type: 'like',
    body: null,
    read: false,
    created_at: '2026-07-01T10:00:00.000Z',
    actor: { id: 'a1', username: 'dana', avatar_url: 'http://x/y.jpg' },
    ...overrides,
  };
}

describe('mapNotificationRow read-state', () => {
  it('leaves readAt null for an unread row', () => {
    const n = mapNotificationRow(row({ read: false }));
    expect(n.read).toBe(false);
    expect(n.readAt).toBeNull();
  });

  it('mirrors readAt to created_at for a read row', () => {
    const n = mapNotificationRow(row({ read: true, created_at: '2026-07-02T08:30:00.000Z' }));
    expect(n.read).toBe(true);
    expect(n.readAt).toBe('2026-07-02T08:30:00.000Z');
  });
});

describe('mapNotificationRow actor', () => {
  it('maps a present actor to the camelCase client shape', () => {
    const n = mapNotificationRow(row());
    expect(n.actor).toEqual({ id: 'a1', username: 'dana', avatarUrl: 'http://x/y.jpg' });
  });

  it('falls back gracefully when the actor join is null', () => {
    const n = mapNotificationRow(row({ actor: null }));
    expect(n.actor).toEqual({ id: '', username: 'someone', avatarUrl: '' });
  });

  it('coerces a null avatar_url to an empty string', () => {
    const n = mapNotificationRow(
      row({ actor: { id: 'a2', username: 'ives', avatar_url: null } }),
    );
    expect(n.actor.avatarUrl).toBe('');
  });
});

describe('mapNotificationRow message type', () => {
  it('carries the message type through (DMs unified under notifications)', () => {
    const n = mapNotificationRow(row({ type: 'message' }));
    expect(n.type).toBe('message');
  });
});
