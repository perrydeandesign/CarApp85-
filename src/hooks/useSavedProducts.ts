import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useMeProfile } from './useMeProfile';

// saved_products isn't in the generated Database type.
const db = supabase as any;

/**
 * Per-user saved products (for sale alerts). Persists to saved_products when
 * authenticated; optimistic local state always reflects the toggle so the UI
 * responds immediately.
 */
export function useSavedProducts() {
  const { data: me } = useMeProfile();
  const meId = me?.id ?? null;
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    if (!meId) {
      setSavedKeys(new Set());
      return;
    }
    const { data } = await db.from('saved_products').select('product_key').eq('user_id', meId);
    setSavedKeys(new Set(((data ?? []) as any[]).map((r) => r.product_key)));
  }, [meId]);

  useEffect(() => {
    void load();
  }, [load]);

  const isSaved = useCallback((key: string) => savedKeys.has(key), [savedKeys]);

  const toggle = useCallback(
    async (key: string) => {
      if (!meId) return;
      const has = savedKeys.has(key);
      setSavedKeys((prev) => {
        const next = new Set(prev);
        if (has) next.delete(key);
        else next.add(key);
        return next;
      });
      if (has) {
        const { error } = await db.from('saved_products').delete().eq('user_id', meId).eq('product_key', key);
        if (error) void load();
      } else {
        const { error } = await db.from('saved_products').insert({ user_id: meId, product_key: key });
        if (error && !/duplicate key/i.test(error.message)) void load();
      }
    },
    [meId, savedKeys, load],
  );

  return { savedKeys, isSaved, toggle, refresh: load };
}
