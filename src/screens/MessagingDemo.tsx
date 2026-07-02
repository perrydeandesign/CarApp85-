// App.tsx — MODIFIED Car Community App (Full Port + Messaging)
import 'react-native-gesture-handler';
import React, { useState, useRef, useEffect, createContext, useContext, useCallback } from 'react';
import {
  View, Text, SafeAreaView, TouchableOpacity, ScrollView, Image,
  TextInput, FlatList, KeyboardAvoidingView, Platform, Animated,
  Modal, Alert, Dimensions, StatusBar, Pressable, StyleSheet, Share, Linking,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { GCARS } from './src/data/garage';
import { AppNavigator } from './src/navigation/AppNavigator';
import { PostCard } from './src/components/SharedCard';
import { USER_PROFILES } from './src/data/userProfiles';
import { SEED_COMMENTS, NOTIFS } from './src/data/posts';
import { CHALLENGES } from './src/data/challenges';
import { U, CONNS, USERS, ME, BADGE_META, USER_BADGES, findUserById, getFullUser } from './src/data/users';

export { U, CONNS, USERS, ME, BADGE_META, USER_BADGES, findUserById, getFullUser };

const { width: SCREEN_W } = Dimensions.get('window');

/* ── THEME ── */
const T = {
  bg: '#0D1117', card: '#161B22', card2: '#21262D', bd: '#30363D',
  mu: '#8B949E', tx: '#F0F6FC', tx2: '#C9D1D9', wh: '#FFFFFF',
  accent: '#00C9A7', accentDim: 'rgba(0,201,167,0.12)',
  danger: '#F87171', me: '#00C9A7', them: '#161B2E',
  ac: '#00C9A7', cd: '#161B22', cd2: '#21262D',
};
/* ── ICON SCALE (Instagram / Facebook consistent sizing) ── */
const IC = {
  nav: 24,       // top nav bar icons (hamburger, search, bell, chat)
  tab: 26,       // bottom tab bar icons
  back: 22,      // back arrows, close buttons
  action: 24,    // post actions (like, comment, share)
  actionSm: 20,  // smaller action icons (timeline like, comment)
  inline: 16,    // inline icons (search results, category dots, tags)
  status: 10,    // message status ticks
  badge: 14,     // category badges, small labels
  drawer: 22,    // drawer menu icons
  hero: 28,      // hero/feature icons (camera button, vendor cats)
};
const CAT: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  notification: { bg: '#0D2B27', border: '#00C9A7', text: '#4FD1B8', dot: '#00C9A7' },
  track: { bg: '#0D1B30', border: '#4D8EE8', text: '#7EB3F5', dot: '#4D8EE8' },
  modification: { bg: '#2B2000', border: '#E5A300', text: '#FBBF24', dot: '#E5A300' },
  event: { bg: '#1E0A2E', border: '#A855F7', text: '#C084FC', dot: '#A855F7' },
};
const TL_LABELS: Record<string, string> = { notification: 'Notification', track: 'Track Day', modification: 'Modification', event: 'Event' };
const ML: Record<string, string> = { engine: 'Engine', wheels: 'Wheels', interior: 'Interior', exterior: 'Exterior' };
const MOD_ICONS: Record<string, { name: string; family: 'ionicon' | 'mci' }> = { engine: { name: 'engine-outline', family: 'mci' }, wheels: { name: 'tire', family: 'mci' }, interior: { name: 'car-seat', family: 'mci' }, exterior: { name: 'car-side', family: 'mci' } };
export function ModIcon({ k, size, color }: { k: string; size: number; color: string }) {
  const ic = MOD_ICONS[k];
  if (ic.family === 'mci') return <MaterialCommunityIcons name={ic.name} size={size} color={color} />;
  return <Ionicons name={ic.name} size={size} color={color} />;
}
const TL_ICONS: Record<string, string> = { modification: 'build-outline', track: 'flag-outline', notification: 'notifications-outline', event: 'calendar-outline' };

/* ── VERIFICATION BADGES ── */
type BadgeType = 'verified' | 'mechanic' | 'vendor' | 'og';

/* ── TYPES ── */
type ModsMap = { engine: string[]; wheels: string[]; interior: string[]; exterior: string[] };
type TimelineEntry = { id: number; type: string; time: string; title: string; text: string; likes: number; initComments: { user: string; text: string }[] };
type GarageCar = { id: number; name: string; year: string; make: string; model: string; color: string; hp: string; torque: string; zero60: string; weight: string; mods: ModsMap; timeline: TimelineEntry[]; heroImageURL?: string; thumbnailURL?: string };
type Post = { id: number; user: string; av: string; car: string; color: string; likes: number; comments: number; time: string; desc: string; liked?: boolean; cat?: string; img?: string; carImg?: string };
type Notif = { id: number; user: string; action: string; time: string; av: string; unread: boolean; img?: string };
type Conn = { id: number; userId: string; user: string; car: string; av: string; followers: number; following: boolean; color: string; img?: string; carImg?: string };
type DiscUser = { id: number; user: string; av: string; img?: string };
type UserProfile = { user: string; av: string; car: string; bio: string; followers: number; following: number; posts: number; color: string; img?: string; carImg?: string };
type Vendor = { id: number; name: string; cat: string; color: string; desc: string; rating: number; reviewCount: number; heroImg?: string; website?: string; categories?: string[]; fitsMyGarage?: boolean };
type VProduct = { name: string; compat: string; price: number; was: number | null; badge: string | null; cat: string; color: string; img?: string; vendorId: number; desc: string; brand?: string; fitment?: string; productURL?: string; fitsSelectedCar?: boolean };
type VReview = { user: string; av: string; car: string; stars: number; time: string; text: string };
type GalleryPhoto = { id: string; url: string; car: string };

/* ── GROUP TYPES ── */
type GroupPrivacy = 'public' | 'private';
type GroupMember = { id: string; username: string; avatar: string; carModel: string; role: 'member' | 'admin' };
type GroupPost = { id: string; groupId: string; userId: string; username: string; avatar: string; caption: string; photos: string[]; likes: number; comments: number; createdAt: number };
type GroupEvent = { id: string; groupId: string; title: string; date: string; time: string; location: string; bannerUrl: string; attendees: GroupMember[] };
type GroupGalleryItem = { id: string; groupId: string; url: string };
type Group = { id: string; name: string; bannerUrl: string; iconUrl: string; description: string; privacy: GroupPrivacy; members: GroupMember[]; posts: GroupPost[]; events: GroupEvent[]; gallery: GroupGalleryItem[]; createdAt: number };

/* ── COMPATIBILITY & CHALLENGES TYPES ── */
type CompatResult = { fits: boolean; carName: string };
type ChallengeEntry = { id: string; user: string; av: string; img: string; car: string; votes: number; voted?: boolean };
type Challenge = { id: string; title: string; desc: string; icon: string; entries: ChallengeEntry[]; endDate: string; active: boolean };

/* ── MOCK DATA ── */

/* ── CENTRALIZED USER DATA ── */
/* ── Lookup user by userId ── */
/* ── Profile View Context (allows any component to open a full-screen profile) ── */
export const ViewProfileContext = createContext<{ openProfile: (user: any) => void }>({ openProfile: () => {} });

/* ── Pre-built USERS array: every user with id, username, profileImage, car, carImage, bio, gallery ── */





