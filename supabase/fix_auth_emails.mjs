// Align each auth user's email + metadata username to their (curated) profile
// username, so logging in as <username>@modified.demo resolves the matching
// handle. profiles.id === auth.users.id, so we map 1:1.
//
// Run: node supabase/fix_auth_emails.mjs

import { createClient } from '@supabase/supabase-js';

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) throw new Error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
const sb = createClient(URL, KEY, { auth: { persistSession: false } });

(async () => {
  // All profiles (id + curated username).
  const profiles = [];
  let from = 0;
  while (true) {
    const { data, error } = await sb.from('profiles').select('id, username').order('id').range(from, from + 999);
    if (error) throw error;
    if (!data || data.length === 0) break;
    profiles.push(...data);
    if (data.length < 1000) break;
    from += 1000;
  }
  console.log(`${profiles.length} profiles`);

  let fixed = 0, already = 0, failed = 0;
  for (const p of profiles) {
    const wanted = `${p.username}@modified.demo`;
    const { data: userResp, error: getErr } = await sb.auth.admin.getUserById(p.id);
    if (getErr || !userResp?.user) { failed++; continue; }
    if (userResp.user.email === wanted) { already++; continue; }
    const { error: updErr } = await sb.auth.admin.updateUserById(p.id, {
      email: wanted,
      email_confirm: true,
      user_metadata: { ...userResp.user.user_metadata, username: p.username },
    });
    if (updErr) { failed++; if (failed < 5) console.error('  ✗', p.username, updErr.message); }
    else fixed++;
    if ((fixed + already) % 20 === 0) process.stdout.write(`   ${fixed} aligned, ${already} ok\r`);
  }
  console.log(`\naligned ${fixed}, already-correct ${already}, failed ${failed}`);
  console.log('All seeded logins are now <username>@modified.demo / Demo!Password123');
})().catch((e) => { console.error(e); process.exit(1); });
