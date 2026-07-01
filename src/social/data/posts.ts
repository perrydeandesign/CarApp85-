export type UserPreview = {
  id: string;
  username: string;
  avatarUrl: string;
};

export type PhotoTag = {
  username: string;
  /** Normalized 0-1 horizontal position from the image's left edge. */
  x: number;
  /** Normalized 0-1 vertical position from the image's top edge. */
  y: number;
};

export type ReactionType =
  | 'like'
  | 'love'
  | 'funny'
  | 'wow'
  | 'fire'
  | 'thumbs_up';

export type Comment = {
  id: string;
  postId: string;
  author: UserPreview;
  text: string;
  createdAt: string;
};

export type Post = {
  id: string;
  author: UserPreview;
  mediaUrl: string;
  caption: string;
  likeCount: number;
  commentCount: number;
  isLikedByCurrentUser: boolean;
  isSavedByCurrentUser: boolean;
  /** Whether the current viewer follows this post's author. Defaults to false. */
  isAuthorFollowedByCurrentUser?: boolean;
  taggedUsers?: UserPreview[];
  /** Positional tags pinned to coordinates on the photo. */
  photoTags?: PhotoTag[];
  createdAt: string;
};

const CW = '?w=800&h=600&fit=crop';
const PW = '?w=200&h=200&fit=crop&crop=face';

// Verified portrait photo IDs (all adult)
const FACE = {
  jake:    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d' + PW,
  skyline: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d' + PW,
  boost:   'https://images.unsplash.com/photo-1494790108377-be9c29b29330' + PW,
  turbo:   'https://images.unsplash.com/photo-1500648767791-00dcc994a43e' + PW,
  drift:   'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e' + PW,
  evo:     'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7' + PW,
};

// Verified car photo IDs
const CAR = {
  wrx:    'https://images.unsplash.com/photo-1572471275423-a6e40c020a46' + CW,
  r34:    'https://images.unsplash.com/photo-1743308283954-f391790c418e' + CW,
  golf:   'https://images.unsplash.com/photo-1560282105-222992ffb774' + CW,
  supra:  'https://images.unsplash.com/photo-1654704089641-abee50d23b7a' + CW,
  rx7:    'https://images.unsplash.com/photo-1745514326843-86fd44c211e8' + CW,
  evo:    'https://images.unsplash.com/photo-1558199099-ab7fa8a61cb4' + CW,
  m2:     'https://images.unsplash.com/photo-1617814076367-b759c7d7e738' + CW,
  rs3:    'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6' + CW,
  cayman: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f879e' + CW,
  s2000:  'https://images.unsplash.com/photo-1619682817481-e994891cd1f5' + CW,
  yaris:  'https://images.unsplash.com/photo-1621993202323-eb4ed9bb0530' + CW,
  mustang:'https://images.unsplash.com/photo-1584345604476-8ec5f82d661f' + CW,
  truck:  'https://images.unsplash.com/photo-1558618666-fcd25c85f82e' + CW,
};

const u = (id: string, username: string, avatarUrl = FACE.jake): UserPreview =>
  ({ id, username, avatarUrl });

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600 * 1000).toISOString();

