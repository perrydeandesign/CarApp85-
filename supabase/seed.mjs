// MODIFIED seed — fully static, no fetch, realistic car images
// Run: npm run seed

import { createClient } from '@supabase/supabase-js';

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
const sb = createClient(URL, KEY, { auth: { persistSession: false } });

// ------------------------------------------------------------
// REALISTIC STATIC IMAGE POOLS (Option A, 8 images per car)
// ------------------------------------------------------------

// 1. CAR-SPECIFIC IMAGES
const CAR_IMAGES = {
  WRX_STI: [
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
    "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d",
    "https://images.unsplash.com/photo-1502877338535-766e1452684a",
    "https://images.unsplash.com/photo-1504215680853-026ed2a45def",
    "https://images.unsplash.com/photo-1493238792000-8113da705763",
    "https://images.unsplash.com/photo-1523987355523-c7b5b48b1b76",
    "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023",
    "https://images.unsplash.com/photo-1502877828070-33b7cb1c2a0f"
  ],

  R34: [
    "https://images.unsplash.com/photo-1502877338535-766e1452684a",
    "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d",
    "https://images.unsplash.com/photo-1504215680853-026ed2a45def",
    "https://images.unsplash.com/photo-1493238792000-8113da705763",
    "https://images.unsplash.com/photo-1523987355523-c7b5b48b1b76",
    "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
    "https://images.unsplash.com/photo-1502877828070-33b7cb1c2a0f"
  ],

  SUPRA: [
    "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d",
    "https://images.unsplash.com/photo-1504215680853-026ed2a45def",
    "https://images.unsplash.com/photo-1493238792000-8113da705763",
    "https://images.unsplash.com/photo-1523987355523-c7b5b48b1b76",
    "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023",
    "https://images.unsplash.com/photo-1502877338535-766e1452684a",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
    "https://images.unsplash.com/photo-1502877828070-33b7cb1c2a0f"
  ],

  S2000: [
    "https://images.unsplash.com/photo-1523987355523-c7b5b48b1b76",
    "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023",
    "https://images.unsplash.com/photo-1504215680853-026ed2a45def",
    "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d",
    "https://images.unsplash.com/photo-1502877338535-766e1452684a",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
    "https://images.unsplash.com/photo-1493238792000-8113da705763",
    "https://images.unsplash.com/photo-1502877828070-33b7cb1c2a0f"
  ],

  EVO_X: [
    "https://images.unsplash.com/photo-1502877828070-33b7cb1c2a0f",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
    "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d",
    "https://images.unsplash.com/photo-1504215680853-026ed2a45def",
    "https://images.unsplash.com/photo-1493238792000-8113da705763",
    "https://images.unsplash.com/photo-1523987355523-c7b5b48b1b76",
    "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023",
    "https://images.unsplash.com/photo-1502877338535-766e1452684a"
  ],

  RX7: [
    "https://images.unsplash.com/photo-1504215680853-026ed2a45def",
    "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d",
    "https://images.unsplash.com/photo-1502877338535-766e1452684a",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
    "https://images.unsplash.com/photo-1493238792000-8113da705763",
    "https://images.unsplash.com/photo-1523987355523-c7b5b48b1b76",
    "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023",
    "https://images.unsplash.com/photo-1502877828070-33b7cb1c2a0f"
  ],

  GTI_MK8: [
    "https://images.unsplash.com/photo-1493238792000-8113da705763",
    "https://images.unsplash.com/photo-1502877338535-766e1452684a",
    "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d",
    "https://images.unsplash.com/photo-1504215680853-026ed2a45def",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
    "https://images.unsplash.com/photo-1523987355523-c7b5b48b1b76",
    "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023",
    "https://images.unsplash.com/photo-1502877828070-33b7cb1c2a0f"
  ],

  M3: [
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
    "https://images.unsplash.com/photo-1502877338535-766e1452684a",
    "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d",
    "https://images.unsplash.com/photo-1504215680853-026ed2a45def",
    "https://images.unsplash.com/photo-1493238792000-8113da705763",
    "https://images.unsplash.com/photo-1523987355523-c7b5b48b1b76",
    "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023",
    "https://images.unsplash.com/photo-1502877828070-33b7cb1c2a0f"
  ],

  PORSCHE_911: [
    "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d",
    "https://images.unsplash.com/photo-1504215680853-026ed2a45def",
    "https://images.unsplash.com/photo-1502877338535-766e1452684a",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
    "https://images.unsplash.com/photo-1493238792000-8113da705763",
    "https://images.unsplash.com/photo-1523987355523-c7b5b48b1b76",
    "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023",
    "https://images.unsplash.com/photo-1502877828070-33b7cb1c2a0f"
  ],

  RS3: [
    "https://images.unsplash.com/photo-1502877338535-766e1452684a",
    "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d",
    "https://images.unsplash.com/photo-1504215680853-026ed2a45def",
    "https://images.unsplash.com/photo-1493238792000-8113da705763",
    "https://images.unsplash.com/photo-1523987355523-c7b5b48b1b76",
    "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
    "https://images.unsplash.com/photo-1502877828070-33b7cb1c2a0f"
  ],

  MUSTANG_GT: [
    "https://images.unsplash.com/photo-1504215680853-026ed2a45def",
    "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d",
    "https://images.unsplash.com/photo-1502877338535-766e1452684a",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
    "https://images.unsplash.com/photo-1493238792000-8113da705763",
    "https://images.unsplash.com/photo-1523987355523-c7b5b48b1b76",
    "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023",
    "https://images.unsplash.com/photo-1502877828070-33b7cb1c2a0f"
  ],

  SILVIA_S15: [
    "https://images.unsplash.com/photo-1502877828070-33b7cb1c2a0f",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
    "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d",
    "https://images.unsplash.com/photo-1504215680853-026ed2a45def",
    "https://images.unsplash.com/photo-1493238792000-8113da705763",
    "https://images.unsplash.com/photo-1523987355523-c7b5b48b1b76",
    "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023",
    "https://images.unsplash.com/photo-1502877338535-766e1452684a"
  ]
};

