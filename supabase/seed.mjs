// MODIFIED seed — bypasses RLS via service-role key.
// Run: npm run seed  (after exporting env vars; see .env section in README)
// Pattern-based: small templates + procedural fan-out to ~50 profiles, ~100 cars,
// ~1800 posts, 4 competitions with 12 entries each.

import { createClient } from '@supabase/supabase-js';

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
const sb = createClient(URL, KEY, { auth: { persistSession: false } });

// ---------- TEMPLATES (compact, fan out procedurally) ----------

const USERS = [
  // [username, location, bio]
  ['jake_sti',      'Melbourne, AU',  'WRX owner. Track day addict.'],
  ['kevin_r34',     'Tokyo, JP',      'R34 daily. RB26 forever.'],
  ['noah_supra',    'Sydney, AU',     'Single turbo MK4 build.'],
  ['mia_gti',       'Berlin, DE',     'Mk8 GTI on APR Stage 2.'],
  ['ruby_s2000',    'Brisbane, AU',   'AP1 stripped for the track.'],
  // ... (45 more — bulk-generated below)
];

const CAR_CATALOG = [
  // [make, model, year, build_type, redditSub_for_imagery]
  ['Subaru',     'WRX STI',         2019, 'Track', 'subaru'],
  ['Nissan',     'Skyline GT-R R34', 2002, 'JDM',   'JDM'],
  ['Toyota',     'Supra MK4',        1998, 'JDM',   'Supra'],
  ['Honda',      'S2000',            2006, 'Track', 'S2000'],
  ['Mitsubishi', 'Lancer Evo X',     2015, 'Track', 'evolutionx'],
  ['Mazda',      'RX-7 FD',          1993, 'JDM',   'RX7'],
  ['Volkswagen', 'Golf GTI Mk8',     2022, 'Daily', 'GolfGTI'],
  ['BMW',        'M3 Competition',   2021, 'Show',  'BMW'],
  ['Porsche',    '911 Carrera S',    2022, 'Show',  'Porsche'],
  ['Audi',       'RS3',              2021, 'Daily', 'Audi'],
  ['Ford',       'Mustang GT',       2020, 'Show',  'Mustang'],
  ['Nissan',     'Silvia S15',       2001, 'Drift', 'Silvia'],
];

const ANGLE_SUBS = {
  front:   'carporn',
  rear:    'carporn',
  side:    'stance',
  rolling: 'AmateurRollingShots',
  detail:  'carporn',
  night:   'carsatnight',
};

const COMP_SUBS = {
  'Rolling Shots':   'AmateurRollingShots',
  'Engine Bay Flex': 'EngineBuilding',
  'Best Night Shot': 'carsatnight',
  'JDM Only':        'JDM',
};

const MOD_TEMPLATES = {
  Track: {
    engine:   ['ECU Tune Stage 2', 'Cold air intake', 'Catback exhaust', 'Front-mount intercooler'],
    wheels:   ['Volk TE37 18x9.5', 'Brembo BBK', 'Ohlins coilovers', 'Whiteline sway bars'],
    interior: ['Bride Zeta IV', '6-point harness', 'Defi gauges', 'Carbon shift knob'],
    exterior: ['APR splitter', 'Carbon wing', 'Side skirts', 'Tow hook'],
  },
  JDM: {
    engine:   ['Walbro 460', 'ID1050 injectors', 'Greddy intake', 'Tomei cams'],
    wheels:   ['BBS LM 18x9', 'Endless pads', 'Cusco coilovers', 'Toyo R888R'],
    interior: ['Bride seats', 'Takata harness', 'Works Bell hub', 'Status cage'],
    exterior: ['Voltex wing', 'Varis lip', 'Seibon hood', 'JDM tail lights'],
  },
  Show: {
    engine:   ['Eventuri intake', 'Akrapovic exhaust', 'Wagner intercooler', 'Tune'],
    wheels:   ['HRE forged 20s', 'KW V3 coilovers', 'Brembo GT', 'Powerflex bushings'],
    interior: ['Recaro Sportster CS', 'Alcantara wheel', 'Carbon trim', 'Awron display'],
    exterior: ['M Performance wing', 'Carbon mirror caps', 'Vorsteiner diffuser', 'Smoked tails'],
  },
  Daily: {
    engine:   ['Stage 1 tune', 'Drop-in filter', 'Charge pipe', 'Catback'],
    wheels:   ['BBS RE 18s', 'H&R lowering', 'EBC pads', 'Sway bar endlinks'],
    interior: ['Carbon shift', 'Floor mats', 'Stubby antenna', 'LED interior'],
    exterior: ['Lip kit', 'Smoked side markers', 'Window tint', 'Black emblems'],
  },
  Drift: {
    engine:   ['SR20 rebuild', 'Greddy TD06', 'Walbro 460', 'AEM EMS'],
    wheels:   ['Work Meister 18s', 'BC Racing BR', 'Z32 brakes', 'Slammed'],
    interior: ['Bride bucket', 'Welded diff', 'Hydro handbrake', 'Roll cage'],
    exterior: ['Origin Lab kit', 'Rocket Bunny over fenders', 'Spec-R wing', 'Custom livery'],
  },
};

