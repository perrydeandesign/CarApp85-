import type { BadgeType, Conn, DiscUser, GalleryPhoto, UserProfile } from '../constants/types';
import { USER_PROFILES } from './userProfiles';
import { DEMO_USERS, type User as DemoUser } from './demoUsers';

// Badges live in their own module; re-export so existing consumers don't break.
export { BADGE_META, USER_BADGES } from './badges';

/* ── Helpers ── */

const DEFAULT_COLOR = '#1a1a1a';

// Per-user cover colors — mirrors the "old build" approach where every car had
// its own tint as the profile/post background.
const USER_PALETTE = [
  '#1a2535', // STI blue
  '#1a1f35', // Skyline midnight
  '#251a20', // Evo burgundy
  '#1a2520', // GTI forest
  '#251a10', // Supra amber
  '#20152a', // RX-7 plum
  '#1a2a25', // mint
  '#2a1a1a', // brick
  '#15252a', // teal
  '#2a2515', // ochre
  '#2a1a25', // mauve
  '#15202a', // navy
];

// Categorize a flat list of mod strings into the {engine, wheels, interior, exterior}
// buckets the UI expects. Uses keyword matching; uncategorized mods fall into engine.
export function categorizeMods(mods?: string[]): { engine: string[]; wheels: string[]; interior: string[]; exterior: string[] } {
  const out = { engine: [] as string[], wheels: [] as string[], interior: [] as string[], exterior: [] as string[] };
  if (!Array.isArray(mods)) return out;
  for (const m of mods) {
    const t = m.toLowerCase();
    if (/coilover|spring|sway|control arm|wheel|tire|tyre|brake|caliper|rotor|hub|suspension|bbs|enkei|volk|rays|advan|rota/.test(t)) out.wheels.push(m);
    else if (/seat|recaro|sparco|harness|steering|shift|interior|gauge|dash|carpet|cluster|cage|roll/.test(t)) out.interior.push(m);
    else if (/spoiler|wing|splitter|diffuser|widebody|fender|hood|bumper|skirt|kit|paint|wrap|carbon|aero|grille|headlight|tail|mirror/.test(t)) out.exterior.push(m);
    else out.engine.push(m);
  }
  return out;
}

function colorForUsername(username: string): string {
  let h = 0;
  for (let i = 0; i < username.length; i++) {
    h = (h * 31 + username.charCodeAt(i)) >>> 0;
  }
  return USER_PALETTE[h % USER_PALETTE.length];
}

