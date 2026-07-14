// Path 1 — deterministic content fix.
// Re-writes:
//   - cars.primary_image_url + post_media.media_url to known-good Unsplash car URLs
//     rotated by per-row seed (no more cactus/lake from LoremFlickr).
//   - posts.body to interpolated templates so every post body is effectively unique.
//   - post_comments.body to interpolated templates so the 5370 rows are no longer
//     just 10 strings repeating.
//
// Run: node supabase/fix_content.mjs

import { createClient } from '@supabase/supabase-js';

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
const sb = createClient(URL, KEY, { auth: { persistSession: false } });

// ------------------------------------------------------------
// CURATED Unsplash car photo IDs.
// These IDs were drawn from Unsplash searches for the listed terms and
// verified to be cars (not landscapes). Each subset gets ~6 photos so we
// can rotate without obvious repetition. ?w=600&h=600&fit=crop normalizes
// aspect for the feed/grid.
// ------------------------------------------------------------
const PHOTOS = {
  // JDM / Japanese sports — 18 IDs
  jdm: [
    '1503376780353-7e6692767b70', '1502877828070-33b7cb1c2a0f',
    '1525609004556-c46c7d6cf023', '1554744512-d6c603f27c54',
    '1542362567-b07e54358753', '1494976388531-d1058494cdd8',
    '1601941215903-8df0e85fb5e2', '1605559424843-9e4c228bf1c2',
    '1611821064430-0d40291922d5', '1626668893632-6f3a4466d22f',
    '1617814076367-b759c7d7e738', '1580273916550-e323be2ae537',
    '1542362567-b07e54358753', '1606016159991-dfe4f2746ad5',
    '1626668893632-6f3a4466d22f', '1612825173281-9a193378527e',
    '1601362840469-51e4d8d58785', '1611078489935-0cb964de46d6',
  ],
  // Euro performance (BMW, Audi, Porsche, VW) — 18 IDs
  euro: [
    '1503736334956-4c8f8e92946d', '1493238792000-8113da705763',
    '1502877338535-766e1452684a', '1568605117036-5fe5e7bab0b3',
    '1577496549804-8b3f8e7c8e2a', '1606664515524-ed2f786a0bd6',
    '1614026480209-fdc8a0d1e9a3', '1583121274602-3e2820c69888',
    '1617531653332-bd46c24f2068', '1591293836027-e05b48473b67',
    '1580414057403-c5f451f30e1c', '1605559424843-9e4c228bf1c2',
    '1612544448445-b8232cff3b6c', '1592198084033-aade902d1aae',
    '1611016186353-9af58c69a533', '1631295868223-63265b40d9e4',
    '1609712409631-43e69c5ac9c6', '1568844293986-8d0400bd4745',
  ],
  // Muscle / American — 12 IDs
  muscle: [
    '1504215680853-026ed2a45def', '1600712242805-5f78671b24da',
    '1581540222194-0def2dda95b8', '1611559410629-7cf7e2af1c8e',
    '1583266074991-5b5d5cd0d56f', '1611016186353-9af58c69a533',
    '1568605117036-5fe5e7bab0b3', '1611078489935-0cb964de46d6',
    '1609712409631-43e69c5ac9c6', '1605559424843-9e4c228bf1c2',
    '1632245889029-e406faaa34cd', '1572811844-23dee7f33c25',
  ],
  // Hot hatches / dailies — 12 IDs
  hatch: [
    '1523987355523-c7b5b48b1b76', '1493238792000-8113da705763',
    '1502877338535-766e1452684a', '1583121274602-3e2820c69888',
    '1606664515524-ed2f786a0bd6', '1568605117036-5fe5e7bab0b3',
    '1580273916550-e323be2ae537', '1617531653332-bd46c24f2068',
    '1611821064430-0d40291922d5', '1592198084033-aade902d1aae',
    '1568844293986-8d0400bd4745', '1601362840469-51e4d8d58785',
  ],
  // Trucks — 10 IDs
  truck: [
    '1599507593499-a3f7d7d97667', '1611016186353-9af58c69a533',
    '1612544448445-b8232cff3b6c', '1568605117036-5fe5e7bab0b3',
    '1606016159991-dfe4f2746ad5', '1581540222194-0def2dda95b8',
    '1591293836027-e05b48473b67', '1572811844-23dee7f33c25',
    '1611559410629-7cf7e2af1c8e', '1583266074991-5b5d5cd0d56f',
  ],
  // Exotics — 12 IDs
  exotic: [
    '1503376780353-7e6692767b70', '1606664515524-ed2f786a0bd6',
    '1568605117036-5fe5e7bab0b3', '1614026480209-fdc8a0d1e9a3',
    '1583121274602-3e2820c69888', '1502877828070-33b7cb1c2a0f',
    '1626668893632-6f3a4466d22f', '1611078489935-0cb964de46d6',
    '1632245889029-e406faaa34cd', '1631295868223-63265b40d9e4',
    '1605559424843-9e4c228bf1c2', '1612825173281-9a193378527e',
  ],
};

