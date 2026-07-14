// GPT-4o-mini vision audit for car photos.
//
// What it does:
//   1. Pulls every cars.primary_image_url + post_media.media_url from Supabase.
//   2. For each image, sends a vision-mode request to OpenAI asking for the car
//      make + model, plus an "is_car" boolean.
//   3. If the model isn't a car or doesn't reasonably match the row's expected
//      car (mismatch_threshold), the row is queued for replacement.
//   4. Queued rows get a fresh photo from the curated PHOTOS pool in
//      supabase/fix_content.mjs (or a per-make Unsplash search hit, if you
//      add a key).
//
// Cost & time:
//   - gpt-4o-mini vision is ~$0.15 / 1M input tokens. Each image input is
//     ~1500–3000 tokens. ~3500 rows × ~2k tokens = ~7M tokens → ~$1–3 budget.
//   - Throttled at 20 concurrent requests → ~10–30 minutes wall-clock.
//
// Setup:
//   1. Get a key from https://platform.openai.com/account/api-keys
//   2. Add `OPENAI_API_KEY=sk-...` to your .env
//   3. Run: node supabase/vision_audit.mjs
//
// Docs:
//   OpenAI vision guide: https://platform.openai.com/docs/guides/vision
//   GPT-4o-mini pricing: https://openai.com/api/pricing/
//
// Note: This is intentionally a separate script from fix_content.mjs because
// it's slow + costs money. Run after fix_content.mjs has applied the cheap
// deterministic fixes.

import { createClient } from '@supabase/supabase-js';

const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OAI_KEY = process.env.OPENAI_API_KEY;
if (!SB_URL || !SB_KEY) throw new Error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
if (!OAI_KEY) {
  console.error('Missing OPENAI_API_KEY in .env.');
  console.error('Get one at https://platform.openai.com/account/api-keys');
  process.exit(1);
}

const sb = createClient(SB_URL, SB_KEY, { auth: { persistSession: false } });

const MODEL = 'gpt-4o-mini'; // cheapest vision tier
const CONCURRENCY = 20;
const DRY_RUN = process.env.DRY_RUN === '1';

// ------------------------------------------------------------
async function classify(imageUrl) {
  const body = {
    model: MODEL,
    messages: [
      {
        role: 'system',
        content:
          'You are an automotive identifier. Given a single image, respond with a strict JSON object: ' +
          '{"is_car": boolean, "make": string|null, "model": string|null, "confidence": 0..1}. ' +
          'Be conservative — set is_car=false if the photo is a landscape, tool, person, or interior shot. ' +
          'Return ONLY the JSON, no prose.',
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Identify the car in this image.' },
          { type: 'image_url', image_url: { url: imageUrl } },
        ],
      },
    ],
    temperature: 0,
    response_format: { type: 'json_object' },
  };
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OAI_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`OpenAI ${res.status}: ${txt.slice(0, 200)}`);
  }
  const out = await res.json();
  const content = out.choices?.[0]?.message?.content ?? '{}';
  try { return JSON.parse(content); } catch { return { is_car: false, make: null, model: null, confidence: 0 }; }
}

// Simple promise pool — keeps `concurrency` requests in flight.
async function pool(items, concurrency, worker) {
  const results = new Array(items.length);
  let idx = 0;
  async function next() {
    while (true) {
      const i = idx++;
      if (i >= items.length) return;
      try { results[i] = await worker(items[i], i); }
      catch (e) { results[i] = { error: e.message }; }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, next));
  return results;
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
  console.log('1. loading rows …');
  const cars = await fetchAll('cars', 'id, make, model, primary_image_url');
  const posts = await fetchAll('posts', 'id, car_id');
  const carByPost = new Map(posts.map((p) => [p.id, p.car_id]));
  const carById = new Map(cars.map((c) => [c.id, c]));
  const media = await fetchAll('post_media', 'id, post_id, media_url');

  const rows = [
    ...cars.map((c) => ({ kind: 'car', id: c.id, url: c.primary_image_url, expected: c })),
    ...media.map((m) => {
      const carId = carByPost.get(m.post_id);
      const expected = carId ? carById.get(carId) : null;
      return { kind: 'media', id: m.id, url: m.media_url, expected };
    }),
  ].filter((r) => r.url && r.expected);

  console.log(`   ${rows.length} images to audit`);
  if (DRY_RUN) console.log('   (DRY_RUN — no DB writes)');

  let done = 0, bad = 0, mismatch = 0;
  const flagged = [];
  await pool(rows, CONCURRENCY, async (r) => {
    const c = await classify(r.url);
    done++;
    const expectedFirst = String(r.expected.model || '').split(' ')[0].toLowerCase();
    const gotModel = String(c.model || '').toLowerCase();
    const gotMake = String(c.make || '').toLowerCase();
    const expectedMake = String(r.expected.make || '').toLowerCase();
    const carOk = !!c.is_car;
    const makeOk = gotMake.includes(expectedMake.split(' ')[0]) || expectedMake.includes(gotMake.split(' ')[0]);
    const modelOk = gotModel.includes(expectedFirst) || expectedFirst && gotModel.startsWith(expectedFirst[0]);
    if (!carOk) bad++;
    else if (!makeOk && !modelOk) mismatch++;
    if (!carOk || (!makeOk && !modelOk)) {
      flagged.push({ ...r, classification: c });
    }
    if (done % 25 === 0) process.stdout.write(`  ${done}/${rows.length}  bad=${bad}  mismatch=${mismatch}\r`);
  });
  console.log(`\n   audited ${done}, ${bad} not-cars, ${mismatch} mismatched`);
  console.log(`   total to replace: ${flagged.length}`);

  if (DRY_RUN) {
    console.log('Sample flagged:');
    flagged.slice(0, 8).forEach((f) =>
      console.log(`   ${f.kind} ${f.id} — got ${JSON.stringify(f.classification)} (expected ${f.expected.make} ${f.expected.model})`),
    );
    return;
  }

  // Replacement: pull a fresh URL from the existing PHOTOS pool in fix_content.mjs.
  const { PHOTOS, poolFor, unsplash, hash } = await import('./fix_content_helpers.mjs').catch(() => ({}));
  if (!PHOTOS) {
    console.log('   (helpers not extracted — write replacements manually)');
    console.log('   Flagged ids saved to /tmp/flagged_ids.json');
    await import('fs').then(({ writeFileSync }) =>
      writeFileSync('/tmp/flagged_ids.json', JSON.stringify(flagged.map((f) => ({ kind: f.kind, id: f.id })))),
    );
    return;
  }
  let replaced = 0;
  for (const f of flagged) {
    const pool = poolFor(f.expected.model);
    const seed = hash(f.id + '-retry');
    const url = unsplash(pool[seed % pool.length]);
    const table = f.kind === 'car' ? 'cars' : 'post_media';
    const col = f.kind === 'car' ? 'primary_image_url' : 'media_url';
    const { error } = await sb.from(table).update({ [col]: url }).eq('id', f.id);
    if (!error) replaced++;
  }
  console.log(`   replaced ${replaced} flagged images`);
})().catch((e) => { console.error(e); process.exit(1); });
