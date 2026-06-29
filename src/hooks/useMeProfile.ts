import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { TABLES } from '../data/tables';

export type MeProfile = {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
};

const PROFILE_COLS = 'id, username, avatar_url, bio, location';

// Cache the seeded-fallback profile (demo mode) so the many components that
// need "me" share one round-trip. The authed path is keyed per-user.
let seededPromise: Promise<MeProfile | null> | null = null;
function fetchSeeded(): Promise<MeProfile | null> {
  if (!seededPromise) {
    seededPromise = supabase
      .from(TABLES.profiles)
      .select(PROFILE_COLS)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => (data ?? null) as MeProfile | null)
      .catch(() => null);
  }
  return seededPromise;
}

/** Resolve (and self-heal) the profile row for an authenticated user. */
async function fetchForUser(userId: string): Promise<MeProfile | null> {
  const { data } = await supabase
    .from(TABLES.profiles)
    .select(PROFILE_COLS)
    .eq('id', userId)
    .maybeSingle();
  if (data) return data as MeProfile;

  // First login after sign-up and the row doesn't exist yet (no DB trigger) —
  // create a minimal profile so the app has a "me" to attribute to.
  const { data: authData } = await supabase.auth.getUser();
  const username =
    (authData.user?.user_metadata?.username as string | undefined) ||
    authData.user?.email?.split('@')[0] ||
    'user';
  const { data: created } = await supabase
    .from(TABLES.profiles)
    .upsert({ id: userId, username }, { onConflict: 'id' })
    .select(PROFILE_COLS)
    .maybeSingle();
  return (created ?? null) as MeProfile | null;
}

/**
 * Resolves "ME".
 *  - Authenticated  → the logged-in user's profile (created if missing).
 *  - Demo (no session) → the first seeded profile, so the app renders
 *    end-to-end without a login.
 *
 * Reads the session directly so it works whether or not the app is wrapped in
 * AuthProvider; updates live on auth state changes.
 */
export function useMeProfile() {
  const [data, setData] = useState<MeProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const resolve = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData.session?.user.id;
      const row = uid ? await fetchForUser(uid) : await fetchSeeded();
      if (!cancelled) {
        setData(row);
        setLoading(false);
      }
    };
    void resolve();

    // Re-resolve when the user logs in / out.
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      setLoading(true);
      void resolve();
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  return { data, loading };
}
