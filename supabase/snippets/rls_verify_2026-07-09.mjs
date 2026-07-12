// RLS verification (2026-07-09) — does the ANON key get denied on writes?
//
// Method (non-destructive): attempt an INSERT of an EMPTY object as the anon
// role. If RLS blocks anon inserts we get 42501 (insufficient_privilege) — the
// row is never evaluated. If RLS does NOT block, the insert proceeds to column
// constraints and fails with 23502 (not-null) / 23503 (fk) / 23514 (check) —
// which means the table would accept an anon write with a valid payload = GAP.
// Either way nothing is written (empty payload can't satisfy NOT NULL columns).
//
// Run: node --env-file=.env supabase/snippets/rls_verify_2026-07-09.mjs

import { createClient } from '@supabase/supabase-js';

const URL = process.env.SUPABASE_URL;
const ANON = process.env.SUPABASE_ANON_KEY; // MUST be anon, not service_role
if (!URL || !ANON) { console.error('need SUPABASE_URL + SUPABASE_ANON_KEY'); process.exit(1); }
const sb = createClient(URL, ANON, { auth: { persistSession: false } });

const TABLES = [
  // content (regression — hardened 2026-07-01)
  'posts', 'post_media', 'post_likes', 'post_comments',
  // social graph / engagement
  'follows', 'notifications', 'saved_posts', 'collections', 'collection_posts',
  // moderation
  'reports', 'blocked_users', 'restricted_users', 'muted_keywords',
  // garage
  'cars', 'car_images', 'modifications', 'timelines',
  // competitions
  'competitions', 'competition_entries', 'competition_media',
  // messaging
  'conversations', 'conversation_members', 'messages',
  // groups
  'groups', 'group_members', 'group_posts', 'group_events', 'group_gallery',
  // vendors / tags / saved products (newer)
  'vendors', 'post_tags', 'saved_products',
  // events
  'events', 'event_attendees',
  // push
  'device_tokens',
  // hashtags
  'hashtags', 'post_hashtags',
];

const PROTECTED = '42501';
const REACHED_CONSTRAINT = new Set(['23502', '23503', '23514']); // RLS let it through

let pass = 0, gap = 0, missing = 0, unknown = 0;
const gaps = [];

for (const t of TABLES) {
  const { error } = await sb.from(t).insert({});
  let verdict;
  if (!error) { verdict = '❌❌ INSERT SUCCEEDED (anon wrote a row!)'; gap++; gaps.push(t); }
  else if (error.code === PROTECTED) { verdict = '✅ protected (42501)'; pass++; }
  else if (REACHED_CONSTRAINT.has(error.code)) { verdict = `❌ NOT protected — RLS allowed anon (reached ${error.code})`; gap++; gaps.push(t); }
  else if (error.code === '42P01' || /does not exist/i.test(error.message)) { verdict = '⚠️ table missing'; missing++; }
  else { verdict = `? ${error.code ?? ''} ${error.message}`; unknown++; }
  console.log(`  ${t.padEnd(22)} ${verdict}`);
}

console.log(`\nSUMMARY: ${pass} protected, ${gap} GAP, ${missing} missing, ${unknown} unknown`);
if (gaps.length) console.log('GAPS TO FIX:', gaps.join(', '));