/* ── MESSAGING TYPES ── */
type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';
type Reaction = { emoji: string; count?: number; mine?: boolean; userId?: string };
type ReplyTo = { id: string; text: string; senderName: string };
type Message = { id: string; senderId: string; text: string; time: string; status: MessageStatus; reactions: Reaction[]; replyTo?: ReplyTo; deleted?: boolean };
type Participant = { id: string; name: string; initials: string; online: boolean; lastSeen?: string; img?: string };
type Conversation = { id: string; participant: Participant; participants: Participant[]; messages: Message[]; pinned: boolean; muted: boolean; typing: boolean };


/* ── CONTEXTS ── */
type ConversationsContextType = { conversations: Conversation[]; setConversations: React.Dispatch<React.SetStateAction<Conversation[]>> };
export const ConversationsContext = createContext<ConversationsContextType>({ conversations: [], setConversations: () => {} });
export function useConversations() { return useContext(ConversationsContext); }
export const GoHomeContext = createContext<() => void>(() => {});
export function useGoHome() { return useContext(GoHomeContext); }



/* ── AVATAR ── */
export function Avatar({ initials, name, size = 40, online = false, accent = false, ring = false, img }: {
  initials?: string; name?: string; size?: number; online?: boolean; accent?: boolean; ring?: boolean; img?: string;
}) {
  if (!initials && name) initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const inner = img ? (
    <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', borderWidth: 1.5, borderColor: accent ? T.accent : T.bd }}>
      <Image source={{ uri: img }} style={{ width: size, height: size, borderRadius: size / 2 }} />
      {online && <View style={{
        position: 'absolute', bottom: 1, right: 1,
        width: Math.max(8, size * 0.24), height: Math.max(8, size * 0.24),
        borderRadius: size * 0.12, backgroundColor: '#22C55E',
        borderWidth: 1.5, borderColor: T.bg,
      }} />}
    </View>
  ) : (
    <View style={[{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: accent ? T.accent : T.card2,
      borderWidth: 1.5, borderColor: accent ? T.accent : T.bd,
      alignItems: 'center', justifyContent: 'center',
    }]}>
      <Text style={{ fontSize: size * 0.34, fontWeight: '700', color: accent ? '#051210' : T.tx2 }}>{initials}</Text>
      {online && <View style={{
        position: 'absolute', bottom: 1, right: 1,
        width: Math.max(8, size * 0.24), height: Math.max(8, size * 0.24),
        borderRadius: size * 0.12, backgroundColor: '#22C55E',
        borderWidth: 1.5, borderColor: T.bg,
      }} />}
    </View>
  );
  if (ring) {
    return (
      <View style={{ padding: 2, borderRadius: (size + 8) / 2, borderWidth: 2, borderColor: T.accent, overflow: 'hidden' }}>
        {inner}
      </View>
    );
  }
  return inner;
}