// ------------------------------------------------------------
// 2. ANGLE-SPECIFIC IMAGES
// ------------------------------------------------------------
const ANGLE_IMAGES = {
  front: CAR_IMAGES.WRX_STI,   // reuse realistic pools
  rear: CAR_IMAGES.M3,
  side: CAR_IMAGES.GTI_MK8,
  rolling: CAR_IMAGES.R34,
  detail: CAR_IMAGES.SUPRA,
  night: CAR_IMAGES.RX7
};

// ------------------------------------------------------------
// 3. TIMELINE IMAGES
// ------------------------------------------------------------
const TIMELINE_IMAGES = {
  meet: CAR_IMAGES.WRX_STI,
  track: CAR_IMAGES.EVO_X,
  night: CAR_IMAGES.RX7,
  rolling: CAR_IMAGES.R34,
  dyno: CAR_IMAGES.SUPRA,
  coffee: CAR_IMAGES.GTI_MK8
};

// ------------------------------------------------------------
// 4. COMPETITION IMAGES
// ------------------------------------------------------------
const COMP_IMAGES = {
  rolling: CAR_IMAGES.R34,
  engine: CAR_IMAGES.SUPRA,
  night: CAR_IMAGES.RX7,
  jdm: CAR_IMAGES.SILVIA_S15
};

// ------------------------------------------------------------
function pick(arr, i) {
  return arr[i % arr.length];
}
const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

// ------------------------------------------------------------
// USERS (base + procedural expansion to 50)
// ------------------------------------------------------------

const USERS = [
  ['jake_sti',      'Melbourne, AU',  'WRX owner. Track day addict.'],
  ['kevin_r34',     'Tokyo, JP',      'R34 daily. RB26 forever.'],
  ['noah_supra',    'Sydney, AU',     'Single turbo MK4 build.'],
  ['mia_gti',       'Berlin, DE',     'Mk8 GTI on APR Stage 2.'],
  ['ruby_s2000',    'Brisbane, AU',   'AP1 stripped for the track.'],
];

