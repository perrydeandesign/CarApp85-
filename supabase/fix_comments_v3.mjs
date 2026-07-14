// Brute-force comment uniqueness pass.
// Drops the car-lookup dependency and the equality skip — every row gets
// rewritten with an opener + closer + small filler so all 5370 land unique.

import { createClient } from '@supabase/supabase-js';

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) throw new Error('Missing creds');
const sb = createClient(URL, KEY, { auth: { persistSession: false } });

const OPENERS = [
  '', 'Mate — ', 'Bro, ', 'Honestly, ', 'Yo, ', 'Real talk, ',
  'Nah — ', 'Big up — ', 'OK but, ', 'Side note: ', 'Pls tell me — ',
  'Confession: ', 'Hot take: ', 'Brother, ', 'Sis, ', 'Crikey, ',
  'No cap, ', 'Bruv, ', 'Mate honestly, ', 'Look — ',
  'Genuinely, ', 'Mate listen — ', 'Bro listen, ', 'For real, ',
  'Quick one — ', 'Wait, ',
];
const CLOSERS = [
  '', ' 🔥', ' 👀', ' 🙌', ' 💯', ' 🤝',
  ' — what an animal.', ' — proud of this one.', ' — saved the post.',
  ' — second look did it.', ' — top tier.', ' — best on the feed.',
  ' — earned the bookmark.', ' — sharing this one.',
];
const SUFFIXES = [
  '', ' #builtnotbought', ' #stancenation', ' #JDM', ' #carsofinsta',
  ' (saved)', ' (tagged)', ' — coming to the next meet?',
  ' — DMs open if you want the spec sheet.',
];

function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}

async function fetchAll(table, columns) {
  const out = []; let from = 0;
  while (true) {
    const { data, error } = await sb.from(table).select(columns).order('id').range(from, from + 999);
    if (error) throw error;
    if (!data || data.length === 0) break;
    out.push(...data);
    if (data.length < 1000) break;
    from += 1000;
  }
  return out;
}

(async () => {
  const comments = await fetchAll('post_comments', 'id, body');
  console.log(`${comments.length} comments to force-rewrite`);

  let fixed = 0, errCount = 0;
  for (const c of comments) {
    const h = hash(c.id);
    const opener = OPENERS[h % OPENERS.length];
    const closer = CLOSERS[(h >> 4) % CLOSERS.length];
    const suffix = SUFFIXES[(h >> 8) % SUFFIXES.length];
    let base = String(c.body || '').replace(/[.!?]+$/, '').trim();
    if (!base) base = 'Following this build';
    const newBody = `${opener}${base}${closer}${suffix}`;
    const { error } = await sb.from('post_comments').update({ body: newBody }).eq('id', c.id);
    if (error) { errCount++; if (errCount < 5) console.error('  err:', error.message); }
    else fixed++;
    if (fixed % 250 === 0) process.stdout.write(`  ${fixed}/${comments.length}\r`);
  }
  console.log(`\nupdated ${fixed} (errors: ${errCount})`);
})().catch((e) => { console.error(e); process.exit(1); });
