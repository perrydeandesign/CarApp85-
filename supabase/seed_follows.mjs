// MODIFIED — follow-graph seed. Idempotent (ignores duplicates).
// Run: npm run seed:follows
//
// Populates the `follows` table so the demo has a realistic social graph:
//  - every profile follows the next FANOUT profiles in a deterministic ring,
//    giving everyone ~FANOUT following and ~FANOUT followers;
//  - the demo persona (jake_sti) is padded into a "hero" account with extra
//    followers so the Profile tab demos well.
// Deterministic (no randomness) so re-running converges to the same graph.

import { createClient } from '@supabase/supabase-js';

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
const sb = createClient(URL, KEY, { auth: { persistSession: false } });

const FANOUT = 8;             // how many each profile follows in the ring
const HERO_USERNAME = 'jake_sti';
const HERO_FOLLOWERS = 25;    // extra followers for the demo persona
const HERO_FOLLOWING = 18;    // extra following for the demo persona

async function main() {
  const { data: profiles, error } = await sb
    .from('profiles')
    .select('id, username')
    .order('created_at', { ascending: true });
  if (error) {
    console.error('load profiles failed:', error.message);
    process.exit(1);
  }
  const ids = profiles.map((p) => p.id);
  const n = ids.length;
  if (n < 2) {
    console.error('need at least 2 profiles to build a follow graph');
    process.exit(1);
  }

  const rows = [];
  const seen = new Set();
  const add = (follower_id, following_id) => {
    if (follower_id === following_id) return;
    const k = follower_id + '>' + following_id;
    if (seen.has(k)) return;
    seen.add(k);
    rows.push({ follower_id, following_id });
  };

  // Deterministic ring: profile i follows the next FANOUT profiles (mod n).
  for (let i = 0; i < n; i++) {
    for (let j = 1; j <= FANOUT; j++) add(ids[i], ids[(i + j) % n]);
  }

  // Hero padding for the demo persona.
  const hero = profiles.find((p) => p.username?.toLowerCase() === HERO_USERNAME);
  if (hero) {
    const others = ids.filter((id) => id !== hero.id);
    for (let j = 0; j < Math.min(HERO_FOLLOWERS, others.length); j++) add(others[j], hero.id);
    for (let j = 0; j < Math.min(HERO_FOLLOWING, others.length); j++) add(hero.id, others[others.length - 1 - j]);
  } else {
    console.warn(`hero "${HERO_USERNAME}" not found — skipping hero padding`);
  }

  // Upsert in chunks, ignoring rows that already exist.
  let inserted = 0;
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    const { error: upErr } = await sb
      .from('follows')
      .upsert(chunk, { onConflict: 'follower_id,following_id', ignoreDuplicates: true });
    if (upErr) {
      console.error('upsert chunk failed:', upErr.message);
      process.exit(1);
    }
    inserted += chunk.length;
  }

  console.log(`seeded follow graph: ${n} profiles, ${rows.length} edges (FANOUT=${FANOUT}), hero=${hero ? HERO_USERNAME : 'none'}`);
}

main();
