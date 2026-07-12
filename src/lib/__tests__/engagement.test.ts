import { fetchEngagementFlags } from '../engagement';

// Minimal chainable Supabase mock. Each table resolves to a configurable result
// via the thenable chain; auth.getSession reads a configurable session.
jest.mock('../supabase', () => {
  const state: any = {
    session: { user: { id: 'me1' } },
    results: {} as Record<string, { data: unknown[]; error: unknown }>,
  };
  function chain(table: string) {
    const c: any = {};
    ['select', 'eq', 'in'].forEach((m) => (c[m] = jest.fn(() => c)));
    c.then = (res: any, rej: any) =>
      Promise.resolve(state.results[table] ?? { data: [], error: null }).then(res, rej);
    return c;
  }
  return {
    __state: state,
    supabase: {
      auth: { getSession: () => Promise.resolve({ data: { session: state.session } }) },
      from: (t: string) => chain(t),
    },
  };
});

const { __state } = require('../supabase');

beforeEach(() => {
  __state.session = { user: { id: 'me1' } };
  __state.results = {
    post_likes: { data: [{ post_id: 'p1' }], error: null },
    saved_posts: { data: [{ post_id: 'p2' }], error: null },
    follows: { data: [{ following_id: 'a1' }], error: null },
  };
});

describe('fetchEngagementFlags', () => {
  it('short-circuits to empty sets when given nothing', async () => {
    const flags = await fetchEngagementFlags([], []);
    expect(flags.likedPostIds.size).toBe(0);
    expect(flags.savedPostIds.size).toBe(0);
    expect(flags.followedAuthorIds.size).toBe(0);
  });

  it('returns empty sets when signed out', async () => {
    __state.session = null;
    const flags = await fetchEngagementFlags(['p1'], ['a1']);
    expect(flags.likedPostIds.size).toBe(0);
    expect(flags.followedAuthorIds.size).toBe(0);
  });

  it('builds sets from liked / saved / followed rows', async () => {
    const flags = await fetchEngagementFlags(['p1', 'p2'], ['a1']);
    expect(flags.likedPostIds.has('p1')).toBe(true);
    expect(flags.savedPostIds.has('p2')).toBe(true);
    expect(flags.followedAuthorIds.has('a1')).toBe(true);
  });

  it('skips post lookups when there are no post ids (author-only)', async () => {
    const flags = await fetchEngagementFlags([], ['a1']);
    expect(flags.likedPostIds.size).toBe(0);
    expect(flags.savedPostIds.size).toBe(0);
    expect(flags.followedAuthorIds.has('a1')).toBe(true);
  });
});
