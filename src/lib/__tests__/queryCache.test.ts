import { query, invalidate, peek, subscribe, __clearQueryCache } from '../queryCache';

beforeEach(() => __clearQueryCache());

describe('queryCache.query', () => {
  it('de-duplicates concurrent requests for the same key', async () => {
    const fetcher = jest.fn(async () => 'v1');
    const [a, b] = await Promise.all([query('k', fetcher), query('k', fetcher)]);
    expect(a).toBe('v1');
    expect(b).toBe('v1');
    expect(fetcher).toHaveBeenCalledTimes(1); // shared in-flight promise
  });

  it('serves a fresh cached value without re-fetching', async () => {
    const fetcher = jest.fn(async () => 'v1');
    await query('k', fetcher, { ttlMs: 10_000 });
    await query('k', fetcher, { ttlMs: 10_000 });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('re-fetches once the entry is older than its TTL', async () => {
    let n = 0;
    const fetcher = jest.fn(async () => `v${++n}`);
    expect(await query('k', fetcher, { ttlMs: 0 })).toBe('v1');
    const second = await query('k', fetcher, { ttlMs: 0 });
    expect(second).toBe('v2');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('retries once on failure then succeeds', async () => {
    const fetcher = jest
      .fn()
      .mockRejectedValueOnce(new Error('flaky'))
      .mockResolvedValueOnce('ok');
    expect(await query('k', fetcher, { retries: 1 })).toBe('ok');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('rejects after exhausting retries', async () => {
    const fetcher = jest.fn(async () => {
      throw new Error('down');
    });
    await expect(query('k', fetcher, { retries: 1 })).rejects.toThrow('down');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});

describe('queryCache.invalidate', () => {
  it('drops entries by exact key and by prefix, and notifies subscribers', async () => {
    await query('profileHeader:a', async () => 'A', { ttlMs: 10_000 });
    await query('profileHeader:b', async () => 'B', { ttlMs: 10_000 });
    const hit = jest.fn();
    subscribe('profileHeader:a', hit);

    invalidate('profileHeader:'); // prefix wipes both

    expect(peek('profileHeader:a')).toBeUndefined();
    expect(peek('profileHeader:b')).toBeUndefined();
    expect(hit).toHaveBeenCalledTimes(1);
  });
});
