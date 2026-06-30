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
const CONCURRENCY = 3; // low — Wikimedia rate-limits bulk pulls

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

  // Pre-list everything already in the bucket so re-runs skip done work
  // reliably (the per-file list({search}) was unreliable).
  const existing = new Set();
  {
    let offset = 0;
    while (true) {
      const { data } = await sb.storage.from(BUCKET).list(PREFIX, { limit: 1000, offset });
      if (!data || data.length === 0) break;
      data.forEach((f) => existing.add(f.name));
      if (data.length < 1000) break;
      offset += 1000;
    }
  }
  console.log(`   ${existing.size} already in Storage`);

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // 3. Download + upload each once (throttled + retried — Wikimedia rate-limits
  // bulk pulls), building old→new map.
  const map = new Map();
  let done = 0, failed = 0;
  await pool(urlList, CONCURRENCY, async (u) => {
    const name = `${hashUrl(u)}.jpg`;
    const publicUrl = sb.storage.from(BUCKET).getPublicUrl(`${PREFIX}/${name}`).data.publicUrl;
    if (existing.has(name)) { map.set(u, publicUrl); done++; return; }

    // Retry with exponential backoff to survive 429s.
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const res = await fetch(u, { headers: { 'User-Agent': UA } });
        if (res.status === 429) { await sleep(1500 * (attempt + 1)); continue; }
        if (!res.ok) break;
        const buf = Buffer.from(await res.arrayBuffer());
        const { error } = await sb.storage.from(BUCKET).upload(`${PREFIX}/${name}`, buf, {
          contentType: res.headers.get('content-type') || 'image/jpeg',
          upsert: true,
        });
        if (error) break;
        map.set(u, publicUrl);
        done++;
        await sleep(120); // politeness
        return;
      } catch {
        await sleep(1000 * (attempt + 1));
      }
    }
    failed++;
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
