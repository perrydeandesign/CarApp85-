import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type EventRSVP = 'going' | 'interested';

export type CarEvent = {
  id: string;
  hostId: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  locationText: string | null;
  startsAt: string;
  endsAt: string | null;
  attendeeCount: number;
  myStatus: EventRSVP | null;
};

type NewEvent = {
  title: string;
  description?: string;
  locationText?: string;
  coverUrl?: string;
  startsAt: string; // ISO
  endsAt?: string;
};

type EventPatch = Partial<NewEvent>;

/** Upcoming events + RSVP. Backed by events / event_attendees (RLS). */
export function useEvents() {
  const [events, setEvents] = useState<CarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);

  const load = useCallback(async (nowIso: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const me = sess.session?.user?.id ?? null;
      setUid(me);

      const { data, error: err } = await supabase
        .from('events')
        .select('id, host_id, title, description, cover_url, location_text, starts_at, ends_at, attendee_count')
        .gte('starts_at', nowIso)
        .order('starts_at', { ascending: true })
        .limit(100);
      if (err) throw err;

      const ids = (data ?? []).map((e: any) => e.id);
      let mine: Record<string, EventRSVP> = {};
      if (me && ids.length) {
        const { data: att } = await supabase
          .from('event_attendees')
          .select('event_id, status')
          .eq('profile_id', me)
          .in('event_id', ids);
        mine = Object.fromEntries((att ?? []).map((r: any) => [r.event_id, r.status]));
      }

      setEvents(
        (data ?? []).map((e: any) => ({
          id: e.id,
          hostId: e.host_id,
          title: e.title,
          description: e.description,
          coverUrl: e.cover_url,
          locationText: e.location_text,
          startsAt: e.starts_at,
          endsAt: e.ends_at,
          attendeeCount: e.attendee_count,
          myStatus: mine[e.id] ?? null,
        })),
      );
    } catch (e: any) {
      setError(e?.message ?? 'Could not load events.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(new Date().toISOString());
  }, [load]);

  const rsvp = useCallback(
    async (eventId: string, status: EventRSVP | null) => {
      if (!uid) return;
      // optimistic
      setEvents((prev) =>
        prev.map((e) => {
          if (e.id !== eventId) return e;
          const was = e.myStatus;
          const delta = (status ? 1 : 0) - (was ? 1 : 0);
          return { ...e, myStatus: status, attendeeCount: Math.max(0, e.attendeeCount + delta) };
        }),
      );
      if (status) {
        await supabase.from('event_attendees').upsert({ event_id: eventId, profile_id: uid, status });
      } else {
        await supabase.from('event_attendees').delete().eq('event_id', eventId).eq('profile_id', uid);
      }
    },
    [uid],
  );

  const createEvent = useCallback(
    async (input: NewEvent): Promise<string | null> => {
      if (!uid) return null;
      const { data, error: err } = await supabase
        .from('events')
        .insert({
          host_id: uid,
          title: input.title.trim(),
          description: input.description?.trim() || null,
          location_text: input.locationText?.trim() || null,
          cover_url: input.coverUrl?.trim() || null,
          starts_at: input.startsAt,
          ends_at: input.endsAt ?? null,
        })
        .select('id')
        .single();
      if (err) throw err;
      await load(new Date().toISOString());
      return data?.id ?? null;
    },
    [uid, load],
  );

  // Host-only edit. RLS (events_update: host_id = auth.uid()) enforces ownership.
  const updateEvent = useCallback(
    async (id: string, patch: EventPatch): Promise<void> => {
      if (!uid) return;
      const row: {
        title?: string;
        description?: string | null;
        location_text?: string | null;
        cover_url?: string | null;
        starts_at?: string;
        ends_at?: string | null;
      } = {};
      if (patch.title !== undefined) row.title = patch.title.trim();
      if (patch.description !== undefined) row.description = patch.description?.trim() || null;
      if (patch.locationText !== undefined) row.location_text = patch.locationText?.trim() || null;
      if (patch.coverUrl !== undefined) row.cover_url = patch.coverUrl?.trim() || null;
      if (patch.startsAt !== undefined) row.starts_at = patch.startsAt;
      if (patch.endsAt !== undefined) row.ends_at = patch.endsAt ?? null;
      const { error: err } = await supabase.from('events').update(row).eq('id', id);
      if (err) throw err;
      await load(new Date().toISOString());
    },
    [uid, load],
  );

  // Host-only delete. RLS (events_delete: host_id = auth.uid()) enforces ownership.
  const deleteEvent = useCallback(
    async (id: string): Promise<void> => {
      if (!uid) return;
      const { error: err } = await supabase.from('events').delete().eq('id', id);
      if (err) throw err;
      setEvents((prev) => prev.filter((e) => e.id !== id));
    },
    [uid],
  );

  return {
    events,
    loading,
    error,
    uid,
    rsvp,
    createEvent,
    updateEvent,
    deleteEvent,
    refresh: () => load(new Date().toISOString()),
  };
}
