// mockData.ts — Extracted mock data and helpers from App.tsx
import React, { createContext, useContext } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { MOD_ICONS, EMOJI_OPTIONS } from '../constants/theme';
import type {
  ModsMap, TimelineEntry, GarageCar, Post, Notif, Conn, DiscUser, UserProfile,
  Vendor, VProduct, VReview, GalleryPhoto, BadgeType, Comment,
  GroupPrivacy, GroupMember, GroupPost, GroupEvent, GroupGalleryItem, Group,
  CompatResult, ChallengeEntry, Challenge,
  MessageStatus, Reaction, ReplyTo, Message, Participant, Conversation,
} from '../constants';

export type { Comment, MessageStatus, Message, Conversation, Participant, Reaction, ReplyTo };

/* ── VERIFICATION BADGES ── */
export const BADGE_META: Record<BadgeType, { icon: string; color: string; label: string }> = {
  verified: { icon: 'checkmark-circle', color: '#3B82F6', label: 'Verified Builder' },
  mechanic: { icon: 'construct', color: '#F59E0B', label: 'Certified Mechanic' },
  vendor: { icon: 'storefront', color: '#A855F7', label: 'Official Vendor' },
  og: { icon: 'shield-checkmark', color: '#00C9A7', label: 'OG Member' },
};
export const USER_BADGES: Record<string, BadgeType[]> = {
  'SkylineKing': ['verified', 'og'],
  'TurboMike': ['verified'],
  'DriftKing_AU': ['verified', 'mechanic'],
  'EvoFanatic': ['og'],
  'amy_detailz': ['verified'],
  'sarah_speed': ['verified', 'mechanic'],
  'v8_vince': ['vendor'],
  'gt_gary': ['verified', 'og'],
  'Jake_STI': ['verified'],
};

export function ModIcon({ k, size, color }: { k: string; size: number; color: string }) {
  const ic = MOD_ICONS[k];
  if (ic.family === 'mci') return <MaterialCommunityIcons name={ic.name} size={size} color={color} />;
  return <Ionicons name={ic.name} size={size} color={color} />;
}

/* ── MOCK DATA ── */
export const GC1: GarageCar = {
  id: 1, name: '2019 Subaru WRX STI', year: '2019', make: 'Subaru', model: 'WRX STI', color: '#1a2535',
  hp: '310 whp', torque: '290 ft-lb', zero60: '4.6s', weight: '1,540 kg',
  mods: {
    engine: ['COBB AccessPort Stage 2', 'Perrin Intake', 'Tomei Ti Exhaust', 'Cusco Strut Brace', 'EJ207 Block Rebuild'],
    wheels: ['Enkei RPF1 18x9.5J', 'Michelin Pilot Sport 4S', 'H&R 25mm Spacers', 'Cusco Coilovers', 'Brembo 4-pot'],
    interior: ['Recaro SP-G Seats', 'Sparco 4-Point Harness', 'Kartboy Short Shifter', 'Defi BF Gauges', 'Carbon Fibre Trim'],
    exterior: ['STI Carbon Spoiler', 'OLM Side Skirts', 'Varis Front Splitter', 'Cusco Rear Diffuser', 'Carbon Wing Mirrors'],
  },
  timeline: [
    { id: 1, type: 'modification', time: '2 days ago', title: 'COBB Stage 2 Installed', text: 'Huge power gains from 3500rpm. Night and day difference.', likes: 34, initComments: [{ user: 'SkylineKing', text: 'What numbers?' }] },
    { id: 2, type: 'track', time: '1 week ago', title: 'Phillip Island Track Day', text: 'Best lap 2:14. Car felt planted all session.', likes: 87, initComments: [{ user: 'EvoFanatic', text: 'Absolute weapon!' }] },
    { id: 3, type: 'notification', time: '1 month ago', title: 'Tomei Ti Exhaust Fitted', text: 'Sounds incredible on overrun.', likes: 56, initComments: [{ user: 'TurboMike', text: 'Best exhaust for the STI.' }] },
  ],
};
export const GC2: GarageCar = {
  id: 2, name: '2015 Mitsubishi Lancer Evo X', year: '2015', make: 'Mitsubishi', model: 'Lancer Evo X', color: '#251530',
  hp: '440 whp', torque: '380 ft-lb', zero60: '3.8s', weight: '1,480 kg',
  mods: {
    engine: ['HKS GT2 Turbo Kit', 'AMS Performance Intake', 'Tomei Procam Cams', 'Mishimoto Intercooler', 'EcuFlash Stage 3 Tune'],
    wheels: ['Volk TE37 18in', 'Bridgestone RE-71R', 'Whiteline Sway Bars', 'Bilstein PSS10', 'Brembo GT 6-pot'],
    interior: ['Bride Zeta III Seats', 'Takata 4-Point Harness', 'Works Bell Short Boss', 'AEM UEGO Wideband', 'Alcantara Door Cards'],
    exterior: ['Voltex Type 7 Wing', 'APR Front Splitter', 'Seibon Carbon Hood', 'Ralliart Wide Arch Kit', 'TYC Fog Light Kit'],
  },
  timeline: [
    { id: 1, type: 'modification', time: '3 days ago', title: 'HKS GT2 Turbo Kit', text: 'Spooling hard from 3000rpm. Monster torque.', likes: 61, initComments: [{ user: 'BoostQueen', text: 'Insane!' }] },
    { id: 2, type: 'track', time: '2 weeks ago', title: 'Winton Raceway Debut', text: 'Sub 2 min laps first time out.', likes: 44, initComments: [] },
    { id: 3, type: 'event', time: '3 months ago', title: 'Evo X Acquired', text: 'Dedicated track car. Build starts now.', likes: 120, initComments: [{ user: 'SkylineKing', text: 'Two car garage!' }] },
  ],
};
export const GCARS = [GC1, GC2];

