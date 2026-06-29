// Real competition photos from Wikimedia Commons, matched to each competition's
// theme (same method as fix_images_commons.mjs).
//
// Run: node supabase/fix_competition_images.mjs

import { createClient } from '@supabase/supabase-js';

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) throw new Error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
const sb = createClient(URL, KEY, { auth: { persistSession: false } });
const UA = 'MODIFIED-app-seed/1.0 (https://modified.app; demo seed)';

// Competition name → Commons search queries (multiple for variety).
const THEME_QUERIES = {
  'Rolling Shots':   ['car motion blur road', 'sports car driving', 'car panning shot'],
  'Engine Bay Flex': ['car engine bay', 'modified engine bay', 'tuned engine compartment'],
  'Best Night Shot': ['car at night city', 'sports car night', 'car night photography'],
  'JDM Only':        ['JDM car meet', 'Japanese sports car', 'Nissan Skyline Toyota Supra'],
};
const FALLBACK_QUERIES = ['modified sports car', 'tuner car show'];

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

async function commonsPhotos(query, limit = 20) {
  const api =
    'https://commons.wikimedia.org/w/api.php' +
    '?action=query&format=json&generator=search' +
    '&gsrsearch=' + encodeURIComponent(`filetype:bitmap ${query}`) +
    '&gsrnamespace=6&gsrlimit=' + limit +
    '&prop=imageinfo&iiprop=url|mime&iiurlwidth=800&origin=*';
  const r = await fetch(api, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`Commons ${r.status}`);
  const j = await r.json();
  const pages = j.query?.pages ? Object.values(j.query.pages) : [];
  return pages
    .map((p) => p.imageinfo?.[0])
    .filter((ii) => ii && /jpeg|jpg|png/i.test(ii.mime || ''))
    .filter((ii) => !/logo|diagram|map|chart/i.test(ii.thumburl || ''))
    .map((ii) => ii.thumburl)
    .filter(Boolean);
}

async function poolForQueries(queries) {
  const all = [];
  for (const q of queries) {
    try {
      const photos = await commonsPhotos(q, 20);
      all.push(...photos);
    } catch (e) {
      console.error(`   ✗ "${q}": ${e.message}`);
    }
    await new Promise((res) => setTimeout(res, 250));
  }
  return [...new Set(all)];
}

(async () => {
  console.log('1. loading competitions + entries …');
  const comps = await fetchAll('competitions', 'id, name');
  const entries = await fetchAll('competition_entries', 'id, competition_id');
  const media = await fetchAll('competition_media', 'id, entry_id');
  console.log(`   ${comps.length} comps, ${entries.length} entries, ${media.length} media`);

  console.log('2. building Commons pools per competition …');
  const poolByComp = new Map();
  for (const c of comps) {
    const queries = THEME_QUERIES[c.name] || FALLBACK_QUERIES;
    const pool = await poolForQueries(queries);
    poolByComp.set(c.id, pool);
    console.log(`   ${c.name}: ${pool.length} photos`);
  }
  const allPhotos = [...new Set([...poolByComp.values()].flat())];

  const compByEntry = new Map(entries.map((e) => [e.id, e.competition_id]));

  console.log('3. updating competition_media …');
  let fixed = 0;
  for (const m of media) {
    const compId = compByEntry.get(m.entry_id);
    let pool = compId ? poolByComp.get(compId) : null;
    if (!pool || pool.length === 0) pool = allPhotos;
    if (pool.length === 0) continue;
    const url = pool[hash(m.id) % pool.length];
    const { error } = await sb.from('competition_media').update({ media_url: url }).eq('id', m.id);
    if (!error) fixed++;
  }
  console.log(`   updated ${fixed}/${media.length}`);
  console.log('done.');
})().catch((e) => { console.error(e); process.exit(1); });
