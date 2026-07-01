import type { Post, Notif, Comment } from '../constants/types';
import { U } from './users';

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
