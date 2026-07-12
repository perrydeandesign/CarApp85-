import { useCallback, useEffect, useRef, useState } from 'react';
import { query, subscribe, peek, invalidate, type QueryOpts } from '../lib/queryCache';

type State<T> = { data: T | null; loading: boolean; error: unknown };

/**
 * Cached data-fetching hook backed by {@link query}. Multiple components using
 * the same `key` share one request and one cached result. Pass `key = null` to
 * disable (e.g. before an id resolves). Re-fetches automatically when the key is
 * invalidated by a mutation. Returns the familiar `{ data, loading, error }`
 * plus `refetch()` (which forces a fresh fetch).
 */
export function useCachedQuery<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  opts?: QueryOpts,
) {
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const optsRef = useRef(opts);
  optsRef.current = opts;

  const [state, setState] = useState<State<T>>(() => {
    const e = key ? peek<T>(key) : undefined;
    return { data: (e?.data as T) ?? null, loading: !!key && e?.data === undefined, error: e?.error ?? null };
  });

  const load = useCallback(
    async (force = false) => {
      if (!key) {
        setState({ data: null, loading: false, error: null });
        return;
      }
      if (force) invalidate(key);
      setState((s) => ({ ...s, loading: s.data == null }));
      try {
        const data = await query(key, () => fetcherRef.current(), optsRef.current);
        setState({ data, loading: false, error: null });
      } catch (error) {
        setState((s) => ({ ...s, loading: false, error }));
      }
    },
    [key],
  );

  useEffect(() => {
    let alive = true;
    void load();
    const unsub = key
      ? subscribe(key, () => {
          if (alive) void load();
        })
      : () => {};
    return () => {
      alive = false;
      unsub();
    };
  }, [key, load]);

  return { data: state.data, loading: state.loading, error: state.error, refetch: () => load(true) };
}
