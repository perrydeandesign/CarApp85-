// Fix mismatched car make/model + reused stock images.
// - Re-aligns each car's make/model to its owner's handle (e.g. mila_clio → Renault Clio).
// - Rewrites primary_image_url and every post_media.media_url as LoremFlickr URLs
//   tagged by the car model with a unique per-row seed (so each post photo differs).
//
// Run: node supabase/fix_car_images.mjs

import { createClient } from '@supabase/supabase-js';

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
const sb = createClient(URL, KEY, { auth: { persistSession: false } });

// ------------------------------------------------------------
// Username token → canonical (make, model, build_type, flickr tags)
// ------------------------------------------------------------
const HANDLE_RULES = [
  // [regex,                          make,          model,                build_type, tags ]
  [/\bsti\b/i,                        'Subaru',      'WRX STI',            'Track', 'subaru,wrx,sti'],
  [/\br34\b/i,                        'Nissan',      'Skyline GT-R R34',   'JDM',   'nissan,skyline,r34,gtr'],
  [/\bsupra\b/i,                      'Toyota',      'Supra MK4',          'JDM',   'toyota,supra,mk4'],
  [/\bs2000\b/i,                      'Honda',      'S2000',              'Track', 'honda,s2000'],
  [/\b(evo|lancer)\b/i,               'Mitsubishi', 'Lancer Evo X',       'Track', 'mitsubishi,lancer,evo'],
  [/\brx7\b/i,                        'Mazda',      'RX-7 FD',            'JDM',   'mazda,rx7,fd'],
  [/\bgti\b/i,                        'Volkswagen', 'Golf GTI Mk8',       'Daily', 'volkswagen,golf,gti'],
  [/\bm3\b/i,                         'BMW',        'M3 Competition',     'Show',  'bmw,m3,competition'],
  [/\bm2\b/i,                         'BMW',        'M2',                 'Show',  'bmw,m2'],
  [/\b911\b/i,                        'Porsche',    '911 Carrera S',      'Show',  'porsche,911,carrera'],
  [/\brs3\b/i,                        'Audi',       'RS3',                'Daily', 'audi,rs3'],
  [/\brs6\b/i,                        'Audi',       'RS6 Avant',          'Show',  'audi,rs6,avant'],
  [/\brs7\b/i,                        'Audi',       'RS7',                'Show',  'audi,rs7'],
  [/\bmustang\b/i,                    'Ford',       'Mustang GT',         'Show',  'ford,mustang,gt'],
  [/\bs15\b/i,                        'Nissan',     'Silvia S15',         'Drift', 'nissan,silvia,s15'],
  [/\bf150\b/i,                       'Ford',       'F-150 Raptor',       'Daily', 'ford,f150,raptor'],
  [/\bmiata\b/i,                      'Mazda',      'MX-5 Miata',         'Track', 'mazda,miata,mx5'],
  [/\btaycan\b/i,                     'Porsche',    'Taycan Turbo S',     'Show',  'porsche,taycan'],
  [/\b488\b/i,                        'Ferrari',    '488 GTB',            'Show',  'ferrari,488,gtb'],
  [/\byarisgr\b/i,                    'Toyota',     'GR Yaris',           'Track', 'toyota,gr,yaris'],
  [/\bgtr\b/i,                        'Nissan',     'GT-R R35',           'Track', 'nissan,gtr,r35'],
  [/\bbrz\b/i,                        'Subaru',     'BRZ',                'Track', 'subaru,brz'],
  [/\bcivic\b/i,                      'Honda',      'Civic Type R',       'Track', 'honda,civic,type,r'],
  [/\bnsx\b/i,                        'Honda',      'NSX',                'Show',  'honda,nsx'],
  [/\bc63\b/i,                        'Mercedes',   'AMG C63',            'Show',  'mercedes,amg,c63'],
  [/\bc43\b/i,                        'Mercedes',   'AMG C43',            'Daily', 'mercedes,amg,c43'],
  [/\bg35\b/i,                        'Infiniti',   'G35',                'Drift', 'infiniti,g35'],
  [/\b350z\b/i,                       'Nissan',     '350Z',               'Drift', 'nissan,350z'],
  [/\bmacan\b/i,                      'Porsche',    'Macan GTS',          'Daily', 'porsche,macan'],
  [/\bclio\b/i,                       'Renault',    'Clio RS',            'Daily', 'renault,clio,rs'],
  [/\bmegane\b/i,                     'Renault',    'Megane RS',          'Track', 'renault,megane,rs'],
  [/\ba110\b/i,                       'Alpine',     'A110',               'Track', 'alpine,a110'],
  [/\bpolo\b/i,                       'Volkswagen', 'Polo GTI',           'Daily', 'volkswagen,polo,gti'],
  [/\bgiulia\b/i,                     'Alfa Romeo', 'Giulia QV',          'Show',  'alfa,giulia,quadrifoglio'],
  [/\bmini\b/i,                       'Mini',       'Cooper JCW',         'Daily', 'mini,cooper,jcw'],
  [/\bcamaro\b/i,                     'Chevrolet',  'Camaro SS',          'Show',  'chevrolet,camaro,ss'],
  [/\bdemon\b/i,                      'Dodge',      'Challenger Demon',   'Show',  'dodge,challenger,demon'],
  [/\bgladiator\b/i,                  'Jeep',       'Gladiator Rubicon',  'Daily', 'jeep,gladiator'],
  [/\btaco\b/i,                       'Toyota',     'Tacoma TRD',         'Daily', 'toyota,tacoma,trd'],
  [/\bi30n\b/i,                       'Hyundai',    'i30 N',              'Track', 'hyundai,i30,n'],
  [/\b(konan|kona)\b/i,               'Hyundai',    'Kona N',             'Daily', 'hyundai,kona,n'],
  [/\bioniq5\b/i,                     'Hyundai',    'IONIQ 5 N',          'Daily', 'hyundai,ioniq,5'],
  [/\bgt86\b/i,                       'Toyota',     'GT86',               'Track', 'toyota,gt86'],
  [/\bfocus\b/i,                      'Ford',       'Focus RS',           'Track', 'ford,focus,rs'],
  [/\bibiza\b/i,                      'Seat',       'Ibiza Cupra',        'Daily', 'seat,ibiza'],
  [/\bleon\b/i,                       'Seat',       'Leon Cupra',         'Daily', 'seat,leon,cupra'],
  [/\bmodels\b/i,                     'Tesla',      'Model S Plaid',      'Daily', 'tesla,model,s'],
  [/\beg6\b/i,                        'Honda',      'Civic EG6',          'JDM',   'honda,civic,eg6'],
];