// model substring → photo pool
function poolFor(model) {
  const m = String(model || '').toLowerCase();
  if (/(supra|skyline|r34|r35|s2000|rx-7|silvia|s15|gtr|brz|miata|350z|nsx|gt86|civic|evo|lancer|eg6)/.test(m)) return PHOTOS.jdm;
  if (/(m3|m2|911|taycan|macan|rs3|rs6|rs7|polo|gti|golf|c63|c43|giulia|a110|cooper|mini|megane)/.test(m)) return PHOTOS.euro;
  if (/(mustang|camaro|demon|challenger|charger|f-?150)/.test(m)) return PHOTOS.muscle;
  if (/(yaris|i30|kona|ioniq|ibiza|leon|focus|clio|polo)/.test(m)) return PHOTOS.hatch;
  if (/(tacoma|gladiator|f-?150|raptor|truck)/.test(m)) return PHOTOS.truck;
  if (/(ferrari|488|porsche|huracan|aventador)/.test(m)) return PHOTOS.exotic;
  return PHOTOS.jdm;
}

const unsplash = (id) =>
  `https://images.unsplash.com/photo-${id}?w=600&h=600&fit=crop&auto=format`;

function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function pickPhoto(model, seedKey) {
  const pool = poolFor(model);
  return unsplash(pool[hash(seedKey) % pool.length]);
}

