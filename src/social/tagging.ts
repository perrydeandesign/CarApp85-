import { supabase } from '../lib/supabase';

// vendors / post_tags aren't in the generated Database type yet.
const db = supabase as any;

export type Taggable = {
  type: 'profile' | 'vendor';
  id: string;
  handle: string; // username (people) or vendor handle
  name: string; // display name
  avatarUrl?: string | null;
  subtitle?: string;
};

/** Search people + vendors for the @-mention picker. */
export async function searchTaggables(query: string, limit = 6): Promise<Taggable[]> {
  const q = query.trim();
  if (!q) return [];
  const like = `%${q}%`;
  const [profs, vends] = await Promise.all([
    supabase.from('profiles').select('id, username, avatar_url').ilike('username', like).limit(limit),
    db.from('vendors').select('id, handle, name').ilike('handle', like).limit(limit),
  ]);
  const people: Taggable[] = ((profs.data ?? []) as any[]).map((p) => ({
    type: 'profile', id: p.id, handle: p.username, name: p.username, avatarUrl: p.avatar_url, subtitle: 'Person',
  }));
  const vendors: Taggable[] = ((vends.data ?? []) as any[]).map((v) => ({
    type: 'vendor', id: v.id, handle: v.handle, name: v.name, subtitle: 'Vendor',
  }));
  return [...people, ...vendors];
}

/**
 * Resolve a set of @handles to real profile/vendor ids and persist post_tags.
 * Handles are matched case-insensitively; unknown handles are ignored.
 */
export async function persistPostTags(postId: string, handles: string[]): Promise<void> {
  const norm = Array.from(new Set(handles.map((h) => h.replace(/^@/, '').toLowerCase()).filter(Boolean)));
  if (norm.length === 0) return;

  const [profs, vends] = await Promise.all([
    supabase.from('profiles').select('id, username').in('username', norm),
    db.from('vendors').select('id, handle').in('handle', norm),
  ]);

  const rows: any[] = [];
  for (const p of (profs.data ?? []) as any[]) rows.push({ post_id: postId, tagged_type: 'profile', profile_id: p.id });
  for (const v of (vends.data ?? []) as any[]) rows.push({ post_id: postId, tagged_type: 'vendor', vendor_id: v.id });
  if (rows.length === 0) return;

  const { error } = await db.from('post_tags').insert(rows);
  if (error) console.warn('persistPostTags failed', error);
}

/** Is this @handle a known vendor? (used to route mention taps.) */
export async function isVendorHandle(handle: string): Promise<boolean> {
  const h = handle.replace(/^@/, '').toLowerCase();
  const { data } = await db.from('vendors').select('id').eq('handle', h).maybeSingle();
  return !!data;
}