const POST_TEMPLATES = [
  // 18 entries per car timeline — type, titleTemplate, bodyTemplate, daysAgo
  { type: 'milestone',    title: 'New build, who dis',          body: 'Picked up the {car}. Build starts now.', d: 420 },
  { type: 'modification', title: 'Wheels fitted',               body: 'New shoes on. Looks aggressive.',         d: 380 },
  { type: 'modification', title: 'Coilovers installed',         body: 'Ride height dialled. Cornering is sharper.', d: 340 },
  { type: 'media',        title: 'Sunday cars and coffee',      body: 'Met up with a few locals.',                d: 310 },
  { type: 'modification', title: 'Exhaust upgrade',             body: 'Cat-back fitted. Sounds incredible.',      d: 280 },
  { type: 'track_day',    title: 'Phillip Island debut',        body: 'First track day. Best lap 2:12.',          d: 250 },
  { type: 'modification', title: 'Stage 2 tune complete',       body: 'Dyno day. Picked up real gains.',          d: 220 },
  { type: 'event',        title: 'Local meet',                  body: 'Big turnout. Good energy.',                d: 190 },
  { type: 'modification', title: 'Big brake kit',               body: 'Brakes feel like a different car.',        d: 160 },
  { type: 'media',        title: 'Night shoot',                 body: 'Long exposure under the bridge.',          d: 130 },
  { type: 'track_day',    title: 'Sandown 2-day',               body: 'Two days of laps. Car held up.',           d: 110 },
  { type: 'modification', title: 'Bucket seats fitted',         body: 'Way more support. Worth it.',              d: 90  },
  { type: 'milestone',    title: '1 year of ownership',         body: 'Hard to believe it has been a year.',      d: 70  },
  { type: 'modification', title: 'Aero package',                body: 'Splitter and wing fitted.',                d: 55  },
  { type: 'media',        title: 'Rolling shot day',            body: 'Got the panning shot dialled.',            d: 40  },
  { type: 'modification', title: 'Cage in',                     body: 'Bolt-in cage for track use.',              d: 25  },
  { type: 'event',        title: 'Time attack',                 body: 'Round 1 done. Mid-pack finish.',           d: 12  },
  { type: 'media',        title: 'Latest pull',                 body: 'Build is feeling tight.',                  d: 3   },
];

// ---------- REDDIT IMAGE FETCHER (compact, no deps) ----------

const imageCache = new Map(); // sub -> string[] of image urls

async function getRedditImages(sub, limit = 25) {
  if (imageCache.has(sub)) return imageCache.get(sub);
  const res = await fetch(
    `https://www.reddit.com/r/${sub}/top.json?limit=${limit}&t=month`,
    { headers: { 'User-Agent': 'ModifiedSeed/1.0', Accept: 'application/json' } },
  );
  if (!res.ok) { console.warn(`r/${sub} ${res.status}`); imageCache.set(sub, []); return []; }
  const j = await res.json();
  const urls = (j?.data?.children ?? [])
    .map(c => c.data)
    .filter(d => !d.over_18 && !d.is_video && d.post_hint === 'image')
    .map(d => d.url);
  imageCache.set(sub, urls);
  return urls;
}

function pick(arr, i) { return arr.length ? arr[i % arr.length] : null; }
const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

// ---------- SEED ORCHESTRATOR ----------

function expandUsers() {
  // Pad USERS to 50 with procedurally-named profiles.
  const cities = ['Melbourne, AU','Sydney, AU','Brisbane, AU','Auckland, NZ','Tokyo, JP','LA, US','Berlin, DE','London, UK','Toronto, CA'];
  const bases = ['turbo','jdm','euro','track','drift','stance','boost','vtec','rb26','4g63'];
  while (USERS.length < 50) {
    const i = USERS.length;
    USERS.push([`${pick(bases,i)}_${i}`, pick(cities,i), 'Build life.']);
  }
  return USERS.slice(0, 50);
}

async function ensureAuthUser(username) {
  // Create an auth user (idempotent: email collision is OK to skip).
  const email = `${username}@modified.demo`;
  const { data, error } = await sb.auth.admin.createUser({
    email, password: 'Demo!Password123', email_confirm: true,
    user_metadata: { username },
  });
  if (!error) return data.user.id;
  if (/already.*registered/i.test(error.message)) {
    // Look up the existing user
    const { data: list } = await sb.auth.admin.listUsers({ page: 1, perPage: 200 });
    return list.users.find(u => u.email === email)?.id;
  }
  throw error;
}

