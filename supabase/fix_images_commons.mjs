// Real make/model car photos from Wikimedia Commons (free, keyless, worldwide).
//
// For every distinct car make+model in the DB it searches Commons for real
// photos of that exact car, builds a per-model pool, then assigns a unique
// photo (by per-row seed) to:
//   - cars.primary_image_url
//   - post_media.media_url
//
// Commons API: https://commons.wikimedia.org/w/api.php  (generator=search)
// Images are CC-licensed; fine for a demo. thumburl gives a resized variant.
//
// Run: node supabase/fix_images_commons.mjs

import { createClient } from '@supabase/supabase-js';

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) throw new Error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
const sb = createClient(URL, KEY, { auth: { persistSession: false } });

const UA = 'MODIFIED-app-seed/1.0 (https://modified.app; demo seed)';

// Some models need a better search phrase than the stored string.
const QUERY_OVERRIDES = {
  'Subaru WRX STI': 'Subaru Impreza WRX STI',
  'Nissan Skyline GT-R R34': 'Nissan Skyline R34 GT-R',
  'Toyota Supra MK4': 'Toyota Supra A80',
  'Mazda RX-7 FD': 'Mazda RX-7 FD3S',
  'Nissan Silvia S15': 'Nissan Silvia S15',
  'Nissan GT-R R35': 'Nissan GT-R R35',
  'Honda Civic Type R': 'Honda Civic Type R',
  'Honda Civic EG6': 'Honda Civic EG6',
  'BMW M3 Competition': 'BMW M3 G80',
  'Porsche 911 Carrera S': 'Porsche 911 992 Carrera',
  'Mercedes AMG C63': 'Mercedes-Benz C63 AMG',
  'Mercedes AMG C43': 'Mercedes-Benz C43 AMG',
  'Alfa Romeo Giulia QV': 'Alfa Romeo Giulia Quadrifoglio',
  'Renault Clio RS': 'Renault Clio RS',
  'Renault Megane RS': 'Renault Megane RS',
  'Volkswagen Golf GTI Mk8': 'Volkswagen Golf GTI Mk8',
  'Volkswagen Polo GTI': 'Volkswagen Polo GTI',
  'Ford Mustang GT': 'Ford Mustang GT',
  'Ford Focus RS': 'Ford Focus RS',
  'Ford F-150 Raptor': 'Ford F-150 Raptor',
  'Chevrolet Camaro SS': 'Chevrolet Camaro SS',
  'Dodge Challenger Demon': 'Dodge Challenger SRT Demon',
  'Jeep Gladiator Rubicon': 'Jeep Gladiator',
  'Toyota Tacoma TRD': 'Toyota Tacoma TRD',
  'Hyundai i30 N': 'Hyundai i30 N',
  'Hyundai Kona N': 'Hyundai Kona N',
  'Hyundai IONIQ 5 N': 'Hyundai Ioniq 5 N',
  'Tesla Model S Plaid': 'Tesla Model S',
  'Ferrari 488 GTB': 'Ferrari 488 GTB',
  'Porsche Taycan Turbo S': 'Porsche Taycan',
  'Porsche Macan GTS': 'Porsche Macan',
  'Mini Cooper JCW': 'Mini John Cooper Works',
  'Alpine A110': 'Alpine A110',
  'Infiniti G35': 'Infiniti G35',
  'Nissan 350Z': 'Nissan 350Z',
  'Toyota GR Yaris': 'Toyota GR Yaris',
  'Toyota GT86': 'Toyota GT86',
  'Subaru BRZ': 'Subaru BRZ',
  'Honda NSX': 'Honda NSX',
  'Honda S2000': 'Honda S2000',
  'Mazda MX-5 Miata': 'Mazda MX-5 Miata',
  'Mitsubishi Lancer Evo X': 'Mitsubishi Lancer Evolution X',
  'Audi RS3': 'Audi RS3',
  'Audi RS6 Avant': 'Audi RS6 Avant',
  'Audi RS7': 'Audi RS7',
  'BMW M2': 'BMW M2',
  'Seat Ibiza Cupra': 'Seat Ibiza Cupra',
  'Seat Leon Cupra': 'Cupra Leon',
};

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

