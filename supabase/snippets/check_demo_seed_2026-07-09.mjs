// Read-only: does the seeded jake_sti profile have enough real content that the
// hardcoded demo fallbacks (DEMO_ME_CARS/MODS, USER_PROFILES, ME) are redundant?
// Run: node --env-file=.env supabase/snippets/check_demo_seed_2026-07-09.mjs

import { createClient } from '@supabase/supabase-js';
const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
if (!URL || !KEY) { console.error('missing env'); process.exit(1); }
const sb = createClient(URL, KEY, { auth: { persistSession: false } });

const { data: prof } = await sb
  .from('profiles')
  .select('id, username, full_name, display_name, avatar_url, bio, location')
  .ilike('username', 'jake_sti')
  .maybeSingle();

if (!prof) { console.log('❌ jake_sti profile NOT found'); process.exit(0); }
console.log('▸ profile:', JSON.stringify(prof, null, 2));

const id = prof.id;
async function count(table, col, val, extra) {
  let q = sb.from(table).select('*', { count: 'exact', head: false }).eq(col, val).limit(3);
  const { data, count: c, error } = await q;
  return { table, count: error ? `ERR ${error.message}` : c, sample: (data ?? []).slice(0, 2) };
}

const cars = await count('cars', 'profile_id', id);
const posts = await count('posts', 'profile_id', id);
console.log(`\n▸ cars: ${cars.count}`);
console.log(JSON.stringify(cars.sample, null, 2));

let mods = { count: 'n/a (no cars)' };
if ((cars.sample ?? []).length) {
  const carIds = (cars.sample).map((c) => c.id);
  const { data, count: c } = await sb.from('modifications').select('*', { count: 'exact' }).in('car_id', carIds).limit(3);
  mods = { count: c, sample: (data ?? []).slice(0, 2) };
}
console.log(`\n▸ modifications (on sampled cars): ${mods.count}`);

console.log(`\n▸ posts: ${posts.count}`);
const media = await count('post_media', 'post_id', (posts.sample?.[0]?.id ?? '00000000-0000-0000-0000-000000000000'));
console.log(`▸ post_media (on first post): ${media.count}`);

const tl = await count('timelines', 'car_id', (cars.sample?.[0]?.id ?? '00000000-0000-0000-0000-000000000000'));
console.log(`▸ timelines (on first car): ${tl.count}`);

console.log('\n=== VERDICT INPUTS ===');
console.log(`cars=${cars.count} mods=${mods.count} posts=${posts.count} avatar=${!!prof.avatar_url} bio=${!!prof.bio}`);