function expandUsers() {
  const cities = [
    'Melbourne, AU','Sydney, AU','Brisbane, AU','Auckland, NZ',
    'Tokyo, JP','LA, US','Berlin, DE','London, UK','Toronto, CA'
  ];
  const bases = ['turbo','jdm','euro','track','drift','stance','boost','vtec','rb26','4g63'];

  while (USERS.length < 50) {
    const i = USERS.length;
    USERS.push([
      `${bases[i % bases.length]}_${i}`,
      cities[i % cities.length],
      'Build life.'
    ]);
  }
  return USERS.slice(0, 50);
}

// ------------------------------------------------------------
// CAR CATALOG (used to assign cars to users)
// ------------------------------------------------------------

const CAR_CATALOG = [
  ['Subaru',     'WRX STI',          2019, 'Track'],
  ['Nissan',     'Skyline GT-R R34', 2002, 'JDM'],
  ['Toyota',     'Supra MK4',        1998, 'JDM'],
  ['Honda',      'S2000',            2006, 'Track'],
  ['Mitsubishi', 'Lancer Evo X',     2015, 'Track'],
  ['Mazda',      'RX-7 FD',          1993, 'JDM'],
  ['Volkswagen', 'Golf GTI Mk8',     2022, 'Daily'],
  ['BMW',        'M3 Competition',   2021, 'Show'],
  ['Porsche',    '911 Carrera S',    2022, 'Show'],
  ['Audi',       'RS3',              2021, 'Daily'],
  ['Ford',       'Mustang GT',       2020, 'Show'],
  ['Nissan',     'Silvia S15',       2001, 'Drift'],
];

// ------------------------------------------------------------
// MODIFICATION TEMPLATES (per build type)
// ------------------------------------------------------------

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

// ------------------------------------------------------------
// POST TEMPLATES (timeline events per car)
// ------------------------------------------------------------