const DEFAULT_RULE = ['Subaru', 'WRX STI', 'Track', 'subaru,wrx,sti'];

function detect(username) {
  // Underscore is a regex \w char, so \bsti\b never matches jake_sti.
  // Normalize underscores → spaces before testing.
  const normal = String(username || '').replace(/_/g, ' ');
  for (const [rx, make, model, build_type, tags] of HANDLE_RULES) {
    if (rx.test(normal)) return { make, model, build_type, tags };
  }
  const [make, model, build_type, tags] = DEFAULT_RULE;
  return { make, model, build_type, tags };
}

const flickr = (tags, lock) =>
  `https://loremflickr.com/600/600/${encodeURIComponent(tags)}?lock=${lock}`;

// Stable string → positive int hash (so the same id always picks the same seed).
function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % 99999;
}

// ------------------------------------------------------------
async function main() {
  console.log('1. Fetching profiles + cars …');
  const { data: profiles, error: pErr } = await sb
    .from('profiles')
    .select('id, username')
    .limit(500);
  if (pErr) throw pErr;

  const profById = new Map(profiles.map((p) => [p.id, p]));

  const { data: cars, error: cErr } = await sb
    .from('cars')
    .select('id, profile_id, make, model, build_type, primary_image_url')
    .limit(2000);
  if (cErr) throw cErr;

  console.log(`   ${profiles.length} profiles, ${cars.length} cars`);

  // 2. Update each car to match owner's handle + give it a tagged image.
  console.log('2. Updating cars …');
  let carsFixed = 0;
  const carRule = new Map(); // car_id → rule (used later for posts)
  for (const car of cars) {
    const prof = profById.get(car.profile_id);
    if (!prof) continue;
    const rule = detect(prof.username);
    carRule.set(car.id, rule);

    const newImage = flickr(rule.tags, hash(car.id));
    const { error } = await sb
      .from('cars')
      .update({
        make: rule.make,
        model: rule.model,
        build_type: rule.build_type,
        primary_image_url: newImage,
      })
      .eq('id', car.id);
    if (error) {
      console.error(`  ✗ car ${car.id}:`, error.message);
      continue;
    }
    carsFixed++;
  }
  console.log(`   updated ${carsFixed}/${cars.length} cars`);

  // 3. Fix every post_media so it matches its post's car, with a unique seed
  //    so two posts on the same car don't show the same photo.
  console.log('3. Updating post_media (this takes a bit) …');
  const carByPost = new Map();
  {
    const PAGE = 1000;
    let from = 0;
    while (true) {
      const { data, error } = await sb
        .from('posts')
        .select('id, car_id')
        .order('id', { ascending: true })
        .range(from, from + PAGE - 1);
      if (error) throw error;
      if (!data || data.length === 0) break;
      data.forEach((p) => carByPost.set(p.id, p.car_id));
      if (data.length < PAGE) break;
      from += PAGE;
    }
    console.log(`   loaded ${carByPost.size} posts`);
  }

  // Fetch ALL post_media ids up-front (in pages) so we don't depend on
  // PostgREST's range behaviour during the slow update loop.
  const allMedia = [];
  const PAGE = 1000;
  let from = 0;
  while (true) {
    const { data, error } = await sb
      .from('post_media')
      .select('id, post_id')
      .order('id', { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    allMedia.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  console.log(`   ${allMedia.length} post_media rows to update`);

  let mediaFixed = 0;
  let mediaSkipped = 0;
  for (let i = 0; i < allMedia.length; i++) {
    const m = allMedia[i];
    const carId = carByPost.get(m.post_id);
    const rule = carId ? carRule.get(carId) : null;
    if (!rule) { mediaSkipped++; continue; }
    const seed = hash(m.id);
    const newUrl = flickr(rule.tags, seed);
    let attempt = 0;
    while (attempt < 3) {
      const { error } = await sb
        .from('post_media')
        .update({ media_url: newUrl })
        .eq('id', m.id);
      if (!error) { mediaFixed++; break; }
      attempt++;
      if (attempt >= 3) console.error(`  ✗ media ${m.id}:`, error.message);
    }
    if (i % 100 === 0) process.stdout.write(`   ${mediaFixed}/${allMedia.length}\r`);
  }
  console.log(`\n   updated ${mediaFixed} post_media rows (skipped ${mediaSkipped})`);

  console.log('done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
