// MODIFIED — groups seed. Idempotent (skips groups that already exist by name).
// Run: npm run seed:groups
//
// Creates 30 car-community groups, each with a creator (admin), a set of member
// profiles, a few posts, an event, and a small gallery — all wired to real
// seeded profiles so the Groups feature demos as a live product.

import { createClient } from '@supabase/supabase-js';

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
const sb = createClient(URL, KEY, { auth: { persistSession: false } });

const IMAGES = [
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
  'https://images.unsplash.com/photo-1493238792000-8113da705763?w=800',
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800',
  'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800',
  'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800',
  'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800',
  'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800',
  'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800',
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800',
];
const img = (i) => IMAGES[i % IMAGES.length];

const GROUPS = [
  ['JDM Legends Melbourne', "Melbourne's premier JDM community. Meets, builds and cruises.", 'public'],
  ['Subaru Squad AU', 'Boxer engines and all-wheel-drive grip. STIs, WRXs and more.', 'public'],
  ['Euro Builds', 'German and continental builds — VAG, BMW, Merc, Porsche.', 'public'],
  ['Track Rats AU', 'Lap times, setup talk and track-day carpools.', 'public'],
  ['Stance Nation Sydney', 'Fitment, camber and bagged builds around Sydney.', 'public'],
  ['Rotary Rejects', 'Bridgeports, apex seals and the sound of a spinning triangle.', 'public'],
  ['Turbo Life', 'Boost, spool and everything forced induction.', 'public'],
  ['Skyline Owners AU', 'R32 to R35 — GT-R and Skyline owners unite.', 'private'],
  ['Drift Collective', 'Sideways enthusiasts. Angle, smoke and clutch kicks.', 'public'],
  ['Hot Hatch Club', 'GTIs, Type Rs, RS and everything fast and small.', 'public'],
  ['Muscle Car Mafia', 'V8s, burnouts and classic Aussie and US muscle.', 'public'],
  ['Track Day Junkies', 'We live for the next open pit lane.', 'public'],
  ['Static & Bagged', 'Show-quality fitment, coilovers and air.', 'public'],
  ['VAG Nation', 'Volkswagen Audi Group — dubs, quattros and more.', 'public'],
  ['Nissan Heritage', 'Silvias, 300ZXs, GT-Rs and the Nissan faithful.', 'public'],
  ['Toyota GR Owners', 'GR Yaris, GR86 and Supra — Gazoo Racing family.', 'public'],
  ['Honda VTEC Club', 'When VTEC kicks in yo. Civics, Integras, S2000s.', 'public'],
  ['Mazda MX-5 Register', 'The best-selling roadster — NA to ND.', 'public'],
  ['German Horsepower', 'M cars, AMG, RS and Porsche performance.', 'private'],
  ['Aussie Ute Kings', 'Utes, tourers and worked tray-backs.', 'public'],
  ['Classic JDM Restorers', 'Keeping 80s and 90s Japanese icons alive.', 'public'],
  ['Boosted Bricks', 'Turbo Volvos and boxy boosted builds.', 'public'],
  ['Weekend Warriors', 'Daily drivers built for Sunday runs.', 'public'],
  ['Circuit Attack AU', 'Time attack, aero and grip setups.', 'public'],
  ['Show & Shine Society', 'Concours detailing and show cars.', 'public'],
  ['Widebody Workshop', 'Overfenders, wide arches and aggressive builds.', 'public'],
  ['AWD Alliance', 'All-paw traction — Evos, STIs, R35s and quattros.', 'public'],
  ['Naturally Aspirated Nerds', 'No turbos, just revs. NA purists.', 'public'],
  ['Night Meet Crew', 'After-dark meets and city cruises.', 'private'],
  ['Detailing Addicts', 'Paint correction, ceramic and the perfect swirl-free finish.', 'public'],
];

const CAPTIONS = [
  'Fresh setup dialled in for the weekend meet 🔧',
  'Sunday cruise crew — who else is coming?',
  'New wheels fitted, thoughts?',
  'Track day this weekend, weather looking perfect ☀️',
  'Build update: finally finished the engine bay.',
  'Meet spot locked in for Saturday night.',
  'Cleaned her up for the show. Swirl-free finish 👌',
  'Dyno numbers are in and I am stoked.',
];

const EVENTS = [
  ['Saturday Night Meet', 'Docklands, Melbourne'],
  ['Sunday Mountain Run', 'Mt Dandenong, VIC'],
  ['Cars & Coffee', 'Sydney Olympic Park, NSW'],
  ['Track Day', 'Phillip Island Circuit'],
  ['Show & Shine', 'South Bank, Brisbane'],
];

async function main() {
  const { data: profiles, error } = await sb
    .from('profiles')
    .select('id, username')
    .order('created_at', { ascending: true });
  if (error || !profiles?.length) {
    console.error('load profiles failed:', error?.message);
    process.exit(1);
  }
  const ids = profiles.map((p) => p.id);
  const n = ids.length;

  const { data: existing } = await sb.from('groups').select('name');
  const have = new Set((existing ?? []).map((g) => g.name));

  let created = 0;
  for (let gi = 0; gi < GROUPS.length; gi++) {
    const [name, description, privacy] = GROUPS[gi];
    if (have.has(name)) continue;

    const creator = ids[gi % n];
    const { data: grp, error: gErr } = await sb
      .from('groups')
      .insert({ name, description, privacy, banner_url: img(gi), icon_url: img(gi + 3), created_by: creator })
      .select('id')
      .single();
    if (gErr || !grp) {
      console.error(`insert group "${name}" failed:`, gErr?.message);
      continue;
    }
    const gid = grp.id;

    // Members: creator (admin) + a deterministic slice of profiles.
    const memberCount = 6 + (gi % 13); // 6..18
    const memberIds = new Set([creator]);
    for (let j = 1; j <= memberCount; j++) memberIds.add(ids[(gi * 5 + j) % n]);
    const members = Array.from(memberIds).map((pid) => ({
      group_id: gid,
      profile_id: pid,
      role: pid === creator ? 'admin' : 'member',
    }));
    await sb.from('group_members').upsert(members, { onConflict: 'group_id,profile_id', ignoreDuplicates: true });

    // Posts: 2-4 from member profiles.
    const memberArr = Array.from(memberIds);
    const postCount = 2 + (gi % 3);
    const posts = [];
    for (let p = 0; p < postCount; p++) {
      posts.push({
        group_id: gid,
        profile_id: memberArr[(p + 1) % memberArr.length],
        caption: CAPTIONS[(gi + p) % CAPTIONS.length],
        photos: [img(gi + p), img(gi + p + 2)],
        like_count: 12 + ((gi * 7 + p * 13) % 180),
        comment_count: 1 + ((gi + p) % 24),
      });
    }
    await sb.from('group_posts').insert(posts);

    // One upcoming event.
    const [etitle, eloc] = EVENTS[gi % EVENTS.length];
    await sb.from('group_events').insert({
      group_id: gid,
      title: etitle,
      location: eloc,
      banner_url: img(gi + 1),
      starts_at: new Date(Date.now() + (3 + (gi % 20)) * 86400000).toISOString(),
    });

    // Gallery: 4 images.
    const gallery = [0, 1, 2, 3].map((k) => ({ group_id: gid, url: img(gi + k) }));
    await sb.from('group_gallery').insert(gallery);

    created++;
  }

  const { count } = await sb.from('groups').select('*', { count: 'exact', head: true });
  console.log(`groups seed complete: +${created} new, ${count} total`);
}

main();
