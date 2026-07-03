import { mapServerPost, type ServerPostRow, type EngagementFlags } from '../mapServerPost';

function row(overrides: Partial<ServerPostRow> = {}): ServerPostRow {
  return {
    id: 'p1',
    title: 'Fresh coilovers',
    body: 'dropped 2 inches',
    created_at: '2026-07-01T10:00:00.000Z',
    like_count: 3,
    comment_count: 1,
    author: { id: 'u1', username: 'dana', avatar_url: 'http://x/a.jpg' },
    post_media: [{ id: 'm1', media_type: 'image', media_url: 'http://x/p.jpg' }],
    ...overrides,
  };
}

describe('mapServerPost', () => {
  it('returns null when the author join is missing', () => {
    expect(mapServerPost(row({ author: null }))).toBeNull();
  });

  it('joins title and body into a single caption', () => {
    expect(mapServerPost(row())?.caption).toBe('Fresh coilovers — dropped 2 inches');
  });

  it('drops empty title/body segments from the caption', () => {
    expect(mapServerPost(row({ title: null }))?.caption).toBe('dropped 2 inches');
    expect(mapServerPost(row({ title: 'Only title', body: null }))?.caption).toBe('Only title');
  });

  it('uses the first media item and empty string for text-only posts', () => {
    expect(mapServerPost(row())?.mediaUrl).toBe('http://x/p.jpg');
    expect(mapServerPost(row({ post_media: [] }))?.mediaUrl).toBe('');
  });

  it('defaults engagement flags to false without flag sets', () => {
    const post = mapServerPost(row());
    expect(post?.isLikedByCurrentUser).toBe(false);
    expect(post?.isSavedByCurrentUser).toBe(false);
    expect(post?.isAuthorFollowedByCurrentUser).toBe(false);
  });

  it('reflects engagement flags when the post/author is present in the sets', () => {
    const flags: EngagementFlags = {
      likedPostIds: new Set(['p1']),
      savedPostIds: new Set(['p1']),
      followedAuthorIds: new Set(['u1']),
    };
    const post = mapServerPost(row(), flags);
    expect(post?.isLikedByCurrentUser).toBe(true);
    expect(post?.isSavedByCurrentUser).toBe(true);
    expect(post?.isAuthorFollowedByCurrentUser).toBe(true);
  });
});