export const MOCK_POSTS_V2: Post[] = [
  { id: 'v2-1',  author: u('u1','jake_sti', FACE.jake),       mediaUrl: CAR.wrx,    caption: 'COBB stage 2 finally tuned. Pulls so hard #wrx #sti #cobb', likeCount: 142, commentCount: 23, isLikedByCurrentUser: false, isSavedByCurrentUser: false, createdAt: hoursAgo(2)  },
  { id: 'v2-2',  author: u('u2','kevin_r34', FACE.skyline),   mediaUrl: CAR.r34,    caption: 'R34 back on the road. RB26 singing again #skyline #gtr #jdm',  likeCount: 389, commentCount: 67, isLikedByCurrentUser: true,  isSavedByCurrentUser: false, createdAt: hoursAgo(5)  },
  { id: 'v2-3',  author: u('u3','tom_evo', FACE.evo),         mediaUrl: CAR.evo,    caption: 'Track day ready. Bolt-on build + AMS intercooler #evoix #trackday', likeCount: 211, commentCount: 44, isLikedByCurrentUser: false, isSavedByCurrentUser: false, createdAt: hoursAgo(8)  },
  { id: 'v2-4',  author: u('u4','mia_gti', FACE.boost),       mediaUrl: CAR.golf,   caption: 'APR Stage 1 on 98 octane. 320hp value 💯 #gti #mk8',          likeCount: 98,  commentCount: 15, isLikedByCurrentUser: false, isSavedByCurrentUser: false, createdAt: hoursAgo(11) },
  { id: 'v2-5',  author: u('u5','noah_supra', FACE.turbo),    mediaUrl: CAR.supra,  caption: 'Single turbo MK4 lives again. Built 2JZ #supra #mkiv #2jz',     likeCount: 472, commentCount: 81, isLikedByCurrentUser: false, isSavedByCurrentUser: true,  createdAt: hoursAgo(14) },
  { id: 'v2-6',  author: u('u6','ruby_s2000', FACE.drift),    mediaUrl: CAR.s2000,  caption: 'AP1 carving canyons all weekend. F20C song never gets old #s2k', likeCount: 188, commentCount: 26, isLikedByCurrentUser: true,  isSavedByCurrentUser: false, createdAt: hoursAgo(18) },
  { id: 'v2-7',  author: u('u7','oliver_m2', FACE.skyline),   mediaUrl: CAR.m2,     caption: 'M2C on Ohlins. Phillip Island ready #m2 #bmw #ohlins',          likeCount: 256, commentCount: 38, isLikedByCurrentUser: false, isSavedByCurrentUser: false, createdAt: hoursAgo(22) },
  { id: 'v2-8',  author: u('u8','alex_rs3', FACE.jake),       mediaUrl: CAR.rs3,    caption: 'New rotors fitted. 5 cylinder still slaps #rs3 #audi',          likeCount: 124, commentCount: 19, isLikedByCurrentUser: false, isSavedByCurrentUser: false, createdAt: hoursAgo(26) },
  { id: 'v2-9',  author: u('u9','marco_911', FACE.turbo),     mediaUrl: CAR.cayman, caption: 'GT3 livery wrap done. Bit of fun for the weekend #porsche #gt3', likeCount: 514, commentCount: 92, isLikedByCurrentUser: true,  isSavedByCurrentUser: true,  createdAt: hoursAgo(32) },
  { id: 'v2-10', author: u('u10','lily_yarisgr', FACE.boost), mediaUrl: CAR.yaris,  caption: 'GR Yaris rally spec. Cobb tuned 280hp #gryaris #rally',         likeCount: 203, commentCount: 31, isLikedByCurrentUser: false, isSavedByCurrentUser: false, createdAt: hoursAgo(38) },
  { id: 'v2-11', author: u('u11','ryan_mustang', FACE.evo),   mediaUrl: CAR.mustang,caption: 'Whipple supercharger fitted. 700whp 5.0 #mustang #gt #s550',     likeCount: 327, commentCount: 54, isLikedByCurrentUser: false, isSavedByCurrentUser: false, createdAt: hoursAgo(44) },
  { id: 'v2-12', author: u('u12','harry_f150', FACE.drift),   mediaUrl: CAR.truck,  caption: 'Raptor on 37s. Best mod yet #raptor #ford #offroad',            likeCount: 178, commentCount: 22, isLikedByCurrentUser: false, isSavedByCurrentUser: false, createdAt: hoursAgo(50) },
  { id: 'v2-13', author: u('u13','sarah_s15', FACE.boost),    mediaUrl: CAR.r34,    caption: 'SR20DET lives. Walbro 460 + ID1050s fitted #s15 #silvia',       likeCount: 289, commentCount: 41, isLikedByCurrentUser: true,  isSavedByCurrentUser: false, createdAt: hoursAgo(60) },
  { id: 'v2-14', author: u('u14','zoe_miata', FACE.skyline),  mediaUrl: CAR.rx7,    caption: 'NB Miata stripped for the track. 2200kg of fun #miata #mx5',    likeCount: 156, commentCount: 19, isLikedByCurrentUser: false, isSavedByCurrentUser: false, createdAt: hoursAgo(70) },
  { id: 'v2-15', author: u('u15','lucas_m3', FACE.turbo),     mediaUrl: CAR.m2,     caption: 'M3 Comp on coils. Looking sharp #m3 #competition #bmw',         likeCount: 401, commentCount: 73, isLikedByCurrentUser: false, isSavedByCurrentUser: false, createdAt: hoursAgo(80) },
];