/* ── CENTRALIZED USER DATA ── */
export const U = {
  jake: { user: 'Jake_STI', av: 'JS', car: '2019 Subaru WRX STI', color: '#1a2535', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face', carImg: 'https://images.unsplash.com/photo-1572471275423-a6e40c020a46?w=800&h=600&fit=crop' },
  skyline: { user: 'SkylineKing', av: 'SK', car: '1999 Nissan Skyline R34 GT-R', color: '#1a1f35', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face', carImg: 'https://images.unsplash.com/photo-1743308283954-f391790c418e?w=800&h=600&fit=crop' },
  boost: { user: 'BoostQueen', av: 'BQ', car: '2020 Volkswagen Golf GTI Mk8', color: '#1a2520', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face', carImg: 'https://images.unsplash.com/photo-1560282105-222992ffb774?w=800&h=600&fit=crop' },
  turbo: { user: 'TurboMike', av: 'TM', car: '1994 Toyota Supra MK4', color: '#251a10', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face', carImg: 'https://images.unsplash.com/photo-1654704089641-abee50d23b7a?w=800&h=600&fit=crop' },
  drift: { user: 'DriftKing_AU', av: 'DK', car: '1993 Mazda RX-7 FD', color: '#20152a', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face', carImg: 'https://images.unsplash.com/photo-1745514326843-86fd44c211e8?w=800&h=600&fit=crop' },
  evo: { user: 'EvoFanatic', av: 'EF', car: '2006 Mitsubishi Lancer Evo IX', color: '#251a20', img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face', carImg: 'https://images.unsplash.com/photo-1558199099-ab7fa8a61cb4?w=800&h=600&fit=crop' },
  ben: { user: 'boosted_ben', av: 'BB', car: 'Nissan R34 GT-R', color: '#1a2030', img: 'https://i.pravatar.cc/150?img=12', carImg: 'https://images.unsplash.com/photo-1743308283954-f391790c418e?w=800&h=600&fit=crop' },
  amy: { user: 'amy_detailz', av: 'AD', car: 'Audi RS3', color: '#20251a', img: 'https://i.pravatar.cc/150?img=32', carImg: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop' },
  luke: { user: 'low_luke', av: 'LL', car: 'BMW M2', color: '#1a2025', img: 'https://i.pravatar.cc/150?img=45', carImg: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&h=600&fit=crop' },
  sarah: { user: 'sarah_speed', av: 'SS', car: 'Porsche Cayman GT4', color: '#25201a', img: 'https://i.pravatar.cc/150?img=5', carImg: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f879e?w=800&h=600&fit=crop' },
  joel: { user: 'jdm_joel', av: 'JJ', car: 'Honda S2000', color: '#1a1f25', img: 'https://i.pravatar.cc/150?img=18', carImg: 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=800&h=600&fit=crop' },
  ella: { user: 'euro_ella', av: 'EE', car: 'Volkswagen Golf R', color: '#1a2520', img: 'https://i.pravatar.cc/150?img=29', carImg: 'https://images.unsplash.com/photo-1560282105-222992ffb774?w=800&h=600&fit=crop' },
  tom: { user: 'track_tom', av: 'TT', car: 'Toyota GR Yaris', color: '#201a25', img: 'https://i.pravatar.cc/150?img=41', carImg: 'https://images.unsplash.com/photo-1621993202323-eb4ed9bb0530?w=800&h=600&fit=crop' },
  mia: { user: 'mia_mods', av: 'MM', car: 'Subaru WRX STI', color: '#1a2535', img: 'https://i.pravatar.cc/150?img=14', carImg: 'https://images.unsplash.com/photo-1572471275423-a6e40c020a46?w=800&h=600&fit=crop' },
  vince: { user: 'v8_vince', av: 'VV', car: 'Ford Mustang GT', color: '#251a1a', img: 'https://i.pravatar.cc/150?img=23', carImg: 'https://images.unsplash.com/photo-1584345604476-8ec5f82d661f?w=800&h=600&fit=crop' },
  kat: { user: 'kat_kustoms', av: 'KK', car: 'Mazda RX-7 FD', color: '#20152a', img: 'https://i.pravatar.cc/150?img=37', carImg: 'https://images.unsplash.com/photo-1745514326843-86fd44c211e8?w=800&h=600&fit=crop' },
  dan: { user: 'diesel_dan', av: 'DD', car: 'RAM 1500', color: '#1a201a', img: 'https://i.pravatar.cc/150?img=44', carImg: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=600&fit=crop' },
  holly: { user: 'hybrid_holly', av: 'HH', car: 'Toyota Prius GR Concept', color: '#152520', img: 'https://i.pravatar.cc/150?img=9', carImg: 'https://images.unsplash.com/photo-1621993202323-eb4ed9bb0530?w=800&h=600&fit=crop' },
  sam: { user: 'stance_sam', av: 'SM', car: 'Lexus IS350', color: '#1a1a25', img: 'https://i.pravatar.cc/150?img=50', carImg: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&h=600&fit=crop' },
  eric: { user: 'ev_eric', av: 'ER', car: 'Tesla Model 3 Performance', color: '#151a25', img: 'https://i.pravatar.cc/150?img=7', carImg: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=600&fit=crop' },
  ruby: { user: 'retro_ruby', av: 'RR', car: 'Datsun 240Z', color: '#25201a', img: 'https://i.pravatar.cc/150?img=16', carImg: 'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=800&h=600&fit=crop' },
  ollie: { user: 'offroad_ollie', av: 'OO', car: 'Jeep Wrangler Rubicon', color: '#1a2515', img: 'https://i.pravatar.cc/150?img=48', carImg: 'https://images.unsplash.com/photo-1519211975560-4ca611f5a72a?w=800&h=600&fit=crop' },
  sienna: { user: 'swift_sienna', av: 'SN', car: 'Suzuki Swift Sport', color: '#201a1a', img: 'https://i.pravatar.cc/150?img=11', carImg: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&h=600&fit=crop' },
  gary: { user: 'gt_gary', av: 'GG', car: 'Nissan GT-R R35', color: '#1a1f35', img: 'https://i.pravatar.cc/150?img=26', carImg: 'https://images.unsplash.com/photo-1611566026373-c6c8da0ea861?w=800&h=600&fit=crop' },
  maya: { user: 'mini_maya', av: 'MY', car: 'Mini Cooper JCW', color: '#251520', img: 'https://i.pravatar.cc/150?img=20', carImg: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&h=600&fit=crop' },
  carter: { user: 'civic_carter', av: 'CC', car: 'Honda Civic Type R FK8', color: '#1a2020', img: 'https://i.pravatar.cc/150?img=34', carImg: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop' },
};

export const POSTS: Post[] = [
  { id: 1, user: U.jake.user, av: U.jake.av, car: U.jake.car, color: U.jake.color, img: U.jake.img, carImg: U.jake.carImg, likes: 142, comments: 23, time: '2h', desc: 'Finally got the COBB stage 2 tune done. What a difference! Power delivery transformed from 3500rpm up. #BuildLife #Stage2 #SubaruWRX' },
  { id: 2, user: U.skyline.user, av: U.skyline.av, car: U.skyline.car, color: U.skyline.color, img: U.skyline.img, carImg: U.skyline.carImg, likes: 389, comments: 67, time: '5h', desc: 'Back on the road after a full engine rebuild. RB26 is singing again. Six months of work, worth every second. #RB26 #BuildLife #JDM' },
  { id: 3, user: U.evo.user, av: U.evo.av, car: U.evo.car, color: U.evo.color, img: U.evo.img, carImg: U.evo.carImg, likes: 211, comments: 44, time: '8h', desc: 'Track day ready. Full bolt-on build with AMS intercooler. This thing pulls like nothing I have driven. #TrackDay #EvoIX #MODIFIED' },
  { id: 4, user: U.boost.user, av: U.boost.av, car: U.boost.car, color: U.boost.color, img: U.boost.img, carImg: U.boost.carImg, likes: 98, comments: 15, time: '1d', desc: 'APR stage 1 map is insane value for money. 320hp on 98 octane. Highly recommend. #Stage1 #GolfGTI #TuneLife' },
];

/* ── SEED COMMENTS ── */
export const SEED_COMMENTS: Record<number, Comment[]> = {
  1: [
    { id: 101, user: U.skyline.user, av: U.skyline.av, img: U.skyline.img, text: 'COBB is the way to go! I ran their Stage 2+ on my old EJ257 and it was bulletproof. #BuildLife', time: '1h', likes: 12, replies: [
      { id: 1011, user: U.jake.user, av: U.jake.av, img: U.jake.img, text: 'Thanks man! Yeah the power band is so much smoother now', time: '45m', likes: 3, replies: [] },
      { id: 1012, user: U.turbo.user, av: U.turbo.av, img: U.turbo.img, text: 'Get a pro tune next, trust me the difference is night and day', time: '30m', likes: 5, replies: [] },
    ]},
    { id: 102, user: U.boost.user, av: U.boost.av, img: U.boost.img, text: 'What intake are you running with it? I hear the SF works best with COBB', time: '50m', likes: 8, replies: [
      { id: 1021, user: U.jake.user, av: U.jake.av, img: U.jake.img, text: 'Running the COBB SF intake with their airbox. Perfect combo', time: '40m', likes: 2, replies: [] },
    ]},
  ],
  2: [
    { id: 201, user: U.turbo.user, av: U.turbo.av, img: U.turbo.img, text: 'RB26 is the greatest engine ever made. No debate. #JDM #RB26', time: '4h', likes: 34, replies: [
      { id: 2011, user: U.drift.user, av: U.drift.av, img: U.drift.img, text: '2JZ would like a word... but RB26 sounds better', time: '3h', likes: 18, replies: [] },
    ]},
    { id: 202, user: U.evo.user, av: U.evo.av, img: U.evo.img, text: 'Six months is commitment. Respect the grind brother', time: '3h', likes: 15, replies: [] },
  ],
  3: [
    { id: 301, user: U.jake.user, av: U.jake.av, img: U.jake.img, text: 'Which track? Would love to come along next time! #TrackDay', time: '7h', likes: 9, replies: [
      { id: 3011, user: U.evo.user, av: U.evo.av, img: U.evo.img, text: 'Phillip Island next month! DM me if you want in', time: '6h', likes: 4, replies: [] },
    ]},
  ],
  4: [
    { id: 401, user: U.drift.user, av: U.drift.av, img: U.drift.img, text: 'APR makes incredible products. Their downpipe is next level too #TuneLife', time: '20h', likes: 6, replies: [] },
  ],
};
export const NOTIFS: Notif[] = [
  { id: 1, user: U.skyline.user, action: 'liked your post', time: '2m', av: U.skyline.av, img: U.skyline.img, unread: true },
  { id: 2, user: U.boost.user, action: 'started following you', time: '15m', av: U.boost.av, img: U.boost.img, unread: true },
  { id: 3, user: U.evo.user, action: 'commented on your post', time: '1h', av: U.evo.av, img: U.evo.img, unread: true },
  { id: 4, user: U.turbo.user, action: 'liked your post', time: '3h', av: U.turbo.av, img: U.turbo.img, unread: false },
  { id: 5, user: U.drift.user, action: 'started following you', time: '5h', av: U.drift.av, img: U.drift.img, unread: false },
];

/* ── Profile View Context (allows any component to open a full-screen profile) ── */
export const ViewProfileContext = createContext<{ openProfile: (user: any) => void }>({ openProfile: () => {} });
export const USER_PROFILES: Record<string, { bio: string; posts: number; connected: number; connections: number; mods: ModsMap; timeline: TimelineEntry[]; gallery: GalleryPhoto[] }> = {
  SkylineKing: {
    bio: 'R34 GT-R owner. JDM purist. Night runs and track days. Melbourne scene.',
    posts: 23, connected: 142, connections: 1240,
    mods: {
      engine: ['HKS GT-SS Turbo Kit', 'Nismo 740cc Injectors', 'Tomei Poncam Type-B', 'GReddy Intake Plenum', 'HKS F-Con V Pro'],
      wheels: ['RAYS Volk TE37 18x10.5', 'Bridgestone RE-71RS', 'Nismo Brake Kit', 'Tein Flex-Z Coilovers'],
      interior: ['Nismo Cluster', 'Bride GIAS II Seats', 'MOMO Steering Wheel', 'Defi Link Meter'],
      exterior: ['Nismo Z-Tune Front Bumper', 'Carbon Trunk Lid', 'Ganador Mirrors', 'Nismo Side Skirts'],
    },
    timeline: [
      { id: 1, type: 'modification', time: '1 week ago', title: 'HKS GT-SS Turbo Installed', text: '620whp on E85. Smooth power delivery all the way to redline.', likes: 145, initComments: [{ user: 'TurboMike', text: 'Goals right there.' }] },
      { id: 2, type: 'track', time: '3 weeks ago', title: 'Calder Park Night Session', text: 'Best 1/4 mile: 10.8 @ 132mph. Need more grip.', likes: 203, initComments: [{ user: 'DriftKing_AU', text: 'Weapon!' }] },
      { id: 3, type: 'event', time: '2 months ago', title: 'JDM Meet Melbourne', text: 'Great turnout. 200+ cars. R34s stole the show.', likes: 89, initComments: [] },
    ],
    gallery: [
      { id: 'sk1', url: 'https://images.unsplash.com/photo-1743308283954-f391790c418e?w=600&h=600&fit=crop', car: 'Nissan Skyline R34 GT-R' },
      { id: 'sk2', url: 'https://images.unsplash.com/photo-1611566026373-c6c8da0ea861?w=600&h=600&fit=crop', car: 'Nissan Skyline R34 GT-R' },
      { id: 'sk3', url: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f879e?w=600&h=600&fit=crop', car: 'Nissan Skyline R34 GT-R' },
      { id: 'sk4', url: 'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=600&h=600&fit=crop', car: 'Nissan Skyline R34 GT-R' },
      { id: 'sk5', url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=600&fit=crop', car: 'Toyota Supra MK4' },
      { id: 'sk6', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=600&fit=crop', car: 'Porsche 911' },
    ],
  },
  BoostQueen: {
    bio: 'VW GTI enthusiast. Stage builds and euro meets. Coffee and boost.',
    posts: 18, connected: 89, connections: 876,
    mods: {
      engine: ['APR Stage 2 ECU Tune', 'APR Downpipe', 'Forge Motorsport Intake', 'Turbosmart BOV'],
      wheels: ['BBS CI-R 19x8.5', 'Michelin PS4S 235/35', 'EBC Yellowstuff Pads', 'KW V3 Coilovers'],
      interior: ['APR Carbon Paddle Shifters', 'Raceseng Shift Knob', 'Volkswagen Digital Cockpit', 'P3 Gauges Vent Mount'],
      exterior: ['Maxton Front Splitter', 'Carbon Mirror Caps', 'Gloss Black Grille', 'Tinted Tail Lights'],
    },
    timeline: [
      { id: 1, type: 'modification', time: '3 days ago', title: 'APR Stage 2 Complete', text: '320hp on 98 octane. Best value mod ever.', likes: 98, initComments: [{ user: 'EvoFanatic', text: 'APR never disappoints.' }] },
      { id: 2, type: 'event', time: '2 weeks ago', title: 'Euro Car Day', text: 'Won Best GTI in Show. Buzzing!', likes: 67, initComments: [] },
    ],
    gallery: [
      { id: 'bq1', url: 'https://images.unsplash.com/photo-1560282105-222992ffb774?w=600&h=600&fit=crop', car: 'Volkswagen Golf GTI' },
      { id: 'bq2', url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&h=600&fit=crop', car: 'Volkswagen Golf GTI' },
      { id: 'bq3', url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=600&fit=crop', car: 'Chevrolet Corvette' },
      { id: 'bq4', url: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&h=600&fit=crop', car: 'Volkswagen Golf GTI' },
    ],
  },
  TurboMike: {
    bio: 'Supra MK4 build. 2JZ-GTE single turbo. Track monster in progress.',
    posts: 31, connected: 156, connections: 2100,
    mods: {
      engine: ['Precision 6766 Turbo', 'Brian Crower Cams', '1000cc Injectors', 'Haltech Elite 2500', 'GSC Beehive Springs'],
      wheels: ['Weds Sport TC105X 18x10', 'Toyo R888R 275/35', 'Wilwood Big Brake Kit', 'TEIN Super Racing Coilovers'],
      interior: ['Sparco EVO QRT Seats', 'NRG Quick Release Hub', 'AEM Wideband UEGO', 'Stack Pro Dash'],
      exterior: ['TRD Front Lip', 'APR GTC-300 Wing', 'Origin Lab Side Skirts', 'DMAX Carbon Hood'],
    },
    timeline: [
      { id: 1, type: 'modification', time: '5 days ago', title: 'Precision 6766 Fitted', text: '780whp on pump fuel. Absolute unit.', likes: 234, initComments: [{ user: 'SkylineKing', text: '2JZ never dies!' }] },
      { id: 2, type: 'track', time: '1 month ago', title: 'Winton Raceway PB', text: '1:38.2 — car is a different beast with the new setup.', likes: 112, initComments: [{ user: 'EvoFanatic', text: 'Flying!' }] },
      { id: 3, type: 'modification', time: '2 months ago', title: 'Haltech Elite 2500', text: 'Full standalone ECU. Flex fuel tuned and ready.', likes: 78, initComments: [] },
    ],
    gallery: [
      { id: 'tm1', url: 'https://images.unsplash.com/photo-1654704089641-abee50d23b7a?w=600&h=600&fit=crop', car: 'Toyota Supra MK4' },
      { id: 'tm2', url: 'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=600&h=600&fit=crop', car: 'Toyota Supra MK4' },
      { id: 'tm3', url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&h=600&fit=crop', car: 'Toyota Supra MK4' },
      { id: 'tm4', url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&h=600&fit=crop', car: 'Nissan Skyline R34 GT-R' },
      { id: 'tm5', url: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=600&h=600&fit=crop', car: 'Toyota Supra MK4' },
    ],
  },
  DriftKing_AU: {
    bio: 'RX-7 FD rotary life. Sideways is the only direction. 13B-REW turbo.',
    posts: 12, connected: 78, connections: 543,
    mods: {
      engine: ['Borg Warner S300 Turbo', 'Atkins Rotary Street Port', 'Sard 850cc Injectors', 'Microtech LT-16c ECU'],
      wheels: ['Work Meister S1 18x9.5', 'Federal 595 RS-RR', 'AP Racing 4-Pot Brakes', 'BC Racing BR Coilovers'],
      interior: ['Bride Stradia II Seats', 'Nardi Classic Wheel', 'A-Pillar Gauge Pod', 'HKS Turbo Timer'],
      exterior: ['RE Amemiya Front Bumper', 'Feed Rear Wing', 'Mazdaspeed Side Skirts', 'Carbon Fibre Bonnet'],
    },
    timeline: [
      { id: 1, type: 'track', time: '4 days ago', title: 'Drift Practice @ Broadford', text: 'New S300 turbo spools so fast. Perfect for drift.', likes: 67, initComments: [{ user: 'TurboMike', text: 'Brap brap!' }] },
      { id: 2, type: 'modification', time: '3 weeks ago', title: 'Borg Warner S300 Build', text: 'Finally done. 380whp at 14psi.', likes: 91, initComments: [] },
    ],
    gallery: [
      { id: 'dk1', url: 'https://images.unsplash.com/photo-1745514326843-86fd44c211e8?w=600&h=600&fit=crop', car: 'Mazda RX-7 FD' },
      { id: 'dk2', url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&h=600&fit=crop', car: 'Mazda RX-7 FD' },
      { id: 'dk3', url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0afe?w=600&h=600&fit=crop', car: 'Mazda RX-7 FD' },
    ],
  },
  EvoFanatic: {
    bio: 'Evo IX daily. Rally heritage. AYC and ACD tuned. Full bolt-on build.',
    posts: 9, connected: 64, connections: 312,
    mods: {
      engine: ['FP Green Turbo', 'AMS Intercooler', 'Buschur Intake', 'EcuFlash Open Source Tune', 'Tomei Ti Exhaust'],
      wheels: ['Enkei NT03+M 18x9.5', 'Dunlop Z3 Star Spec', 'DBA T3 Rotors', 'Whiteline Sway Bars'],
      interior: ['Recaro Sportster CS', 'Tomei Shift Knob', 'Defi BF Boost Gauge', 'Carbon Fibre Centre Console'],
      exterior: ['Varis Widebody Kit', 'APR GT-250 Wing', 'Seibon Carbon Hood', 'Ralliart Mud Flaps'],
    },
    timeline: [
      { id: 1, type: 'modification', time: '1 week ago', title: 'FP Green Turbo', text: 'Spools earlier than stock. 340whp and climbing.', likes: 56, initComments: [{ user: 'BoostQueen', text: 'Evo power!' }] },
      { id: 2, type: 'event', time: '1 month ago', title: 'Lancer Register Meet', text: '50 Evos in one spot. What a sight.', likes: 44, initComments: [] },
    ],
    gallery: [
      { id: 'ef1', url: 'https://images.unsplash.com/photo-1558199099-ab7fa8a61cb4?w=600&h=600&fit=crop', car: 'Mitsubishi Lancer Evo IX' },
      { id: 'ef2', url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&h=600&fit=crop', car: 'Mitsubishi Lancer Evo IX' },
      { id: 'ef3', url: 'https://images.unsplash.com/photo-1547245324-d777c6f05e80?w=600&h=600&fit=crop', car: 'Mitsubishi Lancer Evo IX' },
      { id: 'ef4', url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&h=600&fit=crop', car: 'BMW M3' },
      { id: 'ef5', url: 'https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=600&h=600&fit=crop', car: 'Mitsubishi Lancer Evo IX' },
      { id: 'ef6', url: 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=600&h=600&fit=crop', car: 'Mitsubishi Lancer Evo IX' },
      { id: 'ef7', url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&h=600&fit=crop', car: 'Mercedes AMG' },
      { id: 'ef8', url: 'https://images.unsplash.com/photo-1525609004556-c46c80848734?w=600&h=600&fit=crop', car: 'Mitsubishi Lancer Evo IX' },
      { id: 'ef9', url: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=600&h=600&fit=crop', car: 'Mitsubishi Lancer Evo IX' },
    ],
  },
  boosted_ben: {
    bio: 'Chasing boost and mountain runs.',
    posts: 18, connected: 85, connections: 980,
    mods: {
      engine: ['Garrett GTX3076R', 'HKS Intercooler', 'Tomei Fuel Pump', 'Link G4X ECU'],
      wheels: ['RAYS TE37 18x9.5', 'Federal RS-RR 265', 'Brembo 6-Pot BBK'],
      interior: ['Bride Zeta III', 'HKS Turbo Timer', 'Nardi Steering Wheel'],
      exterior: ['Nismo Z-Tune Bumper', 'Carbon Boot Lid', 'GT Wing'],
    },
    timeline: [
      { id: 1, type: 'modification', time: '3 days ago', title: 'GTX3076R Installed', text: 'Full boost by 4500rpm. Pulls hard to redline.', likes: 78, initComments: [{ user: 'SkylineKing', text: 'Welcome to the GTX club!' }] },
    ],
    gallery: [
      { id: 'bb1', url: 'https://images.unsplash.com/photo-1743308283954-f391790c418e?w=600&h=600&fit=crop', car: 'Nissan R34 GT-R' },
      { id: 'bb2', url: 'https://images.unsplash.com/photo-1611566026373-c6c8da0ea861?w=600&h=600&fit=crop', car: 'Nissan R34 GT-R' },
      { id: 'bb3', url: 'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=600&h=600&fit=crop', car: 'Nissan R34 GT-R' },
    ],
  },
  amy_detailz: {
    bio: 'Detailing addict. Gloss is life.',
    posts: 31, connected: 120, connections: 1450,
    mods: {
      engine: ['APR Stage 2 ECU', 'Eventuri Intake', 'Milltek Turbo-Back Exhaust'],
      wheels: ['BBS CI-R 19x8.5', 'Michelin PS4S', 'EBC Yellowstuff Pads'],
      interior: ['Alcantara Steering Wheel', 'Carbon Fibre Trim', 'LED Footwell Kit'],
      exterior: ['Carbon Mirror Caps', 'Maxton Lip Kit', 'PPF Full Wrap'],
    },
    timeline: [
      { id: 1, type: 'modification', time: '1 week ago', title: 'Full PPF Wrap', text: 'XPEL Ultimate Plus on every panel. No more rock chips.', likes: 134, initComments: [{ user: 'BoostQueen', text: 'This is the way.' }] },
    ],
    gallery: [
      { id: 'ad1', url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&h=600&fit=crop', car: 'Audi RS3' },
      { id: 'ad2', url: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=600&h=600&fit=crop', car: 'Audi RS3' },
      { id: 'ad3', url: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=600&h=600&fit=crop', car: 'Audi RS3' },
    ],
  },
  low_luke: {
    bio: 'Static > air. Fight me.',
    posts: 14, connected: 56, connections: 620,
    mods: {
      engine: ['BM3 Stage 2 Tune', 'VRSF Downpipe', 'CTS Turbo Intake'],
      wheels: ['Apex EC-7 18x9', 'Continental ExtremeContact Sport', 'KW V3 Coilovers'],
      interior: ['M Performance Alcantara Wheel', 'Carbon Shift Paddles'],
      exterior: ['PSM Carbon Lip', 'Carbon Diffuser', 'Glossy Black Kidney Grills'],
    },
    timeline: [
      { id: 1, type: 'modification', time: '2 weeks ago', title: 'KW V3 Installed', text: 'Perfect drop. Wheel gap deleted.', likes: 92, initComments: [{ user: 'stance_sam', text: 'Static gang!' }] },
    ],
    gallery: [
      { id: 'll1', url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600&h=600&fit=crop', car: 'BMW M2' },
      { id: 'll2', url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&h=600&fit=crop', car: 'BMW M2' },
      { id: 'll3', url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&h=600&fit=crop', car: 'BMW M2' },
    ],
  },
  sarah_speed: {
    bio: 'Track days > everything.',
    posts: 26, connected: 190, connections: 2340,
    mods: {
      engine: ['IPD Plenum', 'SharkWerks Exhaust', 'BMC Air Filter', 'Softronic Tune'],
      wheels: ['BBS RE-V7 19x8.5', 'Michelin Cup 2', 'Pagid RSC1 Pads', 'Ohlins Road & Track'],
      interior: ['Recaro Podium', 'Roll Bar', 'Schroth Harness', 'AIM Solo 2 DL'],
      exterior: ['Manthey Racing Aero Kit', 'Carbon Canards', 'Lexan Rear Window'],
    },
    timeline: [
      { id: 1, type: 'track', time: '4 days ago', title: 'Phillip Island PB', text: '1:48.2 — finally broke the 1:49 barrier. Ohlins made the difference.', likes: 267, initComments: [{ user: 'track_tom', text: 'Monster lap!' }] },
    ],
    gallery: [
      { id: 'ss1', url: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f879e?w=600&h=600&fit=crop', car: 'Porsche Cayman GT4' },
      { id: 'ss2', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=600&fit=crop', car: 'Porsche Cayman GT4' },
      { id: 'ss3', url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=600&fit=crop', car: 'Porsche Cayman GT4' },
    ],
  },
  jdm_joel: {
    bio: 'VTEC is my religion.',
    posts: 20, connected: 98, connections: 1120,
    mods: {
      engine: ['Toda F20C Header', 'Kraftwerks Supercharger', 'AEM EMS', 'Hondata FlashPro'],
      wheels: ['Enkei RPF1 17x8', 'Yokohama AD09', 'Spoon Mono-Block Calipers'],
      interior: ['Mugen Shift Knob', 'S2K-R Cluster', 'Hardtop Conversion'],
      exterior: ["J's Racing Front Bumper", 'Voltex Wing', 'Mugen Hardtop'],
    },
    timeline: [
      { id: 1, type: 'modification', time: '1 week ago', title: 'Kraftwerks SC Kit', text: '280whp NA feel with forced induction. Linear and clean.', likes: 145, initComments: [{ user: 'civic_carter', text: 'Honda power!' }] },
    ],
    gallery: [
      { id: 'jj1', url: 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=600&h=600&fit=crop', car: 'Honda S2000' },
      { id: 'jj2', url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&h=600&fit=crop', car: 'Honda S2000' },
      { id: 'jj3', url: 'https://images.unsplash.com/photo-1547245324-d777c6f05e80?w=600&h=600&fit=crop', car: 'Honda S2000' },
    ],
  },
  euro_ella: {
    bio: 'Daily driver but make it spicy.',
    posts: 11, connected: 67, connections: 780,
    mods: {
      engine: ['IS38 Turbo Swap', 'IE Intake', 'CTS Downpipe', 'Unitronic Stage 2+'],
      wheels: ['Neuspeed RSe10 19x8.5', 'Continental EC Sport', 'EBC Redstuff Pads'],
      interior: ['Raceseng Shift Knob', 'VW R Pedals', 'Kicker Sub Upgrade'],
      exterior: ['Oettinger Spoiler', 'Maxton Rear Diffuser', 'Tinted Tails'],
    },
    timeline: [
      { id: 1, type: 'modification', time: '5 days ago', title: 'IS38 Turbo Swap', text: 'Stage 2+ on the Golf R now. 400hp club.', likes: 88, initComments: [{ user: 'BoostQueen', text: 'Welcome to the big turbo life!' }] },
    ],
    gallery: [
      { id: 'ee1', url: 'https://images.unsplash.com/photo-1560282105-222992ffb774?w=600&h=600&fit=crop', car: 'Volkswagen Golf R' },
      { id: 'ee2', url: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=600&h=600&fit=crop', car: 'Volkswagen Golf R' },
      { id: 'ee3', url: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=600&h=600&fit=crop', car: 'Volkswagen Golf R' },
    ],
  },
  track_tom: {
    bio: 'Small car, big attitude.',
    posts: 8, connected: 42, connections: 560,
    mods: {
      engine: ['Litchfield Stage 2 ECU', 'HKS Hi-Power Exhaust', 'GR Intake'],
      wheels: ['Enkei RPF1 18x8', 'Dunlop Z3', 'Wilwood 4-Pot BBK', 'Bilstein B16'],
      interior: ['OMP WRC Wheel', 'Bride Stradia II', 'Harness Bar'],
      exterior: ['Varis Carbon Bonnet', 'Rally Mud Flaps', 'LED Pod Lights'],
    },
    timeline: [
      { id: 1, type: 'track', time: '2 weeks ago', title: 'Wakefield Park Sprint', text: 'P2 in class. This little thing surprises everyone.', likes: 67, initComments: [{ user: 'sarah_speed', text: 'GR Yaris is a weapon!' }] },
    ],
    gallery: [
      { id: 'tt1', url: 'https://images.unsplash.com/photo-1621993202323-eb4ed9bb0530?w=600&h=600&fit=crop', car: 'Toyota GR Yaris' },
      { id: 'tt2', url: 'https://images.unsplash.com/photo-1654704089641-abee50d23b7a?w=600&h=600&fit=crop', car: 'Toyota GR Yaris' },
      { id: 'tt3', url: 'https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=600&h=600&fit=crop', car: 'Toyota GR Yaris' },
    ],
  },
};
