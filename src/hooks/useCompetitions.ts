import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type CompEntry = {
  id: string;
  profile_id: string;
  car_id: string | null;
  profile: { username: string; avatar_url: string | null } | null;
  competition_media: { media_url: string }[];
};

export type Competition = {
  id: string;
  name: string;
  description: string | null;
  ends_at: string;
};

export function useCompetitions() {
  const [data, setData] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    supabase
      .from('competitions')
      .select('id, name, description, ends_at')
      .order('ends_at', { ascending: true })
      .then(({ data: rows, error: err }) => {
        if (cancelled) return;
        if (err) setError(err.message);
        else setData(rows ?? []);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);
  return { data, loading, error };
}

export function useCompetitionEntries(competitionId: string | null) {
  const [data, setData] = useState<CompEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!competitionId) return;
    let cancelled = false;
    setLoading(true);
    supabase
      .from('competition_entries')
      .select(`
        id, profile_id, car_id,
        profile:profiles ( username, avatar_url ),
        competition_media ( media_url )
      `)
      .eq('competition_id', competitionId)
      .then(({ data: rows, error: err }) => {
        if (cancelled) return;
        if (err) setError(err.message);
        else setData((rows ?? []) as unknown as CompEntry[]);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [competitionId]);
  return { data, loading, error };
}

/** Days remaining (rounded up) until ends_at. */
export function daysLeft(endsAt: string): number {
  const ms = new Date(endsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86400000));
}
