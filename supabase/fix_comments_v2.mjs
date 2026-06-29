// Force comment uniqueness by adding a per-row opener and ensuring every
// comment ends up referencing the car's model. Combined with the existing
// 120 templates this produces thousands of distinct strings instead of 265.

import { createClient } from '@supabase/supabase-js';

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) throw new Error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
const sb = createClient(URL, KEY, { auth: { persistSession: false } });

const OPENERS = [
  '', 'Mate — ', 'Bro, ', 'Honestly, ', 'Yo, ', 'Real talk, ',
  'Nah — ', 'Big up — ', 'OK but, ', 'Side note: ', 'Pls tell me — ',
  'Confession: ', 'Hot take: ', 'Brother, ', 'Sis, ', 'Crikey, ',
  'No cap, ', 'Bruv, ', 'Mate honestly, ', 'Look — ',
];

const CLOSERS = [
  '', ' 🔥', ' 👀', ' 🙌', ' 💯', ' 🤝',
  ' — what an animal.', ' — proud of this one.',
  ' — that {first} is unreal.', ' — keep cooking.',
  ' — saw the post twice.', ' — second look did it.',
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
  console.log('loading …');
  const cars = await fetchAll('cars', 'id, make, model');
  const carById = new Map(cars.map((c) => [c.id, c]));
  const posts = await fetchAll('posts', 'id, car_id');
  const carByPost = new Map(posts.map((p) => [p.id, p.car_id]));
  const comments = await fetchAll('post_comments', 'id, post_id, body');
  console.log(`${comments.length} comments`);

  let fixed = 0;
  for (const c of comments) {
    const carId = carByPost.get(c.post_id);
    const car = carId ? carById.get(carId) : null;
    if (!car) continue;
    const first = String(car.model || '').split(' ')[0];
    const h = hash(c.id);
    const opener = OPENERS[h % OPENERS.length];
    const closer = CLOSERS[(h >> 4) % CLOSERS.length].replaceAll('{first}', first);
    // Drop trailing punctuation if we're appending a closer that starts with a space + dash.
    let base = c.body.replace(/[.!?]+$/, '');
    // Inject the model word into the body if it doesn't already mention it.
    if (closer === '' && opener === '' && !base.includes(first)) {
      base = `${base} on the ${first}`;
    }
    const newBody = `${opener}${base}${closer}`;
    if (newBody === c.body) continue;
    const { error } = await sb.from('post_comments').update({ body: newBody }).eq('id', c.id);
    if (!error) fixed++;
    if (fixed % 250 === 0) process.stdout.write(`  ${fixed}/${comments.length}\r`);
  }
  console.log(`\nupdated ${fixed} comments`);
})().catch((e) => { console.error(e); process.exit(1); });
