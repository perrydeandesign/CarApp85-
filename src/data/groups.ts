import type { Group, GroupMember } from '../constants/types';
import { U } from './users';

/* ── GROUPS MOCK DATA ── */
export const GROUP_MEMBERS: Record<string, GroupMember> = {
  jake: { id: 'jake', username: U.jake.user, avatar: U.jake.img || '', carModel: 'Subaru WRX STI', role: 'admin' },
  skyline: { id: 'skyline', username: U.skyline.user, avatar: U.skyline.img || '', carModel: 'Nissan Skyline R34 GT-R', role: 'admin' },
  boost: { id: 'boost', username: U.boost.user, avatar: U.boost.img || '', carModel: 'Volkswagen Golf GTI Mk8', role: 'member' },
  turbo: { id: 'turbo', username: U.turbo.user, avatar: U.turbo.img || '', carModel: 'Toyota Supra MK4', role: 'member' },
  drift: { id: 'drift', username: U.drift.user, avatar: U.drift.img || '', carModel: 'Mazda RX-7 FD', role: 'member' },
  evo: { id: 'evo', username: U.evo.user, avatar: U.evo.img || '', carModel: 'Mitsubishi Lancer Evo IX', role: 'admin' },
};
export const GROUPS: Group[] = [
  {
    id: 'g1', name: 'JDM Legends Melbourne', bannerUrl: 'https://images.unsplash.com/photo-1611566026373-c6c8da0ea861?w=800&h=400&fit=crop',
    iconUrl: 'https://images.unsplash.com/photo-1611566026373-c6c8da0ea861?w=120&h=120&fit=crop',
    description: 'Melbourne\'s premier JDM community. Skylines, Supras, RX-7s and everything Japanese performance.',
    privacy: 'public',
    members: [GROUP_MEMBERS.skyline, GROUP_MEMBERS.turbo, GROUP_MEMBERS.drift, GROUP_MEMBERS.jake, GROUP_MEMBERS.evo],
    posts: [
      { id: 'gp1', groupId: 'g1', userId: 'skyline', username: U.skyline.user, avatar: U.skyline.img || '', caption: 'R34 looking clean after the weekend detail. Ready for the next meet.', photos: ['https://images.unsplash.com/photo-1743308283954-f391790c418e?w=600&h=400&fit=crop'], likes: 87, comments: 12, createdAt: Date.now() - 3600000 },
      { id: 'gp2', groupId: 'g1', userId: 'turbo', username: U.turbo.user, avatar: U.turbo.img || '', caption: '2JZ single turbo build complete. 780whp on pump fuel.', photos: ['https://images.unsplash.com/photo-1654704089641-abee50d23b7a?w=600&h=400&fit=crop'], likes: 234, comments: 45, createdAt: Date.now() - 7200000 },
      { id: 'gp3', groupId: 'g1', userId: 'drift', username: U.drift.user, avatar: U.drift.img || '', caption: 'Rotary sounds at 9000rpm. Nothing else compares.', photos: ['https://images.unsplash.com/photo-1745514326843-86fd44c211e8?w=600&h=400&fit=crop'], likes: 56, comments: 8, createdAt: Date.now() - 14400000 },
    ],
    events: [
      { id: 'ge1', groupId: 'g1', title: 'JDM Night Meet', date: 'Jul 15, 2025', time: '7:00 PM', location: 'Docklands, Melbourne', bannerUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f879e?w=800&h=400&fit=crop', attendees: [GROUP_MEMBERS.skyline, GROUP_MEMBERS.turbo, GROUP_MEMBERS.drift, GROUP_MEMBERS.jake] },
    ],
    gallery: [
      { id: 'gg1', groupId: 'g1', url: 'https://images.unsplash.com/photo-1743308283954-f391790c418e?w=600&h=600&fit=crop' },
      { id: 'gg2', groupId: 'g1', url: 'https://images.unsplash.com/photo-1654704089641-abee50d23b7a?w=600&h=600&fit=crop' },
      { id: 'gg3', groupId: 'g1', url: 'https://images.unsplash.com/photo-1745514326843-86fd44c211e8?w=600&h=600&fit=crop' },
      { id: 'gg4', groupId: 'g1', url: 'https://images.unsplash.com/photo-1611566026373-c6c8da0ea861?w=600&h=600&fit=crop' },
      { id: 'gg5', groupId: 'g1', url: 'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=600&h=600&fit=crop' },
    ],
    createdAt: Date.now() - 86400000 * 90,
  },
  {
    id: 'g2', name: 'Subaru Squad AU', bannerUrl: 'https://images.unsplash.com/photo-1572471275423-a6e40c020a46?w=800&h=400&fit=crop',
    iconUrl: 'https://images.unsplash.com/photo-1572471275423-a6e40c020a46?w=120&h=120&fit=crop',
    description: 'All things Subaru. WRX, STI, BRZ and Forester builds welcome. Share your flat-four love.',
    privacy: 'public',
    members: [GROUP_MEMBERS.jake, GROUP_MEMBERS.boost, GROUP_MEMBERS.evo],
    posts: [
      { id: 'gp4', groupId: 'g2', userId: 'jake', username: U.jake.user, avatar: U.jake.img || '', caption: 'COBB Stage 2 done. 310whp and climbing. Best mod so far.', photos: ['https://images.unsplash.com/photo-1572471275423-a6e40c020a46?w=600&h=400&fit=crop'], likes: 142, comments: 23, createdAt: Date.now() - 7200000 },
    ],
    events: [
      { id: 'ge2', groupId: 'g2', title: 'Subie Sunday', date: 'Jul 22, 2025', time: '9:00 AM', location: 'Yarra Valley, VIC', bannerUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=400&fit=crop', attendees: [GROUP_MEMBERS.jake, GROUP_MEMBERS.boost] },
    ],
    gallery: [
      { id: 'gg6', groupId: 'g2', url: 'https://images.unsplash.com/photo-1572471275423-a6e40c020a46?w=600&h=600&fit=crop' },
      { id: 'gg7', groupId: 'g2', url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&h=600&fit=crop' },
      { id: 'gg8', groupId: 'g2', url: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=600&h=600&fit=crop' },
    ],
    createdAt: Date.now() - 86400000 * 45,
  },
  {
    id: 'g3', name: 'Euro Builds', bannerUrl: 'https://images.unsplash.com/photo-1560282105-222992ffb774?w=800&h=400&fit=crop',
    iconUrl: 'https://images.unsplash.com/photo-1560282105-222992ffb774?w=120&h=120&fit=crop',
    description: 'VW, BMW, Audi and Mercedes performance builds. Euro meets and tech talk.',
    privacy: 'private',
    members: [GROUP_MEMBERS.boost],
    posts: [
      { id: 'gp5', groupId: 'g3', userId: 'boost', username: U.boost.user, avatar: U.boost.img || '', caption: 'APR Stage 2 is the best value mod for any GTI. 320hp on 98 octane.', photos: ['https://images.unsplash.com/photo-1560282105-222992ffb774?w=600&h=400&fit=crop'], likes: 98, comments: 15, createdAt: Date.now() - 86400000 },
    ],
    events: [],
    gallery: [
      { id: 'gg9', groupId: 'g3', url: 'https://images.unsplash.com/photo-1560282105-222992ffb774?w=600&h=600&fit=crop' },
      { id: 'gg10', groupId: 'g3', url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&h=600&fit=crop' },
    ],
    createdAt: Date.now() - 86400000 * 30,
  },
  {
    id: 'g4', name: 'Track Rats AU', bannerUrl: 'https://images.unsplash.com/photo-1558199099-ab7fa8a61cb4?w=800&h=400&fit=crop',
    iconUrl: 'https://images.unsplash.com/photo-1558199099-ab7fa8a61cb4?w=120&h=120&fit=crop',
    description: 'Dedicated track day enthusiasts. Lap times, setup tips and event coordination across Australia.',
    privacy: 'public',
    members: [GROUP_MEMBERS.jake, GROUP_MEMBERS.skyline, GROUP_MEMBERS.turbo, GROUP_MEMBERS.evo, GROUP_MEMBERS.drift],
    posts: [
      { id: 'gp6', groupId: 'g4', userId: 'evo', username: U.evo.user, avatar: U.evo.img || '', caption: 'Winton Raceway this Saturday. Who\'s in? Aiming for sub 1:40.', photos: ['https://images.unsplash.com/photo-1558199099-ab7fa8a61cb4?w=600&h=400&fit=crop'], likes: 44, comments: 19, createdAt: Date.now() - 10800000 },
      { id: 'gp7', groupId: 'g4', userId: 'skyline', username: U.skyline.user, avatar: U.skyline.img || '', caption: 'New PB at Phillip Island: 1:52.4. Coilovers made all the difference.', photos: [], likes: 156, comments: 31, createdAt: Date.now() - 43200000 },
    ],
    events: [
      { id: 'ge3', groupId: 'g4', title: 'Winton Track Day', date: 'Jul 8, 2025', time: '8:00 AM', location: 'Winton Raceway, VIC', bannerUrl: 'https://images.unsplash.com/photo-1558199099-ab7fa8a61cb4?w=800&h=400&fit=crop', attendees: [GROUP_MEMBERS.jake, GROUP_MEMBERS.skyline, GROUP_MEMBERS.turbo, GROUP_MEMBERS.evo] },
      { id: 'ge4', groupId: 'g4', title: 'Phillip Island Open Day', date: 'Aug 5, 2025', time: '7:30 AM', location: 'Phillip Island Circuit, VIC', bannerUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f879e?w=800&h=400&fit=crop', attendees: [GROUP_MEMBERS.skyline, GROUP_MEMBERS.drift] },
    ],
    gallery: [
      { id: 'gg11', groupId: 'g4', url: 'https://images.unsplash.com/photo-1558199099-ab7fa8a61cb4?w=600&h=600&fit=crop' },
      { id: 'gg12', groupId: 'g4', url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&h=600&fit=crop' },
      { id: 'gg13', groupId: 'g4', url: 'https://images.unsplash.com/photo-1547245324-d777c6f05e80?w=600&h=600&fit=crop' },
      { id: 'gg14', groupId: 'g4', url: 'https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=600&h=600&fit=crop' },
    ],
    createdAt: Date.now() - 86400000 * 120,
  },
];