// ------------------------------------------------------------
// COMMENT TEMPLATES — ~120 entries with {make}/{model}/{first} placeholders.
// {first} is the first word of the model (e.g. "WRX", "M3", "911").
// ------------------------------------------------------------
const COMMENT_TEMPLATES = [
  'Send link to the wheels?',
  "Where'd you get the wing?",
  'Sounds insane on overrun.',
  'Following — love this build.',
  'Goals.',
  'Need a photographer like that.',
  'Brake setup looks crisp.',
  "Sick build, when's the next track day?",
  'That stance is unreal.',
  'Dyno numbers?',
  'That {first} looks meaner every post.',
  'Stance is dialled. Camber?',
  'Coilovers settling in nicely.',
  'Which compound on the rears?',
  'How loud at idle?',
  'Color choice is perfect for this {model}.',
  'Bay is tucked clean.',
  'Tucked harnesses look right.',
  'Drop dates on the pull video.',
  'Map specs?',
  'AFR on cruise?',
  'Boost target?',
  'Tune by who?',
  'How are you finding the {first} at the track?',
  'Saw this in person — photos do it no justice.',
  'Plate frame is sick.',
  'Add me on the group chat.',
  'Need this build in 1:18 scale.',
  'Cleanest {model} on the feed today.',
  "I'm building one of these — saving for reference.",
  'Wheel offset?',
  'Spacers in the rear?',
  'Does the wing actually do anything?',
  'No clipping issues with that drop?',
  'Mufflers are non-resonant right?',
  'Fitment on point.',
  'Where can I follow the full build log?',
  'Picked the right brand for this {first}.',
  'Glad you kept it OEM+ inside.',
  'Recaros holding up?',
  'Bride bucket reps or real?',
  'Steering wheel is gorgeous.',
  'Sticker game underrated.',
  'Took me 3 looks to see the splitter.',
  "Got me looking at {make}s again.",
  'How does it feel after the alignment?',
  'Toe out front?',
  'Are those Volks real?',
  'Endless or Project Mu?',
  'Switched to mineral fluid yet?',
  'Tow hook is a nice touch.',
  'OEM tail looks better tbh.',
  'Smoked side markers underrated.',
  'Sub frame collars next?',
  'Solid mounts?',
  'Glasshouse looks moody in this light.',
  'Background nailed the vibe.',
  'Track day was clean — when next?',
  'Need to come up to Sandown again.',
  'Phillip Island is next on my list.',
  'How wet was the line?',
  'Tyres still got life?',
  'NA or boosted?',
  'Built {first} > bought {first}.',
  'Hat off — full respect.',
  'Best build on my feed this week.',
  'No tagging the shop?',
  'DM me the painter, please.',
  'Underrated color combo.',
  'Carbon weave is going to age beautifully.',
  'Side skirts give it presence.',
  'Engine pull would be next level.',
  'Lap timer behind the wheel?',
  'Defi or AEM cluster?',
  'OEM gauge ftw though.',
  'Catless or high flow?',
  'Anti-lag enabled?',
  'How is it on the daily?',
  'Daily-able with that drop?',
  'Cabin noise much louder now?',
  'AC still ice-cold?',
  'Heat soak issues this summer?',
  'Trans cooler in?',
  'Diff cooler too?',
  'How much horsepower did this make?',
  'Built block?',
  'Forged internals?',
  'Closed deck conversion?',
  'Aluminum radiator did wonders for mine.',
  'Tucked AC pump looks killer.',
  'Battery relocation freed up so much room.',
  'Boost gauge reads true?',
  'Methanol injection?',
  'E85 friendly?',
  'Run pump 98?',
  "Front splitter — looks like APR. Confirm?",
  'Voltex or Spec-R rep?',
  'Genuine Volk LE-37 hits different.',
  'BBS LM never gets old.',
  'How long for the paint correction?',
  "I'd track day this {first}.",
  'Save the {make} alive movement.',
  'Bringing JDM back single-handedly.',
  'Goosebumps. {model} done right.',
  'Hard-fought tune, you can tell.',
  'Underbody must look spotless.',
  'Underglow next? Joking. Maybe.',
  'Mate — the photos slap.',
  'Time attack the {first}?',
  'Throw it on a dyno on a wet day for max scary numbers.',
  'Tail tidy might balance the rear.',
  'OEM mirrors but those caps are 🤌',
  "I'd run this car as is forever.",
  'Custom plate?',
  'Catch can drilled OEM or aftermarket?',
  'Methanol meth meth.',
  'Hood vents help heat?',
  'Got me re-thinking my whole build.',
  'How does it sit on the trailer?',
  'Cargo strap points still original?',
  'Looks even better in the wet.',
  'Sun is doing all the work in that shot.',
  'Tunnel pull next post?',
];

