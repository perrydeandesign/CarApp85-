// One-time: copy every hot-linked Wikimedia image into Supabase Storage and
// rewrite the DB URLs to the Storage public URLs. Removes the production
// rate-limit / hotlink fragility.
//
// Run: node supabase/mirror_images_to_storage.mjs

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) throw new Error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
const sb = createClient(URL, KEY, { auth: { persistSession: false } });

const BUCKET = 'media';
const PREFIX = 'mirror';
const UA = 'MODIFIED-app-seed/1.0 (https://modified.app; demo seed)';
const CONCURRENCY = 8;

const FIELDS = [
  ['cars', 'primary_image_url'],
  ['post_media', 'media_url'],
  ['competition_media', 'media_url'],
];

function hashUrl(u) {
  return crypto.createHash('sha1').update(u).digest('hex').slice(0, 20);
}

async function fetchAll(table, col) {
  const out = []; let from = 0;
  while (true) {
    const { data, error } = await sb.from(table).select(`id, ${col}`).order('id', { ascending: true }).range(from, from + 999);
    if (error) throw error;
    if (!data || data.length === 0) break;
    out.push(...data);
    if (data.length < 1000) break;
    from += 1000;
  }
  return out;
}

async function pool(items, n, worker) {
  let idx = 0;
  async function run() {
    while (idx < items.length) {
      const i = idx++;
      await worker(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: n }, run));
}

(async () => {
  // 1. Ensure bucket exists (public).
  const { data: buckets } = await sb.storage.listBuckets();
  if (!buckets?.some((b) => b.name === BUCKET)) {
    const { error } = await sb.storage.createBucket(BUCKET, { public: true });
    if (error) throw error;
    console.log(`created public bucket "${BUCKET}"`);
  } else {
    console.log(`bucket "${BUCKET}" exists`);
  }

  // 2. Collect distinct wikimedia URLs.
  const rowsByField = {};
  const urls = new Set();
  for (const [t, c] of FIELDS) {
    const rows = await fetchAll(t, c);
    rowsByField[`${t}.${c}`] = rows;
    rows.forEach((r) => { if (r[c]?.includes('wikimedia')) urls.add(r[c]); });
  }
  const urlList = [...urls];
  console.log(`${urlList.length} distinct Wikimedia URLs to mirror`);

  // 3. Download + upload each once, building old→new map.
  const map = new Map();
  let done = 0, failed = 0;
  await pool(urlList, CONCURRENCY, async (u) => {
    const key = `${PREFIX}/${hashUrl(u)}.jpg`;
    const publicUrl = sb.storage.from(BUCKET).getPublicUrl(key).data.publicUrl;
    try {
      // Skip re-download if already uploaded.
      const { data: head } = await sb.storage.from(BUCKET).list(PREFIX, { search: `${hashUrl(u)}.jpg` });
      if (head && head.length > 0) {
        map.set(u, publicUrl); done++; return;
      }
      const res = await fetch(u, { headers: { 'User-Agent': UA } });
      if (!res.ok) { failed++; return; }
      const buf = Buffer.from(await res.arrayBuffer());
      const { error } = await sb.storage.from(BUCKET).upload(key, buf, {
        contentType: res.headers.get('content-type') || 'image/jpeg',
        upsert: true,
      });
      if (error) { failed++; return; }
      map.set(u, publicUrl);
      done++;
    } catch {
      failed++;
    }
    if ((done + failed) % 50 === 0) process.stdout.write(`   ${done} uploaded, ${failed} failed\r`);
  });
  console.log(`\nmirrored ${done}, failed ${failed}`);

  // 4. Rewrite DB rows to the Storage URL.
  let rewritten = 0;
  for (const [t, c] of FIELDS) {
    const rows = rowsByField[`${t}.${c}`];
    for (const r of rows) {
      const old = r[c];
      const next = old ? map.get(old) : null;
      if (!next) continue;
      const { error } = await sb.from(t).update({ [c]: next }).eq('id', r.id);
      if (!error) rewritten++;
      if (rewritten % 200 === 0) process.stdout.write(`   ${rewritten} rows rewritten\r`);
    }
  }
  console.log(`\nrewrote ${rewritten} rows. done.`);
})().catch((e) => { console.error(e); process.exit(1); });
