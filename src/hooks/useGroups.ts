import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useMeProfile } from './useMeProfile';
import type { Group } from '../constants/types';

// The generated Database type doesn't include the group_* tables yet, so use an
// untyped view of the client for these queries (same pattern as lib/data.ts).
const db = supabase as any;

// One nested read maps straight onto the UI Group shape (members/posts/events/
// gallery). profile_id → profiles is the only FK to profiles on each child
// table, so PostgREST resolves `profiles(...)` without an explicit hint.
const GROUP_SELECT = `
  id, name, description, banner_url, icon_url, privacy, created_at,
  group_members ( profile_id, role, profiles ( username, avatar_url ) ),
  group_posts ( id, profile_id, caption, photos, like_count, comment_count, created_at, profiles ( username, avatar_url ) ),
  group_events ( id, title, location, banner_url, starts_at ),
  group_gallery ( id, url )
`;

function mapGroup(row: any, carModelById: Record<string, string>): Group {
  const members = (row.group_members ?? []).map((m: any) => ({
    id: m.profile_id,
    username: m.profiles?.username ?? 'user',
    avatar: m.profiles?.avatar_url ?? '',
    carModel: carModelById[m.profile_id] ?? '',
    role: (m.role === 'admin' ? 'admin' : 'member') as 'admin' | 'member',
  }));
  const posts = (row.group_posts ?? [])
    .map((p: any) => ({
      id: p.id,
      groupId: row.id,
      userId: p.profile_id,
      username: p.profiles?.username ?? 'user',
      avatar: p.profiles?.avatar_url ?? '',
      caption: p.caption ?? '',
      photos: p.photos ?? [],
      likes: p.like_count ?? 0,
      comments: p.comment_count ?? 0,
      createdAt: p.created_at ? Date.parse(p.created_at) : 0,
    }))
    .sort((a: any, b: any) => b.createdAt - a.createdAt);
  const events = (row.group_events ?? []).map((e: any) => {
    const d = e.starts_at ? new Date(e.starts_at) : null;
    return {
      id: e.id,
      groupId: row.id,
      title: e.title,
      date: d ? d.toLocaleDateString('en-AU', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
      time: d ? d.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' }) : '',
      location: e.location ?? '',
      bannerUrl: e.banner_url ?? '',
      attendees: members.slice(0, 6),
    };
  });
  const gallery = (row.group_gallery ?? []).map((g: any) => ({ id: g.id, groupId: row.id, url: g.url }));
  return {
    id: row.id,
    name: row.name,
    bannerUrl: row.banner_url ?? '',
    iconUrl: row.icon_url ?? '',
    description: row.description ?? '',
    privacy: row.privacy === 'private' ? 'private' : 'public',
    members,
    posts,
    events,
    gallery,
    createdAt: row.created_at ? Date.parse(row.created_at) : 0,
  };
}

export function useGroups() {
  const { data: me } = useMeProfile();
  const meId = me?.id ?? null;
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: rows }, { data: cars }] = await Promise.all([
      db.from('groups').select(GROUP_SELECT).order('created_at', { ascending: false }),
      db.from('cars').select('profile_id, make, model, year'),
    ]);
    const carModelById: Record<string, string> = {};
    for (const c of (cars ?? []) as any[]) {
      if (!carModelById[c.profile_id]) {
        carModelById[c.profile_id] = `${c.year ?? ''} ${c.make} ${c.model}`.trim();
      }
    }
    setGroups(((rows ?? []) as any[]).map((r) => mapGroup(r, carModelById)));
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const createGroup = useCallback(
    async (name: string, description: string, privacy: 'public' | 'private'): Promise<string | null> => {
      if (!meId) return null;
      const banner = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800';
      const icon = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=200';
      const { data, error } = await db
        .from('groups')
        .insert({ name, description, privacy, banner_url: banner, icon_url: icon, created_by: meId })
        .select('id')
        .single();
      if (error || !data) {
        console.warn('createGroup failed', error);
        return null;
      }
      // Creator joins as admin.
      await db.from('group_members').insert({ group_id: data.id, profile_id: meId, role: 'admin' });
      await load();
      return data.id;
    },
    [meId, load],
  );

  const joinGroup = useCallback(
    async (groupId: string) => {
      if (!meId) return;
      setGroups((prev) => prev.map((g) => (g.id === groupId && !g.members.some((m) => m.id === meId)
        ? { ...g, members: [...g.members, { id: meId, username: me?.username ?? 'you', avatar: me?.avatar_url ?? '', carModel: '', role: 'member' }] }
        : g)));
      const { error } = await db.from('group_members').insert({ group_id: groupId, profile_id: meId, role: 'member' });
      if (error && !/duplicate key/i.test(error.message)) void load();
    },
    [meId, me, load],
  );

  const leaveGroup = useCallback(
    async (groupId: string) => {
      if (!meId) return;
      setGroups((prev) => prev.map((g) => (g.id === groupId
        ? { ...g, members: g.members.filter((m) => m.id !== meId) }
        : g)));
      const { error } = await db.from('group_members').delete().eq('group_id', groupId).eq('profile_id', meId);
      if (error) void load();
    },
    [meId, load],
  );

  return { groups, loading, meId, refresh: load, createGroup, joinGroup, leaveGroup };
}