// Query Commons for up to `limit` real photos of a car. Returns thumburls.
async function commonsPhotos(query, limit = 20) {
  const api =
    'https://commons.wikimedia.org/w/api.php' +
    '?action=query&format=json&generator=search' +
    '&gsrsearch=' + encodeURIComponent(`filetype:bitmap ${query} car`) +
    '&gsrnamespace=6&gsrlimit=' + limit +
    '&prop=imageinfo&iiprop=url|mime&iiurlwidth=800&origin=*';
  const r = await fetch(api, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`Commons ${r.status}`);
  const j = await r.json();
  const pages = j.query?.pages ? Object.values(j.query.pages) : [];
  return pages
    .map((p) => p.imageinfo?.[0])
    .filter((ii) => ii && /jpeg|jpg|png/i.test(ii.mime || ''))
    // skip obvious non-photos
    .filter((ii) => !/logo|diagram|map|interior_dash|gauge/i.test(ii.thumburl || ''))
    .map((ii) => ii.thumburl)
    .filter(Boolean);
}

(async () => {
  console.log('1. loading cars …');
  const cars = await fetchAll('cars', 'id, make, model');
  const models = [...new Set(cars.map((c) => `${c.make} ${c.model}`.trim()))];
  console.log(`   ${cars.length} cars, ${models.length} distinct models`);

  console.log('2. fetching Commons pools per model …');
  const poolByModel = new Map();
  for (const model of models) {
    const query = QUERY_OVERRIDES[model] || model;
    try {
      const photos = await commonsPhotos(query, 20);
      if (photos.length === 0) {
        console.warn(`   ⚠ no results for "${model}" (q="${query}")`);
      }
      poolByModel.set(model, photos);
      process.stdout.write(`   ${model}: ${photos.length}\n`);
    } catch (e) {
      console.error(`   ✗ ${model}: ${e.message}`);
      poolByModel.set(model, []);
    }
    // be polite to the API
    await new Promise((res) => setTimeout(res, 250));
  }

  // Fallback pool = every photo we found, for any model that came back empty.
  const allPhotos = [...new Set([...poolByModel.values()].flat())];
  console.log(`   total unique Commons photos: ${allPhotos.length}`);

  function pick(model, seedKey) {
    let pool = poolByModel.get(model);
    if (!pool || pool.length === 0) pool = allPhotos;
    if (pool.length === 0) return null;
    return pool[hash(seedKey) % pool.length];
  }

  const carModel = new Map(cars.map((c) => [c.id, `${c.make} ${c.model}`.trim()]));

  console.log('3. updating cars.primary_image_url …');
  let carFixed = 0;
  for (const c of cars) {
    const url = pick(carModel.get(c.id), c.id);
    if (!url) continue;
    const { error } = await sb.from('cars').update({ primary_image_url: url }).eq('id', c.id);
    if (!error) carFixed++;
  }
  console.log(`   updated ${carFixed}/${cars.length}`);

  console.log('4. updating post_media.media_url …');
  const posts = await fetchAll('posts', 'id, car_id');
  const carByPost = new Map(posts.map((p) => [p.id, p.car_id]));
  const media = await fetchAll('post_media', 'id, post_id');
  let mFixed = 0;
  for (const m of media) {
    const carId = carByPost.get(m.post_id);
    const model = carId ? carModel.get(carId) : null;
    if (!model) continue;
    const url = pick(model, m.id);
    if (!url) continue;
    const { error } = await sb.from('post_media').update({ media_url: url }).eq('id', m.id);
    if (!error) mFixed++;
    if (mFixed % 250 === 0) process.stdout.write(`   ${mFixed}/${media.length}\r`);
  }
  console.log(`\n   updated ${mFixed}/${media.length}`);

  console.log('done.');
})().catch((e) => { console.error(e); process.exit(1); });