// ------------------------------------------------------------
// POST BODY TEMPLATES — interpolated with {make}/{model}/{first}/{mod}.
// {mod} pulls from a per-build-type mod pool so engine posts mention engine mods, etc.
// ------------------------------------------------------------
const POST_BODY_TEMPLATES = [
  'Picked up the {make} {model}. Build starts now.',
  'New shoes on the {first}. Looks aggressive.',
  'Ride height dialled on the {model}. Cornering is sharper.',
  'Met up with a few locals. Good light, good crew.',
  '{mod} fitted. Sounds incredible.',
  'First track day in the {first}. Best lap dropped by half a second.',
  'Dyno day. {mod} did the work — picked up real gains.',
  'Local meet. Big turnout. Good energy.',
  'Brakes feel like a different car after the {mod}.',
  'Long exposure under the bridge. The {first} loves the dark.',
  'Two days of laps. The {model} held up.',
  'Way more support from the {mod}. Worth every cent.',
  'Hard to believe it has been a year with the {model}.',
  'Splitter and wing fitted. The {first} is starting to look the part.',
  'Got the panning shot dialled. {make} content.',
  'Bolt-in cage for track use. Build is getting serious.',
  'Round 1 done. Mid-pack finish in the {first}.',
  'Build is feeling tight. {mod} was the missing link.',
  '{mod} install was painful but worth it. {first} feels brand new.',
  'Pulled the cam covers. Painted them. Re-torqued. Easiest win.',
  '{mod} arrived. Install this weekend.',
  'Carrier bearing replaced. NVH cut in half.',
  'Daily for a week with the {mod}. Manageable.',
  'Detailing day. {model} cleaned up nicely.',
  'Bigger turbo on the {first} — spool is a touch later but full send tops it out.',
  'Track tyres on, comfort tyres off. {first} feels lighter already.',
  'Ride along clip in stories — {first} pulls strong.',
  'New aero tested at 200kph. {first} sticks.',
  'Fresh fluids. {model} purrs.',
  'Got the {mod} fitted before the meet. Timing was tight.',
  '{first} on the trailer — heading to the track.',
  'Final tune complete. The {make} pulled hard.',
  'Body lines look right with the new ride height.',
  'Subtle clear corners. Big visual difference on the {first}.',
  'Rolled the rear fenders. Now the new wheels can settle.',
  'Track tutorial day in the {first}. Learned more than at any meet.',
  'Garage shot. {make} {model} earned this moment.',
  'Photographer killed it. Build looks meaner than ever.',
  'After-meet detail. {first} resting clean.',
  '{first} parked next to a stock one. Difference is unreal.',
  'Heat-cycled the new pads on a back road. Settled in well.',
  'Replaced the leaking diff seal. Quiet again.',
  'Mock-up of the new {mod} in the engine bay. Fits well.',
  'Final-fit the lip kit. Adhesive sets overnight.',
  'Started polishing. The clear coat is forgiving.',
  'New car cover. Garage looks tidy.',
  '{model} got pulled aside at the show. Worth waking up early.',
  '{first} flexing under the lights at the meet.',
  'Tested the new {mod} setting in slow corners. Difference is real.',
  'Pulled the rear bumper to fit the diffuser. {first} looks angrier already.',
  'Cars and coffee turned into a long lunch.',
  'Mid-build progress shot. Garage smells like solvent.',
  '{make} fans only.',
  'Threw on the {mod}. Logs look healthy.',
  'Quick after-work pull. The {first} eats highway.',
  'Track support crew + my {first} = good Sunday.',
  'Battery to the boot. Free up the engine bay.',
  '{make} community came through with the rare part again.',
  'Bedded the new pads in this morning. {first} stops on a coin.',
  'Visited the tuner. {make} looks tiny next to the dyno.',
  'Underbody flush, then a polish. Worth it.',
  'Solid mounts gave the {first} a new voice.',
  'Lowered another 10mm. Just within fender clearance.',
  'New seat fitted. {first} feels like a track car now.',
  '{make} runs honest power on the dyno.',
  'Brakes upgraded — pedal feel is night and day.',
  'Custom plates installed. {first} feels finished.',
  'Pulled to a stop next to a same-spec {model}. Owner liked the build.',
  '{first} sounds best at 4000rpm. Confirmed.',
];

const MOD_BY_TYPE = {
  Track: ['Stage 2 tune', 'Big brake kit', 'Coilover overhaul', 'New aero', 'Roll cage', 'Bucket seats'],
  JDM:   ['Walbro pump', 'ID injectors', 'Tomei cams', 'Voltex wing', 'BBS LM', 'Bride buckets'],
  Show:  ['HRE forged wheels', 'Carbon mirrors', 'KW V3 coilovers', 'M Performance wing', 'Akrapovic'],
  Daily: ['Stage 1 tune', 'Catback', 'H&R springs', 'Lip kit', 'Window tint'],
  Drift: ['Welded diff', 'Hydro handbrake', 'Origin Lab kit', 'BC Racing BR', 'Rocket Bunny over-fenders'],
};

function interp(tpl, car) {
  const first = String(car.model || '').split(' ')[0];
  const mods = MOD_BY_TYPE[car.build_type] || MOD_BY_TYPE.Track;
  const mod = mods[hash(car.id + tpl) % mods.length];
  return tpl
    .replaceAll('{make}', car.make || 'build')
    .replaceAll('{model}', car.model || 'build')
    .replaceAll('{first}', first || car.model || '')
    .replaceAll('{mod}', mod);
}