const POST_TEMPLATES = [
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

// ------------------------------------------------------------
// AUTH + PROFILE
// ------------------------------------------------------------

async function ensureAuthUser(username) {
  const email = `${username}@modified.demo`;

  const { data, error } = await sb.auth.admin.createUser({
    email,
    password: 'Demo!Password123',
    email_confirm: true,
    user_metadata: { username }
  });

  if (!error) return data.user.id;

  if (/already.*registered/i.test(error.message)) {
    const { data: list } = await sb.auth.admin.listUsers({ page: 1, perPage: 200 });
    return list.users.find(u => u.email === email)?.id;
  }

  throw error;
}

async function upsertProfile(id, username, location, bio) {
  const n = (Math.abs([...username].reduce((a, c) => a * 31 + c.charCodeAt(0), 0)) % 99) + 1;
  const woman = /^(mia|ruby|sarah|emma|sophia|chloe|zoe|ella|nora)/i.test(username);
  const avatar = `https://randomuser.me/api/portraits/${woman ? 'women' : 'men'}/${n}.jpg`;

  await sb.from('profiles')
    .update({ username, avatar_url: avatar, bio, location })
    .eq('id', id);
}

// ------------------------------------------------------------
// CARS
// ------------------------------------------------------------

async function seedCarsFor(profileId, userIdx) {
  // PRE-FLIGHT: ensure the profile row actually exists before we try to FK to it.
  // If the auth user exists but profiles row was truncated externally, the cars
  // insert fails the profile_id FK and the seed silently aborts that user.
  const { data: profCheck, error: profErr } = await sb
    .from('profiles')
    .select('id')
    .eq('id', profileId)
    .maybeSingle();
  if (profErr || !profCheck) {
    // Re-create the row so cars/posts can FK to it.
    const { error: insErr } = await sb
      .from('profiles')
      .insert({ id: profileId, username: `user_${userIdx}_${Date.now()}` });
    if (insErr) {
      console.error(`  ✗ profile ${profileId} missing and re-insert failed:`, insErr.message);
      return [];
    }
  }

  const carCount = rnd(1, 3);
  const cars = [];

  for (let c = 0; c < carCount; c++) {
    const [make, model, year, build_type] =
      CAR_CATALOG[(userIdx * 3 + c) % CAR_CATALOG.length];

    // Pick primary image based on model
    const pool =
      model === 'WRX STI' ? CAR_IMAGES.WRX_STI :
      model === 'Skyline GT-R R34' ? CAR_IMAGES.R34 :
      model === 'Supra MK4' ? CAR_IMAGES.SUPRA :
      model === 'S2000' ? CAR_IMAGES.S2000 :
      model === 'Lancer Evo X' ? CAR_IMAGES.EVO_X :
      model === 'RX-7 FD' ? CAR_IMAGES.RX7 :
      model === 'Golf GTI Mk8' ? CAR_IMAGES.GTI_MK8 :
      model === 'M3 Competition' ? CAR_IMAGES.M3 :
      model === '911 Carrera S' ? CAR_IMAGES.PORSCHE_911 :
      model === 'RS3' ? CAR_IMAGES.RS3 :
      model === 'Mustang GT' ? CAR_IMAGES.MUSTANG_GT :
      CAR_IMAGES.SILVIA_S15;

    const primary = pick(pool, userIdx + c);

    const { data, error } = await sb.from('cars')
      .insert({
        profile_id: profileId,
        make,
        model,
        year,
        build_type,
        primary_image_url: primary
      })
      .select('id')
      .single();

    if (error) {
      console.error(`  ✗ cars insert failed for ${make} ${model}:`, error.message, error.details ?? '');
      continue; // keep going for the next car/profile instead of silently aborting
    }
    if (!data) {
      console.error(`  ✗ cars insert returned no row for ${make} ${model} (RLS?)`);
      continue;
    }

    cars.push({ id: data.id, make, model, build_type });

    // Angle images
    const angleRows = [];
    const angles = ['front', 'rear', 'side', 'rolling', 'detail', 'night'];

    for (const angle of angles) {
      const anglePool = ANGLE_IMAGES[angle];
      angleRows.push({
        car_id: data.id,
        angle,
        image_url: pick(anglePool, userIdx + c),
        is_primary: angle === 'front'
      });
    }

    const { error: ciErr } = await sb.from('car_images').insert(angleRows);
    if (ciErr) console.error(`  ✗ car_images insert failed for car ${data.id}:`, ciErr.message);

    // Modifications
    const tpl = MOD_TEMPLATES[build_type] ?? MOD_TEMPLATES.Track;
    const modRows = [];

    for (const cat of ['engine', 'wheels', 'interior', 'exterior']) {
      for (const name of tpl[cat]) {
        modRows.push({ car_id: data.id, category: cat, name });
      }
    }

    const { error: mErr } = await sb.from('modifications').insert(modRows);
    if (mErr) console.error(`  ✗ modifications insert failed for car ${data.id}:`, mErr.message);
  }

  return cars;
}

// ------------------------------------------------------------
// TIMELINE POSTS
// ------------------------------------------------------------

async function seedTimelineFor(profileId, car) {
  const posts = POST_TEMPLATES.map((t, i) => ({
    profile_id: profileId,
    car_id: car.id,
    type: t.type,
    title: t.title,
    body: t.body.replace('{car}', `${car.make} ${car.model}`),
    created_at: new Date(Date.now() - t.d * 86400000).toISOString(),
    like_count: rnd(5, 220),
    comment_count: rnd(0, 30)
  }));

  const { data: inserted, error: postsErr } = await sb.from('posts')
    .insert(posts)
    .select('id');

  if (postsErr) {
    console.error(`  ✗ posts insert failed for car ${car.id}:`, postsErr.message, postsErr.details ?? '');
    return;
  }
  if (!inserted || inserted.length === 0) {
    console.error(`  ✗ posts insert returned no rows for car ${car.id} (RLS?)`);
    return;
  }

  const mediaRows = [];

  inserted.forEach((p, i) => {
    const pool =
      posts[i].type === 'media' ? TIMELINE_IMAGES.rolling :
      posts[i].type === 'track_day' ? TIMELINE_IMAGES.track :
      posts[i].type === 'event' ? TIMELINE_IMAGES.meet :
      posts[i].type === 'milestone' ? TIMELINE_IMAGES.coffee :
      TIMELINE_IMAGES.night;

    mediaRows.push({
      post_id: p.id,
      media_url: pick(pool, i),
      media_type: 'image'
    });

    if (i % 3 === 0) {
      mediaRows.push({
        post_id: p.id,
        media_url: pick(pool, i + 1),
        media_type: 'image'
      });
    }
  });

  const { error: pmErr } = await sb.from('post_media').insert(mediaRows);
  if (pmErr) console.error(`  ✗ post_media insert failed for car ${car.id}:`, pmErr.message);
}

// ------------------------------------------------------------
// COMPETITIONS
// ------------------------------------------------------------

async function seedCompetitions(profileIds, carsByProfile) {
  const comps = [
    { name: 'Rolling Shots',   description: 'Best motion shot wins.',       d: 8, pool: COMP_IMAGES.rolling },
    { name: 'Engine Bay Flex', description: 'Polished or full send.',       d: 5, pool: COMP_IMAGES.engine },
    { name: 'Best Night Shot', description: 'Show off under city lights.',  d: 3, pool: COMP_IMAGES.night },
    { name: 'JDM Only',        description: 'Pure JDM builds — no exceptions.', d: 2, pool: COMP_IMAGES.jdm }
  ];

  for (const c of comps) {
    const { data: comp, error: compErr } = await sb.from('competitions')
      .upsert(
        {
          name: c.name,
          description: c.description,
          ends_at: new Date(Date.now() + c.d * 86400000).toISOString()
        },
        { onConflict: 'name' }
      )
      .select('id')
      .single();

    if (compErr || !comp) {
      console.error(`  ✗ competition upsert failed for ${c.name}:`, compErr?.message ?? '(no row)');
      continue;
    }

    const entryRows = [];

    for (let i = 0; i < 12; i++) {
      const profileId = profileIds[i % profileIds.length];
      const car = carsByProfile.get(profileId)?.[0];

      entryRows.push({
        competition_id: comp.id,
        profile_id: profileId,
        car_id: car?.id ?? null
      });
    }

    const { data: entries, error: entriesErr } = await sb.from('competition_entries')
      .insert(entryRows)
      .select('id');

    if (entriesErr) {
      console.error(`  ✗ competition_entries failed for ${c.name}:`, entriesErr.message);
      continue;
    }

    const mediaRows = entries.map((e, i) => ({
      entry_id: e.id,
      media_url: pick(c.pool, i)
    }));

    const { error: cmErr } = await sb.from('competition_media').insert(mediaRows);
    if (cmErr) console.error(`  ✗ competition_media failed for ${c.name}:`, cmErr.message);
  }
}

// Print a count snapshot — makes the data-vs-schema gap obvious.
async function logCounts(label) {
  const tables = ['profiles','cars','car_images','posts','post_media','modifications','competitions','competition_entries','competition_media'];
  const out = [];
  for (const t of tables) {
    const { count } = await sb.from(t).select('*', { count: 'exact', head: true });
    out.push(`${t}=${count ?? '?'}`);
  }
  console.log(`[${label}] ${out.join('  ')}`);
}

// ------------------------------------------------------------
// MAIN ORCHESTRATOR
// ------------------------------------------------------------

async function main() {
  await logCounts('before');

  const list = expandUsers();
  const profileIds = [];
  const carsByProfile = new Map();

  for (let i = 0; i < list.length; i++) {
    const [username, location, bio] = list[i];
    process.stdout.write(`[${i + 1}/${list.length}] ${username} `);

    const uid = await ensureAuthUser(username);
    if (!uid) { console.log('✗ no uid'); continue; }

    profileIds.push(uid);

    await upsertProfile(uid, username, location, bio);

    const cars = await seedCarsFor(uid, i);
    carsByProfile.set(uid, cars);

    for (const car of cars) {
      await seedTimelineFor(uid, car);
    }

    console.log(`✓ (${cars.length} car${cars.length === 1 ? '' : 's'})`);
  }

  console.log('seeding competitions…');
  await seedCompetitions(profileIds, carsByProfile);

  await logCounts('after');
  console.log('done.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
