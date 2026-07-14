// Read-only live-schema audit (2026-07-09).
//
// The live Supabase DB was built MANUALLY — repo migrations are not the deployed
// truth (see memory: live-schema-ground-truth). Before writing notification
// triggers we must know the REAL columns. This script asks PostgREST for its
// OpenAPI spec (which enumerates every exposed table + its columns) and prints
// the shape of the tables the notification system touches. It writes NOTHING.
//
// Run:  node --env-file=.env supabase/snippets/audit_live_schema_2026-07-09.mjs

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
if (!URL || !KEY) {
  console.error('Missing SUPABASE_URL or a key (SERVICE_ROLE preferred, ANON ok) in .env');
  process.exit(1);
}

// Tables the notification pipeline reads from / writes to.
const TARGETS = [
  'notifications',
  'posts',
  'post_likes', 'likes',
  'post_comments', 'comments',
  'follows',
  'post_tags', 'photo_tags',
  'profiles',
];

const res = await fetch(`${URL}/rest/v1/`, {
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
});
if (!res.ok) {
  console.error(`OpenAPI fetch failed: ${res.status} ${res.statusText}`);
  process.exit(1);
}
const spec = await res.json();
const defs = spec.definitions ?? {};
const present = new Set(Object.keys(defs));

console.log('\n=== LIVE TABLE PRESENCE ===');
for (const t of TARGETS) {
  console.log(`  ${present.has(t) ? '✅' : '❌ MISSING'}  ${t}`);
}

console.log('\n=== LIVE COLUMNS (from PostgREST OpenAPI) ===');
for (const t of TARGETS) {
  if (!present.has(t)) continue;
  const props = defs[t].properties ?? {};
  console.log(`\n▸ ${t}`);
  for (const [col, meta] of Object.entries(props)) {
    const type = meta.format || meta.type || '?';
    const note = (meta.description || '').replace(/\s+/g, ' ').trim();
    console.log(`    ${col.padEnd(20)} ${String(type).padEnd(14)} ${note}`);
  }
}

// Whole-schema table list, so we see anything we didn't think to ask for.
console.log('\n=== ALL EXPOSED TABLES ===');
console.log('  ' + Object.keys(defs).sort().join(', '));
console.log('');
