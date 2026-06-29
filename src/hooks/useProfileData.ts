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

function useFetch<T>(fn: () => Promise<T>, deps: any[]): { data: T | null; loading: boolean; error: string | null } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fn()
      .then((d) => { if (!cancelled) { setData(d); setError(null); } })
      .catch((e) => { if (!cancelled) setError(e?.message ?? String(e)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data, loading, error };
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
    return data ?? [];
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
    return data ?? [];
  }, [carId]);
}

export function usePostsByCar(carId: string | null) {
  return useFetch<CarPostRow[]>(async () => {
    if (!carId) return [];
    const { data, error } = await supabase
      .from('posts')
      .select('id, type, title, body, created_at, like_count, comment_count, post_media(id, media_url, media_type)')
      .eq('car_id', carId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as CarPostRow[];
  }, [carId]);
}

export function useProfilePosts(profileId: string | null) {
  return useFetch<CarPostRow[]>(async () => {
    if (!profileId) return [];
    const { data, error } = await supabase
      .from('posts')
      .select('id, type, title, body, created_at, like_count, comment_count, post_media(id, media_url, media_type)')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as CarPostRow[];
  }, [profileId]);
}

/** Group a flat mods list into the categorized shape the UI expects. */
export function bucketMods(mods: ModRow[]) {
  const out = { engine: [] as string[], wheels: [] as string[], interior: [] as string[], exterior: [] as string[] };
  for (const m of mods) out[m.category].push(m.name);
  return out;
}