function usernameToInitials(username: string): string {
  if (!username) return '??';
  const parts = username.split(/[_\s.]+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function buildCarLabel(user: DemoUser): string {
  const { make, model, year } = user.car;
  return `${year} ${make} ${model}`;
}

/* ── CENTRALIZED USER DATA (now based on DEMO_USERS) ── */

export const CONNS: Conn[] = DEMO_USERS.map((u, index) => ({
  id: index + 1,
  userId: u.id,
  user: u.username,
  car: buildCarLabel(u),
  av: usernameToInitials(u.username),
  img: u.avatar || '',
  carImg: u.car.image || '',
  followers: u.followers,
  following: u.following,
  color: colorForUsername(u.username),
}));

/* ── Lookup user by userId ── */
export function findUserById(userId: string): Conn | undefined {
  return CONNS.find(c => c.userId === userId);
}

/* ── Get full user object: merges Conn (avatar, car image) with USER_PROFILES (bio, gallery, mods, timeline) ── */
export function getFullUser(conn: Conn) {
  const profile = USER_PROFILES[conn.user];
  const demoUser = DEMO_USERS.find(u => u.id === conn.userId);

  return {
    id: conn.userId,
    username: conn.user,
    profileImage: conn.img,   // user's face/avatar photo
    car: conn.car,
    carImage: conn.carImg,    // user's car photo
    av: conn.av,
    color: conn.color,
    followers: conn.followers,
    following: conn.following,
    bio:
      profile?.bio ||
      demoUser?.bio ||
      'Car enthusiast. Modified community member.',
    gallery: profile?.gallery || [],
    posts: profile?.posts || 0,
    connected: profile?.connected || 0,
    connections: profile?.connections || conn.followers || 0,
    mods: profile?.mods || categorizeMods(demoUser?.car?.mods),
    timeline: profile?.timeline || demoUser?.timeline || [],
  };
}

/* ── Pre-built USERS array (full profiles) ── */
export const USERS = CONNS.map(c => getFullUser(c));

/* ── Legacy `U` short-keyed lookup used by data/messaging.ts and a few other
 *    legacy modules. Maps short character keys to existing Conn records so the
 *    bundle resolves; exact identity does not need to match historic data. ── */
const U_KEYS = ['jake', 'boost', 'skyline', 'turbo', 'drift', 'evo'] as const;
type ULegacy = { user: string; av: string; img: string; car: string; color: string; carImg: string };
export const U: Record<string, ULegacy> =
  U_KEYS.reduce((acc, key, i) => {
    const c = CONNS[i] || CONNS[0];
    acc[key] = { user: c.user, av: c.av, img: c.img || '', car: c.car, color: c.color, carImg: c.carImg || '' };
    return acc;
  }, {} as Record<string, ULegacy>);

/* ── Re-exports so legacy callers importing from `data/users` keep working. ── */
export { DEMO_USERS } from './demoUsers';
export { USER_PROFILES } from './userProfiles';

/* ── Discover users (simple subset of CONNS) ── */
const DISC: DiscUser[] = CONNS.slice(0, 15).map((c, idx) => ({
  id: idx + 1,
  user: c.user,
  av: c.av,
  img: c.img,
}));

/* ── ME gallery/posts (keep your existing media for now) ── */
const ME_GALLERY: GalleryPhoto[] = [
  { id: 'me1', url: 'https://images.unsplash.com/photo-1572471275423-a6e40c020a46?w=600&h=600&fit=crop', car: 'Subaru WRX STI' },
  { id: 'me2', url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&h=600&fit=crop', car: 'Subaru WRX STI' },
  { id: 'me3', url: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=600&h=600&fit=crop', car: 'Subaru WRX STI' },
  { id: 'me4', url: 'https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?w=600&h=600&fit=crop', car: 'Lamborghini Huracan' },
  { id: 'me5', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=600&fit=crop', car: 'Porsche 911' },
  { id: 'me6', url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=600&fit=crop', car: 'Subaru WRX STI' },
  { id: 'me7', url: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=600&h=600&fit=crop', car: 'Subaru WRX STI' },
];

const ME_PHOTO_POSTS: string[] = [
  'https://images.unsplash.com/photo-1572471275423-a6e40c020a46?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1542362567-b07e54358753?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=600&fit=crop',
];

const ME_VIDEO_POSTS: { thumbnail: string; video: string }[] = [
  { thumbnail: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&h=600&fit=crop', video: 'https://example.com/wrx-pull.mp4' },
  { thumbnail: 'https://images.unsplash.com/photo-1611566026373-c6c8da0ea861?w=600&h=600&fit=crop', video: 'https://example.com/track-lap.mp4' },
  { thumbnail: 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=600&h=600&fit=crop', video: 'https://example.com/exhaust-sound.mp4' },
  { thumbnail: 'https://images.unsplash.com/photo-1558199099-ab7fa8a61cb4?w=600&h=600&fit=crop', video: 'https://example.com/drift-clip.mp4' },
  { thumbnail: 'https://images.unsplash.com/photo-1654704089641-abee50d23b7a?w=600&h=600&fit=crop', video: 'https://example.com/supra-launch.mp4' },
  { thumbnail: 'https://images.unsplash.com/photo-1621993202323-eb4ed9bb0530?w=600&h=600&fit=crop', video: 'https://example.com/gr-yaris.mp4' },
];

/* ── ME: built from DEMO_USERS (jake_sti) + existing profile shape ── */

const ME_DEMO = DEMO_USERS.find(u => u.username === 'jake_sti') || DEMO_USERS[0];

export const ME: UserProfile & {
  id: string;
  name: string;
  handle: string;
  location: string;
  connected: number;
  connections: number;
  img?: string;
  carImg?: string;
  banner?: string;
  photoPosts: string[];
  videoPosts: { thumbnail: string; video: string }[];
  gallery: GalleryPhoto[];
  mods?: any;
  timeline?: any;
} = {
  id: ME_DEMO.id,
  user: 'Jake_STI', // keep legacy display name
  name: 'Jake_STI',
  handle: '@jake_sti',
  location: ME_DEMO.location || 'Melbourne, AU',
  av: usernameToInitials(ME_DEMO.username),
  car: buildCarLabel(ME_DEMO),
  bio:
    ME_DEMO.bio ||
    'WRX owner. Car nerd. Track day enthusiast. Melbourne, AU.',
  followers: ME_DEMO.followers,
  following: ME_DEMO.following,
  posts: 14,
  connected: 97,
  connections: ME_DEMO.followers,
  color: DEFAULT_COLOR,
  img: ME_DEMO.avatar,
  carImg: ME_DEMO.car.image,
  banner: ME_DEMO.car.image,
  photoPosts: ME_PHOTO_POSTS,
  videoPosts: ME_VIDEO_POSTS,
  gallery: ME_GALLERY,
  mods: categorizeMods(ME_DEMO.car.mods),
  timeline: ME_DEMO.timeline,
};

/* ── Export DISC so existing consumers still work ── */
export { DISC };
