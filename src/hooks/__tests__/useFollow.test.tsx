import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { useFollow } from '../useFollow';

// Chainable Supabase mock. `read` backs the initial follow-state lookup;
// `insert` / `del` back the toggle so we can force a failure and assert rollback.
jest.mock('../../lib/supabase', () => {
  const state: any = {
    session: { user: { id: 'me1' } },
    read: { data: null, error: null }, // maybeSingle() → not following
    insert: { error: null },
    del: { error: null },
  };
  const chain: any = {};
  ['select', 'eq', 'in', 'delete'].forEach((m) => (chain[m] = () => chain));
  chain.maybeSingle = () => Promise.resolve(state.read);
  chain.insert = () => Promise.resolve(state.insert);
  chain.then = (res: any, rej: any) => Promise.resolve(state.del).then(res, rej);
  return {
    __state: state,
    supabase: {
      auth: { getSession: () => Promise.resolve({ data: { session: state.session } }) },
      from: () => chain,
    },
  };
});

const { __state } = require('../../lib/supabase');

function renderHook<T>(useHook: () => T) {
  const result = { current: undefined as unknown as T };
  function Probe() {
    result.current = useHook();
    return null;
  }
  act(() => {
    TestRenderer.create(<Probe />);
  });
  return { result };
}

beforeEach(() => {
  __state.session = { user: { id: 'me1' } };
  __state.read = { data: null, error: null };
  __state.insert = { error: null };
  __state.del = { error: null };
});

describe('useFollow.toggleFollow', () => {
  it('follows when the insert succeeds', async () => {
    const { result } = renderHook(() => useFollow('target1'));
    await act(async () => {}); // flush the initial session/read effect
    expect(result.current.isFollowing).toBe(false);

    await act(async () => {
      await result.current.toggleFollow();
    });
    expect(result.current.isFollowing).toBe(true);
  });

  it('rolls back the optimistic follow when the insert fails', async () => {
    __state.insert = { error: { message: 'boom' } };
    const { result } = renderHook(() => useFollow('target1'));
    await act(async () => {});
    expect(result.current.isFollowing).toBe(false);

    await act(async () => {
      await result.current.toggleFollow();
    });
    // optimistic true, then rolled back to false on error
    expect(result.current.isFollowing).toBe(false);
  });

  it('does nothing when target is the current user', async () => {
    const { result } = renderHook(() => useFollow('me1'));
    await act(async () => {});
    await act(async () => {
      await result.current.toggleFollow();
    });
    expect(result.current.isFollowing).toBe(false);
  });
});
