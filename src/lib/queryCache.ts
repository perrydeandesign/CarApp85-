/**
 * Tiny in-memory query cache — request de-duplication, TTL, retry, and
 * prefix invalidation — for the app's hand-rolled Supabase read hooks.
 *
 * Why not TanStack Query: the app has ~25 bespoke hooks and no query lib; this
 * gives the 80% win (no duplicate round-trips when two screens read the same
 * data, plus a free retry) in ~60 lines, with no provider to wire up and no
 * behavioural change to callers.
 *
 * Staleness is bounded by `ttlMs`; mutations call {@link invalidate} to refresh
 * affected keys immediately. Keys are namespaced strings, e.g.
 * `profileHeader:<id>` — invalidate a whole namespace with the prefix.
 */

type Entry<T> = {
  data?: T;
  error?: unknown;
  updatedAt: number;
  promise?: Promise<T>;
};

const store = new Map<string, Entry<unknown>>();
const subscribers = new Map<string, Set<() => void>>();

function emit(key: string): void {
  subscribers.get(key)?.forEach((fn) => fn());
}

/** Subscribe to invalidations for a key. Returns an unsubscribe fn. */
export function subscribe(key: string, fn: () => void): () => void {
  let set = subscribers.get(key);
  if (!set) {
    set = new Set();
    subscribers.set(key, set);
  }
  set.add(fn);
  return () => {
    set!.delete(fn);
    if (set!.size === 0) subscribers.delete(key);
  };
}

/** Synchronously read the current cache entry, if any (no fetch). */
export function peek<T>(key: string): Entry<T> | undefined {
  return store.get(key) as Entry<T> | undefined;
}

export type QueryOpts = { ttlMs?: number; retries?: number };

/**
 * Return cached data when fresh, share an in-flight request when one exists,
 * else fetch (with `retries` extra attempts on failure). Never emits on its own
 * — waiters share the same promise — so there are no self-refresh loops; only
 * {@link invalidate} notifies subscribers.
 */
export async function query<T>(
  key: string,
  fetcher: () => Promise<T>,
  opts: QueryOpts = {},
): Promise<T> {
  const { ttlMs = 30_000, retries = 1 } = opts;
  const existing = store.get(key) as Entry<T> | undefined;

  if (existing?.promise) return existing.promise; // de-dupe in-flight
  if (
    existing &&
    existing.error === undefined &&
    existing.data !== undefined &&
    Date.now() - existing.updatedAt < ttlMs
  ) {
    return existing.data as T; // fresh hit
  }

  const run = async (): Promise<T> => {
    let lastErr: unknown;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fetcher();
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr;
  };

  const promise = run().then(
    (data) => {
      store.set(key, { data, updatedAt: Date.now() });
      return data;
    },
    (error) => {
      store.set(key, { error, updatedAt: Date.now() });
      throw error;
    },
  );

  store.set(key, { ...(existing ?? { updatedAt: Date.now() }), promise });
  return promise;
}

/** Drop cached entries whose key equals or starts with `prefix`, and notify. */
export function invalidate(prefix: string): void {
  const keys = Array.from(store.keys()).filter((k) => k === prefix || k.startsWith(prefix));
  keys.forEach((k) => store.delete(k));
  keys.forEach(emit);
}

/** Test/reset helper — clears all cached state. */
export function __clearQueryCache(): void {
  store.clear();
  subscribers.clear();
}
