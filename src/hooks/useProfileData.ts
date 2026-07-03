import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// ---- Types matching the v2 schema ----

export type CarRow = {
  id: string;
  make: string;
  model: string;
  year: number | null;
  build_type: 'Track' | 'Daily' | 'Show' | 'JDM' | 'Drift' | 'Stance' | null;
  primary_image_url: string | null;
};

export type ModRow = {
  id: string;
  category: 'engine' | 'wheels' | 'interior' | 'exterior';
  name: string;
  notes: string | null;
};

export type CarPostRow = {
  id: string;
  type: 'modification' | 'track_day' | 'event' | 'media' | 'milestone';
  title: string | null;
  body: string | null;
  created_at: string;
  like_count: number;
  comment_count: number;
  post_media: { id: string; media_url: string; media_type: 'image' | 'video' }[];
};

function useFetch<T>(fn: () => Promise<T>, deps: any[]): {
  data: T | null; loading: boolean; error: string | null; refresh: () => void;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fn()
      .then((d) => { if (!cancelled) { setData(d); setError(null); } })
      .catch((e) => { if (!cancelled) setError(e?.message ?? String(e)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  return { data, loading, error, refresh: () => setTick((t) => t + 1) };
}

/** Resolve a real Supabase profile.id from a username (the demo CONNS UUIDs
 *  do NOT exist in the seeded Supabase profiles table, so we look up by name). */
export function useProfileIdByUsername(username: string | null) {
  return useFetch<string | null>(async () => {
    if (!username) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .ilike('username', username)   // case-insensitive
      .maybeSingle();
    if (error) throw error;
    return data?.id ?? null;
  }, [username]);
}

export function useCars(profileId: string | null) {
  return useFetch<CarRow[]>(async () => {
    if (!profileId) return [];
    const { data, error } = await supabase
      .from('cars')
      .select('id, make, model, year, build_type, primary_image_url')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []) as CarRow[];
  }, [profileId]);
}

export function useCarMods(carId: string | null) {
  return useFetch<ModRow[]>(async () => {
    if (!carId) return [];
    const { data, error } = await supabase
      .from('modifications')
      .select('id, category, name, notes')
      .eq('car_id', carId);
    if (error) throw error;
    return (data ?? []) as ModRow[];
  }, [carId]);
}

export function usePostsByCar(carId: string | null) {
  return useFetch<CarPostRow[]>(async () => {
    if (!carId) return [];
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id, type, title, body, created_at, like_count, comment_count,
        post_media:post_media!post_id ( id, media_url, media_type )
      `)
      .eq('car_id', carId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as CarPostRow[];
  }, [carId]);
}

export function useProfilePosts(profileId: string | null) {
  const result = useFetch<CarPostRow[]>(async () => {
    if (!profileId) return [];
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id, type, title, body, created_at, like_count, comment_count,
        post_media:post_media!post_id ( id, media_url, media_type )
      `)
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as CarPostRow[];
  }, [profileId]);

  // Realtime — new INSERTs by this profile re-fetch the grid so the just-
  // uploaded post appears at the top without a manual reload.
  useEffect(() => {
    if (!profileId) return;
    const channel = supabase
      .channel(`profile-posts-${profileId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts', filter: `profile_id=eq.${profileId}` },
        () => result.refresh(),
      )
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  return result;
}

/** Group a flat mods list into the categorized shape the UI expects. */
export function bucketMods(mods: ModRow[]) {
  const out = { engine: [] as string[], wheels: [] as string[], interior: [] as string[], exterior: [] as string[] };
  for (const m of mods) out[m.category].push(m.name);
  return out;
}
