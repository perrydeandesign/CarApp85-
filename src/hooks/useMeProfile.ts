import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type MeProfile = {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
};

/**
 * Resolves "ME" to a real Supabase profile row. In dev / investor mode we use
 * the first seeded profile so the whole app renders end-to-end against real data
 * without a login flow. When auth is on, swap this to `supabase.auth.getUser()`.
 */
export function useMeProfile() {
  const [data, setData] = useState<MeProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('profiles')
      .select('id, username, avatar_url, bio, location')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()
      .then(({ data: row }) => {
        if (cancelled) return;
        setData(row ?? null);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { data, loading };
}