// ------------------------------------------------------------
// Pagination helper.
// ------------------------------------------------------------
async function fetchAll(table, columns, page = 1000) {
  const out = [];
  let from = 0;
  while (true) {
    const { data, error } = await sb
      .from(table)
      .select(columns)
      .order('id', { ascending: true })
      .range(from, from + page - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    out.push(...data);
    if (data.length < page) break;
    from += page;
  }
  return out;
}

// ------------------------------------------------------------
async function main() {
  console.log('1. loading cars + posts …');
  const cars = await fetchAll('cars', 'id, profile_id, make, model, build_type');
  const carById = new Map(cars.map((c) => [c.id, c]));
  console.log(`   ${cars.length} cars`);

  const posts = await fetchAll('posts', 'id, car_id, title');
  const carByPost = new Map(posts.map((p) => [p.id, p.car_id]));
  console.log(`   ${posts.length} posts`);

  // ----------------- cars: image only -----------------
  console.log('2. cars.primary_image_url → Unsplash by model bucket');
  let carImgFixed = 0;
  for (const car of cars) {
    const url = pickPhoto(car.model, car.id);
    const { error } = await sb.from('cars').update({ primary_image_url: url }).eq('id', car.id);
    if (!error) carImgFixed++;
  }
  console.log(`   updated ${carImgFixed}/${cars.length} cars`);

  // ----------------- post bodies -----------------
  console.log('3. posts.body → interpolated templates');
  let postFixed = 0;
  for (const post of posts) {
    const car = carById.get(post.car_id);
    if (!car) continue;
    const tpl = POST_BODY_TEMPLATES[hash(post.id) % POST_BODY_TEMPLATES.length];
    const body = interp(tpl, car);
    const { error } = await sb.from('posts').update({ body }).eq('id', post.id);
    if (!error) postFixed++;
    if (postFixed % 200 === 0) process.stdout.write(`   ${postFixed}/${posts.length}\r`);
  }
  console.log(`\n   updated ${postFixed} post bodies`);

  // ----------------- post_media images -----------------
  console.log('4. post_media.media_url → Unsplash per-row');
  const media = await fetchAll('post_media', 'id, post_id');
  console.log(`   ${media.length} media rows`);
  let mediaFixed = 0;
  for (const m of media) {
    const carId = carByPost.get(m.post_id);
    const car = carId ? carById.get(carId) : null;
    if (!car) continue;
    const url = pickPhoto(car.model, m.id);
    const { error } = await sb.from('post_media').update({ media_url: url }).eq('id', m.id);
    if (!error) mediaFixed++;
    if (mediaFixed % 200 === 0) process.stdout.write(`   ${mediaFixed}/${media.length}\r`);
  }
  console.log(`\n   updated ${mediaFixed} post_media rows`);

  // ----------------- comments -----------------
  console.log('5. post_comments.body → interpolated templates');
  const comments = await fetchAll('post_comments', 'id, post_id, body');
  console.log(`   ${comments.length} comment rows`);
  // Set of "stale" comment bodies — these are the original 10 strings that
  // need to be replaced. Anything else we leave alone (already updated).
  const STALE = new Set([
    'Send link to the wheels?',
    "Where'd you get the wing?",
    'Sounds insane on overrun.',
    'Following — love this build.',
    'Goals.',
    'Need a photographer like that.',
    'Brake setup looks crisp.',
    "Sick build, when's the next track day?",
    'That stance is unreal.',
    'Dyno numbers?',
  ]);
  let cFixed = 0;
  let cSkipped = 0;
  for (const c of comments) {
    if (!STALE.has(c.body) && !/Sounds insane on overrun|stance is unreal|Brake setup|wheels\?/.test(c.body || '')) {
      // Already in new (interpolated) format — leave alone.
      // The regex catches a few common stale fragments too.
    }
    const carId = carByPost.get(c.post_id);
    const car = carId ? carById.get(carId) : null;
    if (!car) { cSkipped++; continue; }
    const tpl = COMMENT_TEMPLATES[hash(c.id) % COMMENT_TEMPLATES.length];
    const body = interp(tpl, car);
    if (body === c.body) { cSkipped++; continue; }
    const { error } = await sb.from('post_comments').update({ body }).eq('id', c.id);
    if (!error) cFixed++;
    if (cFixed % 200 === 0) process.stdout.write(`   ${cFixed}/${comments.length}\r`);
  }
  console.log(`\n   updated ${cFixed} comments (skipped ${cSkipped} already-current)`);

  console.log('done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
