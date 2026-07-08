export type ModsMap = { engine: string[]; wheels: string[]; interior: string[]; exterior: string[] };
export type TimelineEntry = { id: number; type: string; time: string; title: string; text: string; likes: number; initComments: { user: string; text: string }[] };
export type GarageCar = { id: number; name: string; year: string; make: string; model: string; color: string; hp: string; torque: string; zero60: string; weight: string; mods: ModsMap; timeline: TimelineEntry[]; heroImageURL?: string; thumbnailURL?: string };
export type Post = { id: number; user: string; av: string; car: string; color: string; likes: number; comments: number; time: string; desc: string; liked?: boolean; cat?: string; img?: string; carImg?: string };
export type Notif = { id: number; user: string; action: string; time: string; av: string; unread: boolean; img?: string };
export type Conn = { id: number; userId: string; user: string; car: string; av: string; followers: number; following: number; color: string; img?: string; carImg?: string };
export type DiscUser = { id: number; user: string; av: string; img?: string };
export type UserProfile = { user: string; av: string; car: string; bio: string; followers: number; following: number; posts: number; color: string; img?: string; carImg?: string };
export type Vendor = { id: number; name: string; cat: string; color: string; desc: string; rating: number; reviewCount: number; heroImg?: string; website?: string; categories?: string[]; fitsMyGarage?: boolean };
export type VProduct = { name: string; compat: string; price: number; was: number | null; badge: string | null; cat: string; color: string; img?: string; vendorId: number; desc: string; brand?: string; fitment?: string; productURL?: string; fitsSelectedCar?: boolean };
export type VReview = { user: string; av: string; car: string; stars: number; time: string; text: string };
export type GalleryPhoto = { id: string; url: string; car: string };
export type BadgeType = 'verified' | 'mechanic' | 'vendor' | 'og';
export type Comment = { id: number; user: string; av: string; text: string; time: string; likes: number; img?: string; replies: Comment[] };

export type GroupPrivacy = 'public' | 'private';
export type GroupMember = { id: string; username: string; avatar: string; carModel: string; role: 'member' | 'admin' };
export type GroupPost = { id: string; groupId: string; userId: string; username: string; avatar: string; caption: string; photos: string[]; likes: number; comments: number; createdAt: number };
export type GroupEvent = { id: string; groupId: string; title: string; date: string; time: string; location: string; bannerUrl: string; attendees: GroupMember[] };
export type GroupGalleryItem = { id: string; groupId: string; url: string };
export type Group = { id: string; name: string; bannerUrl: string; iconUrl: string; description: string; privacy: GroupPrivacy; members: GroupMember[]; posts: GroupPost[]; events: GroupEvent[]; gallery: GroupGalleryItem[]; createdAt: number };

export type CompatResult = { fits: boolean; carName: string };
export type ChallengeEntry = { id: string; user: string; av: string; img: string; car: string; votes: number; voted?: boolean };
export type Challenge = { id: string; title: string; desc: string; icon: string; entries: ChallengeEntry[]; endDate: string; active: boolean };

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';
export type Reaction = { emoji: string; count?: number; mine?: boolean; userId?: string };
export type ReplyTo = { id: string; text: string; senderName: string };
export type Message = { id: string; senderId: string; text: string; time: string; status: MessageStatus; reactions: Reaction[]; replyTo?: ReplyTo; deleted?: boolean };
export type Participant = { id: string; name: string; initials: string; online: boolean; lastSeen?: string; img?: string };
export type Conversation = { id: string; participant: Participant; participants: Participant[]; messages: Message[]; pinned: boolean; muted: boolean; typing: boolean };