/* ── VERIFICATION BADGE COMPONENT ── */
function VerifiedBadges({ username, size = 14, showLabel = false }: { username: string; size?: number; showLabel?: boolean }) {
  const badges = USER_BADGES[username];
  if (!badges || badges.length === 0) return null;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
      {badges.map(b => {
        const meta = BADGE_META[b];
        return (
          <TouchableOpacity key={b} onPress={() => Alert.alert(meta.label, `This user is a ${meta.label.toLowerCase()}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <Ionicons name={meta.icon as any} size={size} color={meta.color} />
            {showLabel && <Text style={{ fontSize: 10, fontWeight: '600', color: meta.color }}>{meta.label}</Text>}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/* ── HASHTAG HELPERS ── */
function extractHashtags(text: string): string[] {
  const matches = text.match(/#[A-Za-z0-9_]+/g);
  return matches ? [...new Set(matches.map(t => t.toLowerCase()))] : [];
}
export function RichText({ text, style }: { text: string; style?: any }) {
  const parts = text.split(/(#[A-Za-z0-9_]+)/g);
  return (
    <Text style={style}>
      {parts.map((part, i) =>
        part.startsWith('#') ? (
          <Text key={i} style={{ color: T.accent, fontWeight: '600' }}>{part}</Text>
        ) : (
          <Text key={i}>{part}</Text>
        )
      )}
    </Text>
  );
}

/* ── FIELD ── */
function Field({ label, value, onChangeText, placeholder, secure = false, autoFocus = false, keyboardType = 'default' as any, autoCorrect = true }: {
  label?: string; value: string; onChangeText: (v: string) => void; placeholder?: string; secure?: boolean; autoFocus?: boolean; keyboardType?: string; autoCorrect?: boolean;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      {label ? <Text style={{ fontSize: 11, color: T.mu, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{label}</Text> : null}
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={T.mu}
        secureTextEntry={secure} autoFocus={autoFocus} keyboardType={keyboardType} autoCorrect={autoCorrect}
        textContentType={secure ? 'oneTimeCode' : 'none'} autoComplete="off" spellCheck={false}
        style={{ padding: 13, paddingHorizontal: 16, backgroundColor: T.card, borderWidth: 1, borderColor: T.bd, borderRadius: 10, color: T.tx, fontSize: 14 }} />
    </View>
  );
}
function FieldArea({ label, value, onChangeText, placeholder, rows = 3 }: {
  label?: string; value: string; onChangeText: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      {label ? <Text style={{ fontSize: 11, color: T.mu, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{label}</Text> : null}
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={T.mu}
        multiline numberOfLines={rows} textContentType="none" autoComplete="off" spellCheck={false}
        style={{ padding: 13, paddingHorizontal: 16, backgroundColor: T.card, borderWidth: 1, borderColor: T.bd, borderRadius: 10, color: T.tx, fontSize: 14, minHeight: rows * 22, textAlignVertical: 'top' }} />
    </View>
  );
}

/* ── SEARCH BAR ── */
export function SearchBar({ value, onChange, onChangeText, placeholder = 'Search...' }: {
  value: string; onChange?: (v: string) => void; onChangeText?: (v: string) => void; placeholder?: string;
}) {
  const handler = onChangeText || onChange || (() => {});
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: T.card, borderRadius: 12, borderWidth: 1, borderColor: T.bd, paddingHorizontal: 12, paddingVertical: 8, gap: 8, marginHorizontal: 16, marginVertical: 10 }}>
      <Ionicons name="search-outline" size={IC.inline} color={T.mu} />
      <TextInput style={{ flex: 1, color: T.tx, fontSize: 14 }} value={value} onChangeText={handler} placeholder={placeholder} placeholderTextColor={T.mu} />
      {value.length > 0 && <TouchableOpacity onPress={() => handler('')}><Ionicons name="close" size={IC.inline} color={T.mu} /></TouchableOpacity>}
    </View>
  );
}

/* ── TYPING INDICATOR ── */
export function TypingIndicator({ name }: { name?: string } = {}) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = (dot: Animated.Value, delay: number) =>
      Animated.loop(Animated.sequence([
        Animated.delay(delay),
        Animated.timing(dot, { toValue: -5, duration: 280, useNativeDriver: true }),
        Animated.timing(dot, { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.delay(600),
      ]));
    const a1 = anim(dot1, 0); const a2 = anim(dot2, 140); const a3 = anim(dot3, 280);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, [dot1, dot2, dot3]);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: T.them, borderRadius: 18, borderBottomLeftRadius: 4, paddingHorizontal: 14, paddingVertical: 12, alignSelf: 'flex-start', marginBottom: 8 }}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View key={i} style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: T.mu, transform: [{ translateY: dot }] }} />
      ))}
    </View>
  );
}

/* ── STATUS ICON ── */
export function StatusIcon({ status }: { status: MessageStatus }) {
  const color = status === 'read' ? T.accent : T.mu;
  if (status === 'sending') return <Ionicons name="ellipse-outline" size={IC.status} color={T.mu} />;
  if (status === 'sent') return <Ionicons name="checkmark" size={IC.status} color={color} />;
  return <Ionicons name="checkmark-done" size={IC.status} color={color} />;
}

/* ── REACTION PICKER ── */
const EMOJI_OPTIONS = ['\uD83D\uDD25', '\uD83D\uDE4C', '\uD83D\uDE02', '\u2764\uFE0F', '\uD83D\uDE2E', '\uD83D\uDC40'];
export function ReactionPicker({ onSelect, onClose }: { onSelect: (emoji: string) => void; onClose: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
  }, [opacity, scale]);
  return (
    <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
      <Animated.View style={{
        position: 'absolute', bottom: 80, alignSelf: 'center',
        flexDirection: 'row', backgroundColor: T.card, borderRadius: 32,
        borderWidth: 1, borderColor: T.bd, paddingHorizontal: 8, paddingVertical: 6, gap: 4,
        opacity, transform: [{ scale }], zIndex: 100,
      }}>
        {EMOJI_OPTIONS.map(e => (
          <TouchableOpacity key={e} onPress={() => { onSelect(e); onClose(); }} style={{ padding: 8, borderRadius: 24 }}>
            <Text style={{ fontSize: 22 }}>{e}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </Pressable>
  );
}


/* ── COMMENTS THREAD ── */
function CommentRow({ comment, depth = 0, onReply }: { comment: Comment; depth?: number; onReply: (parentId: number, user: string) => void }) {
  const [liked, setLiked] = useState(false);
  const [showReplies, setShowReplies] = useState(depth < 1);
  const indent = Math.min(depth, 2) * 28;
  return (
    <View style={{ marginLeft: indent }}>
      <View style={{ flexDirection: 'row', paddingVertical: 8, gap: 8 }}>
        <Avatar initials={comment.av} size={depth === 0 ? 30 : 24} img={comment.img} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: T.tx }}>{comment.user}</Text>
            <Text style={{ fontSize: 10, color: T.mu }}>{comment.time}</Text>
          </View>
          <RichText text={comment.text} style={{ fontSize: 13, color: T.tx2, lineHeight: 18 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 4 }}>
            <TouchableOpacity onPress={() => setLiked(l => !l)} style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Ionicons name={liked ? 'heart' : 'heart-outline'} size={13} color={liked ? T.accent : T.mu} />
              <Text style={{ fontSize: 11, color: liked ? T.accent : T.mu }}>{comment.likes + (liked ? 1 : 0)}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onReply(comment.id, comment.user)}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: T.mu }}>Reply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {comment.replies.length > 0 && !showReplies && (
        <TouchableOpacity onPress={() => setShowReplies(true)} style={{ marginLeft: 38, marginBottom: 4 }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: T.accent }}>View {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}</Text>
        </TouchableOpacity>
      )}
      {showReplies && comment.replies.map(r => (
        <CommentRow key={r.id} comment={r} depth={depth + 1} onReply={onReply} />
      ))}
    </View>
  );
}

export function CommentsThread({ postId }: { postId: number }) {
  const [comments, setComments] = useState<Comment[]>(SEED_COMMENTS[postId] || []);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<{ parentId: number; user: string } | null>(null);
  const { openProfile } = useContext(ViewProfileContext);

  const addComment = () => {
    if (!text.trim()) return;
    const newComment: Comment = {
      id: Date.now(), user: ME.user, av: ME.av, img: ME.img,
      text: replyTo ? `@${replyTo.user} ${text.trim()}` : text.trim(),
      time: 'now', likes: 0, replies: [],
    };
    if (replyTo) {
      const addReply = (list: Comment[]): Comment[] =>
        list.map(c => c.id === replyTo.parentId
          ? { ...c, replies: [...c.replies, newComment] }
          : { ...c, replies: addReply(c.replies) }
        );
      setComments(prev => addReply(prev));
    } else {
      setComments(prev => [...prev, newComment]);
    }
    setText('');
    setReplyTo(null);
  };

  const handleReply = (parentId: number, user: string) => {
    setReplyTo({ parentId, user });
  };

  return (
    <View style={{ backgroundColor: T.card2, borderRadius: 12, padding: 10, marginBottom: 8, marginTop: 4 }}>
      {comments.length === 0 && (
        <Text style={{ fontSize: 12, color: T.mu, textAlign: 'center', paddingVertical: 6 }}>No comments yet — be the first!</Text>
      )}
      {comments.map(c => (
        <CommentRow key={c.id} comment={c} onReply={handleReply} />
      ))}
      {replyTo && (
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, paddingVertical: 4 }}>
          <Text style={{ fontSize: 11, color: T.accent }}>Replying to @{replyTo.user}</Text>
          <TouchableOpacity onPress={() => setReplyTo(null)} style={{ marginLeft: 8 }}>
            <Ionicons name="close-circle" size={14} color={T.mu} />
          </TouchableOpacity>
        </View>
      )}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
        <Avatar initials={ME.av} size={26} img={ME.img} />
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={replyTo ? `Reply to @${replyTo.user}...` : 'Add a comment...'}
          placeholderTextColor={T.mu}
          style={{ flex: 1, backgroundColor: T.bg, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 7, fontSize: 13, color: T.tx }}
        />
        <TouchableOpacity onPress={addComment} disabled={!text.trim()}>
          <Ionicons name="send" size={18} color={text.trim() ? T.accent : T.mu} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ── STORIES ── */
export function Stories({ onGoProfile, onProfile }: { onGoProfile?: () => void; onProfile?: (c: Conn) => void } = {}) {
  const all = [ME, ...CONNS.slice(0, 10)];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 14, gap: 14 }}>
      {all.map((s: any, i) => (
        <TouchableOpacity key={i === 0 ? 'me' : s.userId || i} onPress={i === 0 ? onGoProfile : () => onProfile && onProfile(s)} style={{ alignItems: 'center', gap: 6, width: 64 }}>
          <Avatar initials={s.av} size={58} ring online={i > 0 && i < 3} img={s.img} />
          <Text style={{ fontSize: 11, color: T.tx2, textAlign: 'center', fontWeight: i === 0 ? '700' : '400' }} numberOfLines={1}>{i === 0 ? 'You' : s.user}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

/* ── TIMELINE ENTRY ── */
export function TLEntry({ entry }: { entry: TimelineEntry }) {
  const c = CAT[entry.type] || CAT.modification;
  const [liked, setLiked] = useState(false);
  const [coms, setComs] = useState(entry.initComments || []);
  const [showC, setShowC] = useState(false);
  const [draft, setDraft] = useState('');
  const { openProfile } = useContext(ViewProfileContext);
  const like = () => setLiked(v => !v);
  const postCom = () => { if (!draft.trim()) return; setComs(prev => [...prev, { user: 'Jake_STI', text: draft.trim() }]); setDraft(''); };
  const tapUser = (username: string) => { const conn = CONNS.find(cc => cc.user === username); if (conn) openProfile(conn); };
  return (
    <View style={{ flexDirection: 'row', gap: 0 }}>
      <View style={{ alignItems: 'center', width: 32, paddingTop: 2 }}>
        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c.bg, borderWidth: 1.5, borderColor: c.border, alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
          <Ionicons name={TL_ICONS[entry.type] || 'ellipse'} size={IC.badge} color={c.text} />
        </View>
        <View style={{ width: 1.5, flex: 1, backgroundColor: T.bd, marginTop: 4, opacity: 0.4 }} />
      </View>
      <View style={{ flex: 1, paddingLeft: 12, paddingBottom: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <View style={{ backgroundColor: c.bg, borderWidth: 1, borderColor: c.border, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: c.text }}>{TL_LABELS[entry.type]}</Text>
          </View>
          <Text style={{ fontSize: 11, color: T.mu }}>{entry.time}</Text>
        </View>
        <View style={{ backgroundColor: T.card, borderWidth: 1, borderColor: T.bd, borderRadius: 14, overflow: 'hidden' }}>
          <View style={{ height: 2, backgroundColor: c.dot }} />
          <View style={{ padding: 12, paddingHorizontal: 14 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: T.tx, marginBottom: entry.text ? 6 : 0 }}>{entry.title}</Text>
            {entry.text ? <Text style={{ fontSize: 13, color: T.tx2, lineHeight: 20, marginBottom: 12 }}>{entry.text}</Text> : null}
            <View style={{ flexDirection: 'row', gap: 16, borderTopWidth: 1, borderTopColor: T.bd, paddingTop: 10, marginTop: 2 }}>
              <TouchableOpacity onPress={like} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Ionicons name={liked ? 'heart' : 'heart-outline'} size={IC.actionSm} color={liked ? T.accent : T.mu} />
                <Text style={{ fontSize: 13, color: liked ? T.accent : T.mu }}>{entry.likes + (liked ? 1 : 0)}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowC(v => !v)} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Ionicons name="chatbubble-outline" size={IC.actionSm} color={showC ? T.accent : T.mu} />
                <Text style={{ fontSize: 13, color: showC ? T.accent : T.mu }}>{coms.length}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Alert.alert('Share', 'Sharing coming soon')} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Ionicons name="share-outline" size={IC.actionSm} color={T.mu} />
              </TouchableOpacity>
            </View>
            {showC && (
              <View style={{ marginTop: 12 }}>
                {coms.map((cm, i) => (
                  <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                    <TouchableOpacity onPress={() => tapUser(cm.user)}>
                      <Avatar initials={cm.user.slice(0, 2)} size={24} />
                    </TouchableOpacity>
                    <View style={{ backgroundColor: T.card2, borderRadius: 10, padding: 6, paddingHorizontal: 10, flex: 1 }}>
                      <Text style={{ fontSize: 12, color: T.tx }}><Text onPress={() => tapUser(cm.user)} style={{ fontWeight: '700' }}>{cm.user} </Text>{cm.text}</Text>
                    </View>
                  </View>
                ))}
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  <Avatar initials="JS" size={24} accent />
                  <TextInput value={draft} onChangeText={setDraft} onSubmitEditing={postCom} placeholder="Add a comment..."
                    placeholderTextColor={T.mu} style={{ flex: 1, padding: 6, paddingHorizontal: 12, backgroundColor: T.card2, borderWidth: 1, borderColor: T.bd, borderRadius: 20, fontSize: 12, color: T.tx }} />
                  <TouchableOpacity onPress={postCom}><Text style={{ color: T.accent, fontSize: 12, fontWeight: '700', paddingVertical: 6 }}>Post</Text></TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

/* ── ADD TO TIMELINE ── */
function AddTL({ onAdd, onCancel }: { onAdd: (e: TimelineEntry) => void; onCancel?: () => void }) {
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState('modification');
  const [title, setTitle] = useState('');
  const [posting, setPosting] = useState(false);
  const ac = CAT[cat];
  const doPost = () => {
    if (!title.trim()) return;
    setPosting(true);
    setTimeout(() => {
      onAdd({ id: Date.now(), type: cat, time: 'Just now', title: title.trim(), text: '', likes: 0, initComments: [] });
      setTitle(''); setCat('modification'); setOpen(false); setPosting(false);
    }, 500);
  };
  if (!open) return (
    <TouchableOpacity onPress={() => setOpen(true)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 13, borderWidth: 1.5, borderStyle: 'dashed', borderColor: T.bd, borderRadius: 12, marginBottom: 16 }}>
      <Text style={{ fontSize: 18, color: T.mu }}>+</Text>
      <Text style={{ fontSize: 13, color: T.mu }}>Add to timeline</Text>
    </TouchableOpacity>
  );
  return (
    <View style={{ backgroundColor: T.card, borderWidth: 1, borderColor: T.bd, borderRadius: 16, padding: 16, marginBottom: 16 }}>
      <Text style={{ fontSize: 14, fontWeight: '600', color: T.tx, marginBottom: 14 }}>New Entry</Text>
      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {['notification', 'track', 'modification', 'event'].map(c => {
          const cc = CAT[c]; const active = cat === c;
          return (
            <TouchableOpacity key={c} onPress={() => setCat(c)} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, borderColor: active ? cc.border : T.bd, backgroundColor: active ? cc.bg : 'transparent' }}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: active ? cc.text : T.mu }}>{TL_LABELS[c]}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <TextInput value={title} onChangeText={setTitle} placeholder="What happened?" placeholderTextColor={T.mu}
        style={{ padding: 12, paddingHorizontal: 14, backgroundColor: T.card2, borderWidth: 1, borderColor: T.bd, borderRadius: 10, fontSize: 13, color: T.tx, marginBottom: 10 }} />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity onPress={() => { setOpen(false); setTitle(''); }} style={{ flex: 1, padding: 11, backgroundColor: T.card2, borderWidth: 1, borderColor: T.bd, borderRadius: 10, alignItems: 'center' }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: T.tx2 }}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={doPost} disabled={!title.trim()} style={{ flex: 2, padding: 11, backgroundColor: title.trim() ? ac.dot : T.bd, borderRadius: 10, alignItems: 'center' }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: title.trim() ? '#051210' : T.mu }}>{posting ? 'Posting...' : 'Post'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ── MODS SECTION ── */
function ModsSec({ carMods, mods: modsAlias }: { carMods?: ModsMap; mods?: ModsMap }) {
  const modData = carMods || modsAlias!;
  const [tab, setTab] = useState<keyof ModsMap>('engine');
  const [exp, setExp] = useState(false);
  const LIM = 4;
  const mods = modData[tab] || [];
  const vis = exp ? mods : mods.slice(0, LIM);
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 11, color: T.mu, fontWeight: '600', letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' }}>Modifications</Text>
      <View style={{ flexDirection: 'row', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: T.bd }}>
        {(['engine', 'wheels', 'interior', 'exterior'] as const).map(k => {
          const active = tab === k;
          return (
            <TouchableOpacity key={k} onPress={() => { setTab(k); setExp(false); }}
              style={{ flex: 1, alignItems: 'center', gap: 4, paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: active ? T.accent : 'transparent' }}>
              <ModIcon k={k} size={16} color={active ? T.accent : T.mu} />
              <Text style={{ fontSize: 9, fontWeight: '700', letterSpacing: 0.5, color: active ? T.accent : T.mu }}>{ML[k].toUpperCase()}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={{ backgroundColor: T.card, borderWidth: 1, borderColor: T.bd, borderRadius: 12, overflow: 'hidden' }}>
        {vis.map((m, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 11, paddingHorizontal: 14, borderBottomWidth: i < vis.length - 1 ? 1 : 0, borderBottomColor: T.bd }}>
            <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: T.accent }} />
            <Text style={{ fontSize: 13, color: T.tx2, lineHeight: 18 }}>{m}</Text>
          </View>
        ))}
        {mods.length > LIM && (
          <TouchableOpacity onPress={() => setExp(v => !v)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, padding: 10 }}>
            <Text style={{ fontSize: 12, color: T.accent, fontWeight: '600' }}>{exp ? 'Show less' : `Show ${mods.length - LIM} more`}</Text>
            <Ionicons name={exp ? 'chevron-up' : 'chevron-down'} size={IC.badge} color={T.accent} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

/* ── GARAGE MODAL ── */
export function GarageMod({ activeCar, visible = true, cars, onSelect, onClose }: { activeCar?: GarageCar; visible?: boolean; cars?: GarageCar[]; onSelect: (c: GarageCar) => void; onClose: () => void }) {
  if (!visible) return <></>;
  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.8)' }} onPress={onClose}>
        <Pressable style={{ backgroundColor: T.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, paddingBottom: 36 }} onPress={e => e.stopPropagation()}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: T.bd, alignSelf: 'center', marginBottom: 20, marginTop: 8 }} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: T.tx, marginBottom: 14 }}>My Garage</Text>
          {(cars || GCARS).map(car => {
            const active = activeCar?.id === car.id;
            return (
              <TouchableOpacity key={car.id} onPress={() => { onSelect(car); onClose(); }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, marginBottom: 8, backgroundColor: active ? 'rgba(0,201,167,0.06)' : T.card2, borderWidth: 1, borderColor: active ? T.accent : T.bd }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: T.tx }}>{car.name}</Text>
                  <Text style={{ fontSize: 12, color: T.mu, marginTop: 2 }}>{car.mods.engine[0]}</Text>
                </View>
                {active && <Ionicons name="checkmark-circle" size={IC.actionSm} color={T.accent} />}
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity onPress={onClose} style={{ padding: 13, backgroundColor: T.card2, borderWidth: 1, borderColor: T.bd, borderRadius: 12, alignItems: 'center', marginTop: 8 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: T.tx2 }}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ── DISCOVER ── */
function Discover({ onProfile }: { onProfile?: (u: any) => void } = {}) {
  const [conn, setConn] = useState<Record<number, boolean>>({});
  const [idx, setIdx] = useState(0);
  const snap = () => setIdx(i => (i + 1) % DISC.length);
  const cards = [0, 1, 2].map(i => DISC[(idx + i) % DISC.length]);
  return (
    <View style={{ marginBottom: 22 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: T.tx }}>Discover</Text>
        <View style={{ flexDirection: 'row', gap: 3 }}>
          {[0, 1, 2, 3, 4].map(i => (
            <View key={i} style={{ width: i === idx % 5 ? 16 : 5, height: 4, borderRadius: 2, backgroundColor: i === idx % 5 ? T.accent : T.bd }} />
          ))}
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {cards.map(p => {
          const isCon = !!conn[p.id];
          const c = CONNS.find(cn => cn.user === p.user);
          return (
            <TouchableOpacity key={p.id} onPress={() => onProfile && c ? onProfile(c) : snap()} style={{ flex: 1, backgroundColor: T.card, borderWidth: 1, borderColor: isCon ? T.accent : T.bd, borderRadius: 14 }}>
              <View style={{ padding: 14, paddingBottom: 12, alignItems: 'center' }}>
                <Avatar initials={p.av} size={40} ring img={p.img} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: T.tx, textAlign: 'center', marginTop: 8, marginBottom: 10 }} numberOfLines={1}>{p.user}</Text>
                <TouchableOpacity onPress={() => setConn(cn => ({ ...cn, [p.id]: !cn[p.id] }))}
                  style={{ width: '100%', padding: 6, backgroundColor: isCon ? 'rgba(0,201,167,0.1)' : 'transparent', borderWidth: 1.5, borderColor: T.accent, borderRadius: 8, alignItems: 'center' }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: T.accent }}>{isCon ? 'Following' : 'Follow'}</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}


/* ── CAMERA ── */
export function CameraScreen() {
  const [posted, setPosted] = useState(false);
  const [cap, setCap] = useState('');
  const [hasPhoto, setHasPhoto] = useState(false);
  const post = () => { setPosted(true); setTimeout(() => { setHasPhoto(false); setCap(''); setPosted(false); }, 2200); };
  if (posted) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 14 }}>
      <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(0,201,167,0.1)', borderWidth: 2, borderColor: T.accent, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="checkmark" size={IC.hero} color={T.accent} />
      </View>
      <Text style={{ fontSize: 18, fontWeight: '700', color: T.tx }}>Posted!</Text>
      <Text style={{ fontSize: 13, color: T.mu }}>Your photo has been shared</Text>
    </View>
  );
  if (hasPhoto) return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <View style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 14, height: 280, backgroundColor: '#1a2535', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="car-sport" size={80} color={T.wh} style={{ opacity: 0.3 }} />
        <TouchableOpacity onPress={() => setHasPhoto(false)} style={{ position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="close" size={IC.inline} color={T.wh} />
        </TouchableOpacity>
      </View>
      <TextInput value={cap} onChangeText={setCap} placeholder="Write a caption..." placeholderTextColor={T.mu} multiline numberOfLines={3}
        style={{ padding: 13, paddingHorizontal: 14, backgroundColor: T.card, borderWidth: 1, borderColor: T.bd, borderRadius: 12, fontSize: 13, color: T.tx, marginBottom: 12, minHeight: 80, textAlignVertical: 'top' }} />
      <TouchableOpacity onPress={post} style={{ padding: 13, backgroundColor: T.accent, borderRadius: 12, alignItems: 'center' }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#051210' }}>Share</Text>
      </TouchableOpacity>
    </ScrollView>
  );
  return (
    <View style={{ padding: 16, paddingTop: 24 }}>
      <Text style={{ fontSize: 17, fontWeight: '700', color: T.tx, marginBottom: 20 }}>New Post</Text>
      <View style={{ width: '100%', aspectRatio: 4 / 3, backgroundColor: T.card, borderWidth: 1.5, borderStyle: 'dashed', borderColor: T.bd, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(0,201,167,0.08)', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="camera" size={IC.hero} color={T.accent} />
        </View>
        <Text style={{ fontSize: 15, fontWeight: '600', color: T.tx }}>Add a Photo</Text>
        <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 20 }}>
          <TouchableOpacity onPress={() => { Alert.alert('Camera', 'Camera access requires react-native-image-picker. Simulating photo capture.'); setHasPhoto(true); }}
            style={{ flex: 1, padding: 12, backgroundColor: T.accent, borderRadius: 12, alignItems: 'center', gap: 4 }}>
            <Ionicons name="camera" size={IC.action} color={T.wh} />
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#051210' }}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setHasPhoto(true); }}
            style={{ flex: 1, padding: 12, backgroundColor: T.card2, borderWidth: 1, borderColor: T.bd, borderRadius: 12, alignItems: 'center', gap: 4 }}>
            <Ionicons name="image-outline" size={IC.action} color={T.mu} />
            <Text style={{ fontSize: 12, fontWeight: '700', color: T.tx }}>Upload</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

/* ── SUB PAGE ── */
export function SubPage({ title, onBack, children }: { title: string; onBack: () => void; children: React.ReactNode }) {
  return (
    <View style={StyleSheet.absoluteFillObject} >
      <View style={{ flex: 1, backgroundColor: T.bg, zIndex: 30 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, paddingHorizontal: 16, backgroundColor: T.bg, borderBottomWidth: 1, borderBottomColor: T.bd }}>
          <TouchableOpacity onPress={onBack} style={{ backgroundColor: T.card2, borderWidth: 1, borderColor: T.bd, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 }}>
            <Ionicons name="chevron-back" size={IC.back} color={T.tx} />
          </TouchableOpacity>
          <Text style={{ fontSize: 16, fontWeight: '700', color: T.tx, flex: 1, textAlign: 'center', marginRight: 44 }}>{title}</Text>
        </View>
        <ScrollView style={{ flex: 1 }}>{children}</ScrollView>
      </View>
    </View>
  );
}



/* ═══════════════════════════════════════════════════════════
   CHUNK 8 — MAIN TABS, DRAWER, ROOT APP
   ═══════════════════════════════════════════════════════════ */

/* ── Notification Screen (Full Window) ── */
export function NotifDrop({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  if (!visible) return <></>;
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: T.bd }}>
          <TouchableOpacity onPress={onClose} style={{ marginRight: 12 }}>
            <Ionicons name="chevron-back" size={IC.back} color={T.ac} />
          </TouchableOpacity>
          <Text style={{ color: T.tx, fontSize: 20, fontWeight: '700', flex: 1 }}>Notifications</Text>
        </View>
        <ScrollView style={{ flex: 1 }}>
          {NOTIFS.map((n, i) => (
            <View key={i} style={{ flexDirection: 'row', padding: 14, borderBottomWidth: 1, borderBottomColor: T.bd, backgroundColor: n.unread ? 'rgba(0,201,167,0.06)' : 'transparent' }}>
              <Avatar name={n.user} size={44} img={n.img} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: T.tx, fontSize: 14 }}>
                  <Text style={{ fontWeight: '700' }}>{n.user}</Text> {n.action}
                </Text>
                <Text style={{ color: T.mu, fontSize: 12, marginTop: 3 }}>{n.time}</Text>
              </View>
              {n.unread && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: T.ac, marginTop: 6 }} />}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}



/* ── Create Post Composer ── */
export function CreatePostBar({ onPost }: { onPost: (text: string, imageUri?: string) => void }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [text, setText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);

  const handlePost = () => {
    if (!text.trim() && !attachedImage) return;
    onPost(text.trim(), attachedImage || undefined);
    setText('');
    setAttachedImage(null);
    setModalOpen(false);
  };

  const pickImage = () => {
    // Placeholder: in production would use image picker library
    setAttachedImage('https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=400&fit=crop');
  };

  return (
    <>
      <TouchableOpacity onPress={() => setModalOpen(true)} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', padding: 12, paddingHorizontal: 14, backgroundColor: T.card, borderBottomWidth: 1, borderBottomColor: T.bd }}>
        <Avatar initials={ME.av} size={36} ring img={ME.img} />
        <View style={{ flex: 1, marginLeft: 10, backgroundColor: '#1A1A1A', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9 }}>
          <Text style={{ fontSize: 14, color: T.mu }}>What's on your mind?</Text>
        </View>
        <TouchableOpacity onPress={() => setModalOpen(true)} style={{ marginLeft: 10 }}>
          <Ionicons name="image-outline" size={22} color={T.accent} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setModalOpen(true)} style={{ marginLeft: 10 }}>
          <Ionicons name="videocam-outline" size={22} color={T.accent} />
        </TouchableOpacity>
      </TouchableOpacity>

      <Modal visible={modalOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalOpen(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: T.bd }}>
            <TouchableOpacity onPress={() => { setModalOpen(false); setText(''); setAttachedImage(null); }}>
              <Ionicons name="close" size={26} color={T.tx} />
            </TouchableOpacity>
            <Text style={{ flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: T.tx }}>Create Post</Text>
            <TouchableOpacity onPress={handlePost} style={{ backgroundColor: text.trim() || attachedImage ? T.accent : T.card2, paddingHorizontal: 16, paddingVertical: 7, borderRadius: 18 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: text.trim() || attachedImage ? '#051210' : T.mu }}>Post</Text>
            </TouchableOpacity>
          </View>

          {/* User info row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 }}>
            <Avatar initials={ME.av} size={40} ring img={ME.img} />
            <View>
              <Text style={{ fontSize: 15, fontWeight: '600', color: T.tx }}>{ME.user}</Text>
              <Text style={{ fontSize: 12, color: T.mu }}>{ME.car}</Text>
            </View>
          </View>

          {/* Text input */}
          <TextInput
            placeholder="What's on your mind?"
            placeholderTextColor={T.mu}
            multiline
            autoFocus
            value={text}
            onChangeText={setText}
            style={{ flex: 1, padding: 14, paddingTop: 0, fontSize: 16, color: T.tx, textAlignVertical: 'top' }}
          />

          {/* Attached image preview */}
          {attachedImage && (
            <View style={{ marginHorizontal: 14, marginBottom: 10, borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
              <Image source={{ uri: attachedImage }} style={{ width: '100%', height: 200 }} resizeMode="cover" />
              <TouchableOpacity onPress={() => setAttachedImage(null)} style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="close" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          {/* Bottom action bar */}
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, paddingHorizontal: 14, borderTopWidth: 1, borderTopColor: T.bd, gap: 20 }}>
            <TouchableOpacity onPress={pickImage} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="image-outline" size={22} color={T.accent} />
              <Text style={{ fontSize: 13, color: T.tx2 }}>Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={pickImage} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="videocam-outline" size={22} color={T.accent} />
              <Text style={{ fontSize: 13, color: T.tx2 }}>Video</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="location-outline" size={22} color={T.accent} />
              <Text style={{ fontSize: 13, color: T.tx2 }}>Location</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

/* ── CHALLENGE DETAIL SCREEN ── */
function ChallengeDetailScreen({ challenge, onBack }: { challenge: Challenge; onBack: () => void }) {
  const [entries, setEntries] = useState(challenge.entries);
  const [submitted, setSubmitted] = useState(false);
  const toggleVote = (id: string) => setEntries(prev => prev.map(e => e.id === id ? { ...e, votes: e.voted ? e.votes - 1 : e.votes + 1, voted: !e.voted } : e));
  const sorted = [...entries].sort((a, b) => b.votes - a.votes);
  const winnerId = sorted[0]?.id ?? null;
  return (
    <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: T.bg, zIndex: 50 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: T.bd }}>
        <TouchableOpacity onPress={onBack} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={IC.nav} color={T.wh} />
        </TouchableOpacity>
        <Text style={{ flex: 1, fontSize: 17, fontWeight: '700', color: T.wh, marginLeft: 12 }}>{challenge.title}</Text>
        <View style={{ backgroundColor: challenge.active ? T.accentDim : 'rgba(255,255,255,0.08)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: challenge.active ? T.accent : T.mu }}>{challenge.endDate}</Text>
        </View>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
          <Text style={{ fontSize: 13, color: T.tx2, lineHeight: 19, marginBottom: 12 }}>{challenge.desc}</Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: T.tx2, marginBottom: 12 }}>{sorted.length} Entries</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {sorted.map((entry) => {
            const isWinner = entry.id === winnerId;
            return (
              <View key={entry.id} style={{ width: (SCREEN_W - 42) / 2, backgroundColor: T.card, borderWidth: isWinner ? 2 : 1, borderColor: isWinner ? '#FBBF24' : T.bd, borderRadius: 14, overflow: 'hidden' }}>
                <View style={{ width: '100%', height: 130, backgroundColor: T.card2 }}>
                  <Image source={{ uri: entry.img }} style={{ width: '100%', height: 130 }} resizeMode="cover" />
                </View>
                {isWinner && (
                  <View style={{ position: 'absolute', top: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(251,191,36,0.2)', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Ionicons name="trophy" size={12} color="#FBBF24" />
                    <Text style={{ fontSize: 9, fontWeight: '700', color: '#FBBF24' }}>WINNER</Text>
                  </View>
                )}
                <View style={{ padding: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Avatar initials={entry.av} size={24} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, fontWeight: '600', color: T.tx }} numberOfLines={1}>{entry.user}</Text>
                      <Text style={{ fontSize: 9, color: T.mu }}>{entry.car}</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => challenge.active && toggleVote(entry.id)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 6, backgroundColor: entry.voted ? 'rgba(0,201,167,0.12)' : 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: entry.voted ? T.accent : T.bd, borderRadius: 8 }}>
                    <Ionicons name={entry.voted ? 'heart' : 'heart-outline'} size={14} color={entry.voted ? T.accent : T.mu} />
                    <Text style={{ fontSize: 12, fontWeight: '600', color: entry.voted ? T.accent : T.tx2 }}>{entry.votes}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
        {challenge.active && !submitted && (
          <TouchableOpacity onPress={() => setSubmitted(true)} style={{ marginTop: 20, padding: 14, backgroundColor: T.accent, borderRadius: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#051210' }}>Submit My Entry</Text>
          </TouchableOpacity>
        )}
        {submitted && (
          <View style={{ marginTop: 20, padding: 14, backgroundColor: T.accentDim, borderRadius: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: T.accent }}>Entry Submitted!</Text>
          </View>
        )}
        </View>
      </ScrollView>
    </View>
  );
}

/* ── CHALLENGES SECTION ── */
export function ChallengesSection() {
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  return (
    <>
      <View style={{ paddingHorizontal: 16, marginTop: 4, marginBottom: 14 }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: T.tx, marginBottom: 10 }}>Photo Challenges</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
          {CHALLENGES.map(ch => {
            const daysMatch = ch.endDate.match(/(\d+)\s*day/);
            const days = daysMatch ? parseInt(daysMatch[1], 10) : null;
            const urgent = ch.active && days !== null && days <= 3;
            const accentColor = !ch.active ? T.mu : urgent ? '#FBBF24' : '#60A5FA';
            const borderColor = !ch.active ? '#1E1E1E' : urgent ? 'rgba(251,191,36,0.4)' : 'rgba(96,165,250,0.3)';
            return (
              <TouchableOpacity key={ch.id} onPress={() => setActiveChallenge(ch)} style={{ width: 160, backgroundColor: '#141414', borderWidth: 1, borderColor, borderRadius: 14, padding: 12 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: T.tx, marginBottom: 6 }} numberOfLines={1}>{ch.title}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 10, color: T.mu }}>{ch.entries.length} entries</Text>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: accentColor }}>{ch.endDate}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      {activeChallenge && <ChallengeDetailScreen key={activeChallenge.id} challenge={activeChallenge} onBack={() => setActiveChallenge(null)} />}
    </>
  );
}


/* ── GALLERY VIEWER (full-screen with swipe + pinch zoom) ── */
function GalleryViewer({ photos, initialIndex, onClose }: { photos: GalleryPhoto[]; initialIndex: number; onClose: () => void }) {
  const scrollRef = useRef<ScrollView>(null);
  const [idx, setIdx] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const lastScale = useRef(1);

  useEffect(() => {
    scrollRef.current?.scrollTo({ x: initialIndex * SCREEN_W, animated: false });
  }, []);

  const resetZoom = () => {
    lastScale.current = 1;
    setZoomed(false);
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
    ]).start();
  };

  const handleDoubleTap = (() => {
    let lastTap = 0;
    return () => {
      const now = Date.now();
      if (now - lastTap < 300) {
        if (zoomed) {
          resetZoom();
        } else {
          lastScale.current = 2.5;
          setZoomed(true);
          Animated.spring(scale, { toValue: 2.5, useNativeDriver: true }).start();
        }
      }
      lastTap = now;
    };
  })();

  const onScroll = (e: any) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    if (page !== idx) {
      setIdx(page);
      resetZoom();
    }
  };

  return (
    <Modal visible animationType="fade" statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScroll}
          scrollEnabled={!zoomed}
        >
          {photos.map((p, i) => (
            <Pressable key={p.id} onPress={handleDoubleTap} style={{ width: SCREEN_W, flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Animated.View style={{ transform: [{ scale }, { translateX }, { translateY }] }}>
                <Image source={{ uri: p.url.replace('w=600&h=600', 'w=1200&h=1200') }} style={{ width: SCREEN_W, height: SCREEN_W }} resizeMode="contain" />
              </Animated.View>
            </Pressable>
          ))}
        </ScrollView>
        {/* Close button */}
        <TouchableOpacity onPress={onClose} style={{ position: 'absolute', top: 54, right: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="close" size={20} color="#fff" />
        </TouchableOpacity>
        {/* Page indicator */}
        {photos.length > 1 && (
          <View style={{ position: 'absolute', bottom: 40, alignSelf: 'center' }}>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600' }}>{idx + 1} / {photos.length}</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

/* ── FULL GALLERY SCREEN (3-col grid, opened from "+" tile) ── */
function FullGalleryScreen({ photos, onClose }: { photos: GalleryPhoto[]; onClose: () => void }) {
  const [viewerIdx, setViewerIdx] = useState<number | null>(null);
  const GAP = 2;
  const tileSize = (SCREEN_W - GAP * 2) / 3;
  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: T.bd }}>
          <TouchableOpacity onPress={onClose} style={{ marginRight: 12 }}>
            <Ionicons name="chevron-back" size={IC.back} color={T.ac} />
          </TouchableOpacity>
          <Text style={{ color: T.tx, fontSize: 18, fontWeight: '700', flex: 1 }}>Gallery</Text>
          <Text style={{ color: T.mu, fontSize: 13 }}>{photos.length} photos</Text>
        </View>
        <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: GAP }}>
          {photos.map((p, i) => (
            <TouchableOpacity key={p.id} onPress={() => setViewerIdx(i)}>
              <Image source={{ uri: p.url }} style={{ width: tileSize, height: tileSize }} resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </ScrollView>
        {viewerIdx !== null && (
          <GalleryViewer photos={photos} initialIndex={viewerIdx} onClose={() => setViewerIdx(null)} />
        )}
      </SafeAreaView>
    </Modal>
  );
}

/* ── COMPACT PHOTO GALLERY (horizontal row under bio) ── */
const GALLERY_TILE = 64;
const GALLERY_GAP = 6;
/** Check if a photo's car tag matches the user's car model (fuzzy, case-insensitive) */
function carMatchesModel(photoCar: string, userCar: string): boolean {
  const p = photoCar.toLowerCase().replace(/[^a-z0-9]/g, '');
  const u = userCar.toLowerCase().replace(/[^a-z0-9]/g, '');
  return u.includes(p) || p.includes(u);
}
export function PhotoGallery({ photos, carModel }: { photos: GalleryPhoto[]; carModel: string }) {
  const [viewerIdx, setViewerIdx] = useState<number | null>(null);
  const [fullOpen, setFullOpen] = useState(false);
  // Filter photos to only show those matching the user's car model
  const filtered = carModel ? photos.filter(p => carMatchesModel(p.car, carModel)) : photos;
  if (!filtered || filtered.length === 0) return null;

  const MAX_VISIBLE = 6;
  const hasMore = filtered.length > MAX_VISIBLE;
  const visible = hasMore ? filtered.slice(0, MAX_VISIBLE - 1) : filtered;
  const remaining = filtered.length - (MAX_VISIBLE - 1);

  return (
    <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: GALLERY_GAP }}>
        {visible.map((p, i) => (
          <TouchableOpacity key={p.id} onPress={() => setViewerIdx(i)} activeOpacity={0.8}>
            <Image source={{ uri: p.url }} style={{ width: GALLERY_TILE, height: GALLERY_TILE, borderRadius: 6 }} resizeMode="cover" />
          </TouchableOpacity>
        ))}
        {hasMore && (
          <TouchableOpacity onPress={() => setFullOpen(true)} activeOpacity={0.8} style={{ width: GALLERY_TILE, height: GALLERY_TILE, borderRadius: 6, overflow: 'hidden' }}>
            <Image source={{ uri: filtered[MAX_VISIBLE - 1].url }} style={{ width: GALLERY_TILE, height: GALLERY_TILE }} resizeMode="cover" />
            <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>+{remaining}</Text>
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>
      {viewerIdx !== null && (
        <GalleryViewer photos={filtered} initialIndex={viewerIdx} onClose={() => setViewerIdx(null)} />
      )}
      {fullOpen && (
        <FullGalleryScreen photos={filtered} onClose={() => setFullOpen(false)} />
      )}
    </View>
  );
}

/* ── COLLAPSIBLE MODS LIST ── */
export function ModsCollapsible({ mods }: { mods: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const LIMIT = 3;
  const visible = expanded ? mods : mods.slice(0, LIMIT);
  return (
    <View style={{ marginTop: 12 }}>
      {visible.map((m, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 }}>
          <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: T.accent }} />
          <Text style={{ fontSize: 13, color: T.wh }}>{m}</Text>
        </View>
      ))}
      {mods.length > LIMIT && (
        <TouchableOpacity onPress={() => setExpanded(v => !v)} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 8 }}>
          <Text style={{ fontSize: 12, color: T.accent, fontWeight: '600' }}>{expanded ? 'Show less' : `Show ${mods.length - LIMIT} more`}</Text>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={IC.badge} color={T.accent} />
        </TouchableOpacity>
      )}
    </View>
  );
}

/* ── Floating Year Picker ── */
export function FloatingYearPicker({ years, selected, onSelect }: { years: number[]; selected: number; onSelect: (y: number) => void }) {
  const [expanded, setExpanded] = useState(false);
  const animVal = useRef(new Animated.Value(0)).current;

  const toggle = useCallback(() => {
    const toOpen = !expanded;
    setExpanded(toOpen);
    Animated.spring(animVal, { toValue: toOpen ? 1 : 0, useNativeDriver: true, tension: 80, friction: 12 }).start();
  }, [expanded, animVal]);

  const selectYear = (y: number) => {
    onSelect(y);
    setExpanded(false);
    Animated.spring(animVal, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }).start();
  };

  const sorted = [...years].sort((a, b) => b - a);

  return (
    <View style={{ position: 'absolute', right: 12, top: 8, zIndex: 50, alignItems: 'flex-end' }}>
      {/* Collapsed pill */}
      {!expanded && (
        <TouchableOpacity onPress={toggle} activeOpacity={0.8} style={{ backgroundColor: '#0F0F0F', borderWidth: 1, borderColor: '#00C9A7', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 8 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#00C9A7' }}>{selected}</Text>
        </TouchableOpacity>
      )}
      {/* Expanded picker */}
      {expanded && (
        <Animated.View style={{ backgroundColor: '#0F0F0F', borderWidth: 1, borderColor: '#00C9A7', borderRadius: 16, paddingVertical: 6, paddingHorizontal: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 12, opacity: animVal, transform: [{ scale: animVal.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }] }}>
          {sorted.map(y => (
            <TouchableOpacity key={y} onPress={() => selectYear(y)} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, backgroundColor: y === selected ? 'rgba(0,209,193,0.12)' : 'transparent' }}>
              <Text style={{ fontSize: 13, fontWeight: y === selected ? '700' : '500', color: y === selected ? '#00C9A7' : '#888' }}>{y}</Text>
            </TouchableOpacity>
          ))}
          <View style={{ height: 1, backgroundColor: '#222', marginVertical: 4, marginHorizontal: 8 }} />
          <TouchableOpacity onPress={toggle} style={{ paddingHorizontal: 16, paddingVertical: 6, alignItems: 'center' }}>
            <Ionicons name="close" size={14} color="#C9D1D9" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

/* ── Profile Posts Tab (3-col photo grid) ── */
export function ProfilePostsTab({ photos }: { photos: string[] }) {
  const [viewerIdx, setViewerIdx] = useState<number | null>(null);
  const GAP = 2;
  const tileSize = (SCREEN_W - GAP * 2) / 3;

  const galleryPhotos: GalleryPhoto[] = photos.map((url, i) => ({ id: `pp_${i}`, url, car: '' }));

  return (
    <View style={{ flex: 1, backgroundColor: '#0D1117' }}>
      <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: GAP }}>
        {photos.map((url, i) => (
          <TouchableOpacity key={i} onPress={() => setViewerIdx(i)} activeOpacity={0.85}>
            <Image source={{ uri: url }} style={{ width: tileSize, height: tileSize }} resizeMode="cover" />
          </TouchableOpacity>
        ))}
      </ScrollView>
      {viewerIdx !== null && (
        <GalleryViewer photos={galleryPhotos} initialIndex={viewerIdx} onClose={() => setViewerIdx(null)} />
      )}
    </View>
  );
}

/* ── Profile Videos Tab (3-col grid with play overlay) ── */
export function ProfileVideosTab({ videos }: { videos: { thumbnail: string; video: string }[] }) {
  const [viewerIdx, setViewerIdx] = useState<number | null>(null);
  const GAP = 2;
  const tileSize = (SCREEN_W - GAP * 2) / 3;

  return (
    <View style={{ flex: 1, backgroundColor: '#0D1117' }}>
      <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: GAP }}>
        {videos.map((v, i) => (
          <TouchableOpacity key={i} onPress={() => setViewerIdx(i)} activeOpacity={0.85} style={{ width: tileSize, height: tileSize }}>
            <Image source={{ uri: v.thumbnail }} style={{ width: tileSize, height: tileSize, opacity: 0.85 }} resizeMode="cover" />
            <View style={{ ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="play" size={18} color="#FFFFFF" style={{ marginLeft: 2 }} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Video viewer modal */}
      {viewerIdx !== null && (
        <Modal visible animationType="fade" statusBarTranslucent>
          <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
            <Image source={{ uri: videos[viewerIdx].thumbnail }} style={{ width: SCREEN_W, height: SCREEN_W }} resizeMode="contain" />
            <View style={{ ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(0,209,193,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#00C9A7' }}>
                <Ionicons name="play" size={28} color="#00C9A7" style={{ marginLeft: 3 }} />
              </View>
              <Text style={{ color: '#C9D1D9', fontSize: 12, marginTop: 12 }}>Video playback coming soon</Text>
            </View>
            <TouchableOpacity onPress={() => setViewerIdx(null)} style={{ position: 'absolute', top: 54, right: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </View>
  );
}





/* ── Root App ── */
export default function App() {
  return <AppNavigator />;
}