async function upsertProfile(id, username, location, bio) {
  // The on_auth_user_created trigger auto-creates the row; we just enrich it.
  // Avatar = stable RandomUser portrait keyed by username hash.
  const n = (Math.abs([...username].reduce((a,c)=>a*31+c.charCodeAt(0),0)) % 99) + 1;
  const woman = /^(mia|ruby|sarah|emma|sophia|chloe|zoe|ella|nora)/i.test(username);
  const avatar = `https://randomuser.me/api/portraits/${woman?'women':'men'}/${n}.jpg`;
  await sb.from('profiles').update({ username, avatar_url: avatar, bio, location }).eq('id', id);
}

async function seedCarsFor(profileId, userIdx) {
  const carCount = rnd(1, 3);
  const cars = [];
  for (let c = 0; c < carCount; c++) {
    const [make, model, year, build_type, sub] = CAR_CATALOG[(userIdx * 3 + c) % CAR_CATALOG.length];
    const primary = pick(await getRedditImages(sub), userIdx + c);
    const { data, error } = await sb.from('cars').insert({
      profile_id: profileId, make, model, year, build_type,
      primary_image_url: primary,
    }).select('id').single();
    if (error) throw error;
    cars.push({ id: data.id, make, model, build_type });

    // 6 angle images
    const rows = [];
    for (const angle of Object.keys(ANGLE_SUBS)) {
      const imgs = await getRedditImages(ANGLE_SUBS[angle]);
      rows.push({ car_id: data.id, angle, image_url: pick(imgs, userIdx + c) ?? primary, is_primary: angle === 'front' });
    }
    await sb.from('car_images').insert(rows);

    // Modifications by category
    const tpl = MOD_TEMPLATES[build_type] ?? MOD_TEMPLATES.Track;
    const modRows = [];
    for (const cat of ['engine','wheels','interior','exterior']) {
      for (const name of tpl[cat]) modRows.push({ car_id: data.id, category: cat, name });
    }
    await sb.from('modifications').insert(modRows);
  }
  return cars;
}

async function seedTimelineFor(profileId, car) {
  const imgs = await getRedditImages('carporn');
  const posts = POST_TEMPLATES.map((t, i) => ({
    profile_id: profileId, car_id: car.id, type: t.type,
    title: t.title, body: t.body.replace('{car}', `${car.make} ${car.model}`),
    created_at: new Date(Date.now() - t.d * 86400000).toISOString(),
    like_count: rnd(5, 220), comment_count: rnd(0, 30),
  }));
  const { data: inserted } = await sb.from('posts').insert(posts).select('id');
  // 1-2 media per post
  const mediaRows = [];
  inserted.forEach((p, i) => {
    mediaRows.push({ post_id: p.id, media_url: pick(imgs, i) ?? car.primary_image_url, media_type: 'image' });
    if (i % 3 === 0) mediaRows.push({ post_id: p.id, media_url: pick(imgs, i + 1) ?? car.primary_image_url, media_type: 'image' });
  });
  await sb.from('post_media').insert(mediaRows);
}

async function seedCompetitions(profileIds, carsByProfile) {
  // Compute ends_at relative to now: mix of urgent (≤3 days) and not.
  const comps = [
    { name: 'Rolling Shots',   description: 'Best motion shot wins.',       d: 8 },
    { name: 'Engine Bay Flex', description: 'Polished or full send.',       d: 5 },
    { name: 'Best Night Shot', description: 'Show off under city lights.',  d: 3 },
    { name: 'JDM Only',        description: 'Pure JDM builds — no exceptions.', d: 2 },
  ];
  for (const c of comps) {
    const { data: comp } = await sb.from('competitions').upsert(
      { name: c.name, description: c.description, ends_at: new Date(Date.now() + c.d * 86400000).toISOString() },
      { onConflict: 'name' }
    ).select('id').single();

    const imgs = await getRedditImages(COMP_SUBS[c.name]);
    const entryRows = [];
    for (let i = 0; i < 12; i++) {
      const profileId = profileIds[i % profileIds.length];
      const car = carsByProfile.get(profileId)?.[0];
      entryRows.push({ competition_id: comp.id, profile_id: profileId, car_id: car?.id ?? null });
    }
    const { data: entries } = await sb.from('competition_entries').insert(entryRows).select('id');
    const mediaRows = entries.map((e, i) => ({ entry_id: e.id, media_url: pick(imgs, i) ?? '' }));
    await sb.from('competition_media').insert(mediaRows);
  }
}

// ---------- MAIN ----------

async function main() {
  const list = expandUsers();
  const profileIds = [];
  const carsByProfile = new Map();

  for (let i = 0; i < list.length; i++) {
    const [username, location, bio] = list[i];
    process.stdout.write(`[${i+1}/${list.length}] ${username} `);
    const uid = await ensureAuthUser(username);
    profileIds.push(uid);
    await upsertProfile(uid, username, location, bio);
    const cars = await seedCarsFor(uid, i);
    carsByProfile.set(uid, cars);
    for (const car of cars) await seedTimelineFor(uid, car);
    console.log('✓');
  }

  console.log('seeding competitions…');
  await seedCompetitions(profileIds, carsByProfile);
  console.log('done.');
}

main().catch(e => { console.error(e); process.exit(1); });
