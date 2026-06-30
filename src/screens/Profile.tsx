import React, { useState, useContext, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Share,
  Alert,
  ScrollView,
  Modal,
  SafeAreaView,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { GridTileSkeleton } from '../components/Skeleton';
import { FadeInImage } from '../ui/FadeInImage';
import { AnimatedCount } from '../ui/AnimatedCount';
import { PressableScale } from '../ui/PressableScale';
import { Button } from '../ui/Button';
import { BuildCard, buildUrl } from '../components/BuildCard';
import { BannerFade } from '../components/BannerFade';
import { captureRef } from 'react-native-view-shot';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Contexts
import { ViewProfileContext } from '../context/ViewProfileContext';
import { SearchPrefillContext } from '../navigation/SearchPrefillContext';

// Data
import { CONNS, ME, categorizeMods } from '../data/users';
import { useCars, useCarMods, bucketMods, usePostsByCar, useProfilePosts, useProfileIdByUsername } from '../hooks/useProfileData';
import { useMeProfile } from '../hooks/useMeProfile';
import { ModsList } from '../components/ModsList';
import type { TimelineEntry, TimelineCategory } from '../types/database';

// Map Supabase post.type → UI TimelineCategory (the existing TimelineItem only knows
// these 4 buckets — media/milestone fold into notification).
const POST_TYPE_TO_CATEGORY: Record<string, TimelineCategory> = {
  modification: 'modification',
  track_day:    'track',
  event:        'event',
  media:        'notification',
  milestone:    'notification',
};
import { DEMO_USERS } from '../data/demoUsers';
import { USER_PROFILES } from '../data/userProfiles';
import { GCARS } from '../data/mockData';

// Components
import { Avatar } from '../components/Avatar';
import { FloatingYearPicker } from '../components/FloatingYearPicker';
import { ModsCollapsible } from '../components/ModsCollapsible';
import { TimelineList } from '../components/Timeline/TimelineList';
import { GalleryItem } from '../social/components/GalleryItem';
import { ProfilePostsTab } from '../components/ProfilePostsTab';
import { ProfileVideosTab } from '../components/ProfileVideosTab';
import { GarageMod } from '../components/GarageMod';
import { TimelineModal } from '../components/Timeline/TimelineModal';
import { PostsPage, ConnectedPage, ConnectionsPage } from './Profile/SubPages';
import { PostDetailScreen } from './PostDetailScreen';
import { SaveToSheet } from './Saved/SaveToSheet';

// Hooks
import { usePostInteractions } from '../social/hooks/usePostInteractions';
import { useCollections } from '../social/hooks/useCollections';

// Theme
import { T, IC } from '../constants/theme';

// Constants
const AVATAR_SZ = 100;
const BANNER_H = 165; // 25% shorter than the 220 redesign height

export function ProfileScreen() {
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  
  const { openProfile, viewedUser } = useContext(ViewProfileContext);
  const { goToSearch } = useContext(SearchPrefillContext);

  const isMe = !viewedUser;

  // 1️⃣ Determine Conn (guard against null / partial objects coming from search)
  const conn = (isMe
    ? CONNS.find((c) => c.userId === ME.id) || CONNS[0]
    : viewedUser) || {};

  // Resolve a username from whichever field the caller supplied.
  const connUsername = conn.user || conn.username || 'user';

  // 2️⃣ DEMO USER
  const demoUser = DEMO_USERS.find((u) => u.id === conn.userId);

  // 3️⃣ Optional override
  const profileOverride = USER_PROFILES[connUsername];

  // 4️⃣ Unified profile object
  const profileUser = {
    id: conn.userId,
    username: connUsername,
    avatar: conn.img || demoUser?.avatar || '',
    car: demoUser?.car || { make: '', model: '', year: '', image: '' },
    carImage: demoUser?.car.image || conn.carImg || '',
    bio:
      profileOverride?.bio ||
      demoUser?.bio ||
      'Car enthusiast. Modified community member.',
    followers: conn.followers,
    following: conn.following,
    posts: profileOverride?.posts || demoUser?.photos.length || 0,
    photos: demoUser?.photos || [],
    videos: demoUser?.videos || [],
    timeline: profileOverride?.timeline || demoUser?.timeline || [],
    mods: profileOverride?.mods || categorizeMods(demoUser?.car?.mods),
    gallery: profileOverride?.gallery || [],
    color: conn.color || '#1a1a1a',
  };

  // 5️⃣ Active car — resolve the REAL Supabase profile.id.
  //    isMe → use the first seeded profile (no auth-yet)
  //    viewing someone → lookup by username
  const { data: me } = useMeProfile();
  const { data: lookupId } = useProfileIdByUsername(isMe ? null : profileUser.username);
  const realProfileId = isMe ? me?.id ?? null : lookupId ?? null;
  const { data: supaCars } = useCars(realProfileId);
  useEffect(() => {
    if (supaCars && supaCars.length > 0 && !selectedCarId) {
      setSelectedCarId(supaCars[0].id);
    }
  }, [supaCars, selectedCarId]);
  const { data: supaMods } = useCarMods(selectedCarId);

  const selectedSupaCar = supaCars?.find((c) => c.id === selectedCarId) ?? null;
  const [activeCar, setActiveCar] = useState({
    name: `${profileUser.car.year} ${profileUser.car.make} ${profileUser.car.model}`,
    image: profileUser.carImage,
    mods: profileUser.mods,
    color: profileUser.color,
  });
  useEffect(() => {
    if (selectedSupaCar) {
      setActiveCar({
        name: `${selectedSupaCar.year ?? ''} ${selectedSupaCar.make} ${selectedSupaCar.model}`.trim(),
        image: selectedSupaCar.primary_image_url ?? activeCar.image,
        mods: supaMods ? bucketMods(supaMods) : activeCar.mods,
        color: profileUser.color,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSupaCar, supaMods]);

  const switchCar = (car) => {
    setActiveCar({
      name: `${car.year} ${car.make} ${car.model}`,
      image: car.image,
      mods: profileUser.mods,
      color: profileUser.color,
    });
  };

  // ⭐ Tabs
  const [activeTab, setActiveTab] = useState<'hero' | 'posts' | 'videos' | 'garage'>(
    'hero',
  );

  // ⭐ Mod tab
  const modKeys = ['engine', 'wheels', 'interior', 'exterior'];
  const [modTab, setModTab] = useState('engine');

  // ⭐ Timeline year
  const allYears = useMemo(() => {
    const years = profileUser.timeline.map((t) => t.year);
    return [...new Set(years)].sort((a, b) => b - a);
  }, [profileUser.timeline]);

  const [selectedYear, setSelectedYear] = useState(allYears[0] || null);

  // Supabase posts for the selected car → TimelineEntry shape the existing TimelineList renders.
  const { data: supaCarPosts } = usePostsByCar(selectedCarId);
  const supaTimeline = useMemo<TimelineEntry[]>(() => {
    if (!supaCarPosts || supaCarPosts.length === 0) return [];
    return supaCarPosts.map((p) => ({
      id: p.id,
      userId: profileUser.id ?? '',
      category: POST_TYPE_TO_CATEGORY[p.type] ?? 'notification',
      title: p.title ?? '',
      description: p.body ?? '',
      imageUrl: p.post_media[0]?.media_url ?? null,
      likeCount: p.like_count,
      commentCount: p.comment_count,
      createdAt: p.created_at,
    }));
  }, [supaCarPosts, profileUser.id]);

  const filteredTimeline = useMemo(() => {
    // Prefer real Supabase posts when available; fall back to demo timeline filtered by year.
    if (supaTimeline.length > 0) return supaTimeline;
    return profileUser.timeline.filter((t) => t.year === selectedYear);
  }, [supaTimeline, profileUser.timeline, selectedYear]);

  // Profile-wide posts → 3-col photo grid in the Photos tab.
  const { data: supaProfilePosts, loading: profilePostsLoading, refresh: refreshProfilePosts } = useProfilePosts(realProfileId ?? null);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    try { refreshProfilePosts(); } finally { setRefreshing(false); }
  };
  const photoGrid = useMemo(() => {
    if (!supaProfilePosts) return [];
    return supaProfilePosts
      .map((p) => ({
        id: p.id,
        url: p.post_media[0]?.media_url ?? null,
        likeCount: p.like_count,
        commentCount: p.comment_count,
        caption: [p.title, p.body].filter(Boolean).join(' — '),
      }))
      .filter((p) => !!p.url);
  }, [supaProfilePosts]);

  // ⭐ Modals
  const [addTLOpen, setAddTLOpen] = useState(false);

  // ⭐ Subpages
  const [subPage, setSubPage] = useState<
    null | 'posts' | 'connected' | 'connections'
  >(null);

  // ⭐ Social + Collections
  const currentUser = useMemo(
    () => ({ id: 'me', username: ME.user, avatarUrl: ME.img || '' }),
    [],
  );
  const initialSocialPosts = useMemo(() => [], []);
  const social = usePostInteractions(initialSocialPosts as any, currentUser);
  const collections = useCollections();

  // ⭐ Post detail
  const [openPostId, setOpenPostId] = useState<string | null>(null);
  const openPost = openPostId
    ? social.posts.find((p) => p.id === openPostId)
    : null;

  // ⭐ Save sheet
  const [savePostId, setSavePostId] = useState<string | null>(null);

  // ⭐ Timeline actions
  const deleteEntry = (id: string) => {
    // local-only delete
  };

  const createEntry = async (entry: any) => {
    // local-only add
  };

  // ⭐ Share build — captures the on-screen spec card to a PNG and opens the
  // native share sheet with the IMAGE (IG story, Messages, Save…). Falls back
  // to a link share if capture fails.
  const buildCardRef = useRef<View>(null);
  const [capturing, setCapturing] = useState(false);
  const shareBuild = async (car: typeof selectedSupaCar) => {
    if (!car) return;
    const link = buildUrl(car.id);
    const message = `Check out my ${car.year ?? ''} ${car.make} ${car.model} build on MODIFIED — ${link}`;
    try {
      setCapturing(true);
      // Give remote hero + QR a tick to be fully painted before snapshot.
      await new Promise((r) => setTimeout(r, 350));
      const uri = await captureRef(buildCardRef, { format: 'png', quality: 1 });
      await Share.share({ url: uri, message });
    } catch (_) {
      try { await Share.share({ url: link, message }); } catch (__) {}
    } finally {
      setCapturing(false);
    }
  };

  // Banner parallax — zoom on pull-down, half-speed drift on scroll-up.
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  const bannerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [-BANNER_H, 0, BANNER_H],
          [-BANNER_H / 2, 0, BANNER_H * 0.35],
          Extrapolation.CLAMP,
        ),
      },
      {
        scale: interpolate(scrollY.value, [-BANNER_H, 0], [2, 1], Extrapolation.CLAMP),
      },
    ],
  }));

  return (
    <Animated.ScrollView
      style={{ flex: 1, backgroundColor: T.bg }}
      onScroll={onScroll}
      scrollEventThrottle={16}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={T.accent}
          colors={[T.accent]}
        />
      }
    >
      {/* ════════════════════ HEADER ════════════════════ */}
      <Animated.View
        style={[
          {
            height: BANNER_H,
            backgroundColor: activeCar.color || '#1a2535',
          },
          bannerStyle,
        ]}
      >
        {activeCar.image ? (
          <Image
            source={{ uri: activeCar.image }}
            style={{ width: '100%', height: '100%', opacity: 0.7 }}
            resizeMode="cover"
          />
        ) : (
          <View style={{ flex: 1, backgroundColor: 'rgba(0,201,167,0.08)' }}>
            <Ionicons
              name="car-sport"
              size={60}
              color={T.wh}
              style={{
                position: 'absolute',
                bottom: 18,
                alignSelf: 'center',
                opacity: 0.12,
              }}
            />
          </View>
        )}

        {/* Subtle bottom gradient so the avatar + name sit on darkness. */}
        <BannerFade height={100} />

        {/* Edit + Share */}
        {isMe && (
          <View
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              flexDirection: 'row',
              gap: 6,
            }}
          >
            <TouchableOpacity
              onPress={async () => {
                try {
                  await Share.share({
                    message: `Check out my build on MODIFIED — ${activeCar.name}. Full mod list and timeline on the app!`,
                    url: `https://modified.app/profile/${profileUser.username}`,
                  });
                } catch (_) {}
              }}
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: 'rgba(0,0,0,0.55)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="share-outline" size={14} color={T.wh} />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: 'rgba(0,0,0,0.55)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => Alert.alert('Edit Profile', 'Coming soon')}
            >
              <Ionicons name="create-outline" size={14} color={T.wh} />
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

      {/* ════════════════════ PROFILE ROW ════════════════════ */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          paddingHorizontal: 16,
          marginTop: -AVATAR_SZ / 2,
        }}
      >
        {/* Avatar — thin dark stroke, no teal ring (IG-style restraint). */}
        <View
          style={{
            borderRadius: AVATAR_SZ / 2 + 2,
            borderWidth: 2,
            borderColor: T.bg,
            backgroundColor: T.bg,
          }}
        >
          <Avatar
            initials={profileUser.username[0]?.toUpperCase()}
            size={AVATAR_SZ}
            img={profileUser.avatar}
          />
        </View>

        <View style={{ flex: 1, marginLeft: 12, marginBottom: 6 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: T.wh }}>
            {profileUser.username}
          </Text>
          <Text
            style={{ fontSize: 13, fontWeight: '600', color: T.tx2, marginTop: 2 }}
            numberOfLines={1}
          >
            {activeCar.name}
          </Text>
        </View>
      </View>

      {/* ════════════════════ STATS (tight 3-up) ════════════════════ */}
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 16,
          marginTop: 18,
        }}
      >
        {[
          { label: 'POSTS', value: profileUser.posts, page: 'posts' },
          { label: 'FOLLOWERS', value: profileUser.followers, page: 'connected' },
          { label: 'FOLLOWING', value: profileUser.following, page: 'connections' },
        ].map((s, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => setSubPage(s.page as any)}
            activeOpacity={0.7}
            style={{ flex: 1, alignItems: 'center' }}
          >
            <AnimatedCount
              value={Number(s.value) || 0}
              style={{ fontSize: 19, fontWeight: '800', color: T.wh }}
            />
            <Text style={{ fontSize: 11, fontWeight: '700', color: T.mu, letterSpacing: 0.6, marginTop: 2 }}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ════════════════════ BIO (tight, 2-line) ════════════════════ */}
      <Text
        numberOfLines={2}
        style={{
          fontSize: 13,
          color: T.tx2,
          marginTop: 16,
          paddingHorizontal: 16,
          lineHeight: 19,
        }}
      >
        {profileUser.bio}
      </Text>

      {/* ════════════════════ PRIMARY ACTION ════════════════════ */}
      <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
        <Button
          label={isMe ? 'Edit Profile' : 'Follow'}
          variant={isMe ? 'secondary' : 'primary'}
          size="md"
          fullWidth
          onPress={() =>
            isMe ? Alert.alert('Edit Profile', 'Coming soon') : undefined
          }
        />
      </View>

      {/* ════════════════════ TAB BAR (INSTAGRAM STYLE) ════════════════════ */}
      <View
        style={{
          flexDirection: 'row',
          marginTop: 20,
          paddingTop: 6,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: T.bd,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: T.bd,
        }}
      >
        {([
          { key: 'hero', icon: 'grid', fam: 'ion', size: 22 },
          { key: 'posts', icon: 'image-outline', fam: 'ion', size: 23 },
          { key: 'videos', icon: 'play-circle-outline', fam: 'ion', size: 24 },
          { key: 'garage', icon: 'garage', fam: 'mci', size: 23 },
        ] as const).map((t) => {
          const active = activeTab === t.key;
          const color = active ? T.accent : T.tx2;
          return (
            <TouchableOpacity
              key={t.key}
              onPress={() => setActiveTab(t.key)}
              activeOpacity={0.7}
              style={{ flex: 1, alignItems: 'center', paddingVertical: 10 }}
            >
              {/* Active-tab fill behind the icon. */}
              <View
                style={{
                  width: 44,
                  height: 30,
                  borderRadius: 9,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: active ? T.accentDim : 'transparent',
                }}
              >
                {t.fam === 'mci' ? (
                  <MaterialCommunityIcons name={t.icon as any} size={t.size} color={color} />
                ) : (
                  <Ionicons name={t.icon as any} size={t.size} color={color} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ════════════════════ HERO TAB ════════════════════ */}
      {activeTab === 'hero' && (
        <View style={{ position: 'relative' }}>
          {/* Floating Year Picker */}
          <FloatingYearPicker
            years={allYears}
            selected={selectedYear}
            onSelect={setSelectedYear}
          />

          {/* ⭐ MODIFICATIONS */}
          <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#F0F6FC' }}>
                Modifications
              </Text>
              {selectedYear && (
                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 20,
                    borderWidth: 1.5,
                    borderColor: T.accent,
                  }}
                >
                  <Text
                    style={{ fontSize: 12, fontWeight: '700', color: T.accent }}
                  >
                    {selectedYear}
                  </Text>
                </View>
              )}
            </View>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              {modKeys.map((k) => {
                const active = modTab === k;
                const icon = (
                  {
                    engine: 'engine-outline',
                    wheels: 'tire',
                    interior: 'car-seat',
                    exterior: 'car-side',
                  } as Record<string, string>
                )[k];
                return (
                  <TouchableOpacity
                    key={k}
                    onPress={() => setModTab(k)}
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      paddingVertical: 12,
                      backgroundColor: active
                        ? 'rgba(0,201,167,0.10)'
                        : 'transparent',
                      borderRadius: 12,
                      borderWidth: 1.5,
                      borderColor: active ? T.accent : 'rgba(0,201,167,0.3)',
                    }}
                  >
                    <MaterialCommunityIcons
                      name={icon}
                      size={20}
                      color={active ? T.accent : T.wh}
                    />
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '600',
                        color: active ? T.accent : T.wh,
                        marginTop: 6,
                      }}
                    >
                      {k.charAt(0).toUpperCase() + k.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <ModsList items={activeCar.mods[modTab] || []} categoryLabel={modTab} />
          </View>

          {/* ⭐ TIMELINE */}
          <View
            style={{
              paddingHorizontal: 16,
              marginTop: 24,
              paddingBottom: 40,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#F0F6FC',
                }}
              >
                Timeline
              </Text>

              {isMe && (
                <PressableScale
                  onPress={() => setAddTLOpen(true)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: T.accentDim,
                    borderWidth: 1,
                    borderColor: 'rgba(0,201,167,0.3)',
                  }}
                >
                  <Ionicons name="add" size={20} color={T.accent} />
                </PressableScale>
              )}
            </View>

            <TimelineList
              entries={filteredTimeline}
              emptyText={`No entries for ${selectedYear}`}
              canDelete={isMe}
              onDelete={(id) => isMe && deleteEntry(id)}
            />
          </View>

          {/* ⭐ PREMIUM GALLERY (3‑column grid) */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {social.posts.map((sp) => (
              <View
                key={`gallery-${sp.id}`}
                style={{ width: '33.3333%', padding: 1 }}
              >
                <GalleryItem
                  imageUrl={sp.mediaUrl}
                  title={sp.caption}
                  author={sp.author.username}
                  likesCount={sp.likeCount}
                  commentsCount={sp.commentCount}
                  onPress={() => setOpenPostId(sp.id)}
                />
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ════════════════════ POSTS TAB ════════════════════ */}
      {activeTab === 'posts' && (
        profilePostsLoading && photoGrid.length === 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <GridTileSkeleton key={`sk-${i}`} />
            ))}
          </View>
        ) : photoGrid.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {photoGrid.map((p) => (
              <TouchableOpacity
                key={`grid-${p.id}`}
                activeOpacity={0.85}
                onPress={() => setOpenPostId(p.id)}
                style={{ width: '33.3333%', aspectRatio: 1, padding: 1 }}
              >
                <FadeInImage
                  source={{ uri: p.url! }}
                  containerStyle={{ width: '100%', height: '100%' }}
                />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <ProfilePostsTab photos={profileUser.photos} />
        )
      )}

      {/* ════════════════════ VIDEOS TAB ════════════════════ */}
      {activeTab === 'videos' && (
        <ProfileVideosTab videos={profileUser.videos} />
      )}

      {/* ════════════════════ GARAGE TAB ════════════════════ */}
      {activeTab === 'garage' && (
        <View style={{ padding: 16, gap: 12 }}>
          {(supaCars ?? []).length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 32, gap: 8 }}>
              <MaterialCommunityIcons name="garage" size={40} color={T.mu} />
              <Text style={{ color: T.mu, fontSize: 13 }}>No cars in the garage yet.</Text>
            </View>
          ) : (
            (supaCars ?? []).map((car) => {
              const active = car.id === selectedCarId;
              const name = `${car.year ?? ''} ${car.make} ${car.model}`.trim();
              return (
                <PressableScale
                  key={car.id}
                  onPress={() => setSelectedCarId(car.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    backgroundColor: T.card,
                    borderRadius: 14,
                    borderWidth: 1.5,
                    borderColor: active ? T.accent : T.bd,
                    overflow: 'hidden',
                    padding: 10,
                  }}
                >
                  <FadeInImage
                    source={{ uri: car.primary_image_url || '' }}
                    containerStyle={{ width: 72, height: 72, borderRadius: 10 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: T.wh, fontSize: 15, fontWeight: '700' }} numberOfLines={1}>
                      {name}
                    </Text>
                  </View>
                  {active ? (
                    <Ionicons name="checkmark-circle" size={22} color={T.accent} />
                  ) : (
                    <Ionicons name="ellipse-outline" size={22} color={T.mu} />
                  )}
                </PressableScale>
              );
            })
          )}

          {/* ── Build Card (shareable spec sheet for the selected car) ── */}
          {selectedSupaCar && (
            <View style={{ marginTop: 12, gap: 14 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={{ color: T.wh, fontSize: 16, fontWeight: '800' }}>
                  Build Card
                </Text>
                {isMe && (
                  <Button
                    label="Share"
                    icon="share-social-outline"
                    variant="primary"
                    size="sm"
                    loading={capturing}
                    onPress={() => shareBuild(selectedSupaCar)}
                  />
                )}
              </View>
              <View ref={buildCardRef} collapsable={false}>
                <BuildCard
                  car={selectedSupaCar}
                  mods={supaMods ?? []}
                  username={profileUser.username}
                />
              </View>
            </View>
          )}
        </View>
      )}

      {/* ════════════════════ ADD TIMELINE MODAL ════════════════════ */}
      {isMe && (
        <TimelineModal
          visible={addTLOpen}
          onClose={() => setAddTLOpen(false)}
          onSubmit={async (entry) => {
            await createEntry(entry);
          }}
        />
      )}

      {/* ════════════════════ SUBPAGES (overlay) ════════════════════ */}
      <Modal
        visible={subPage !== null}
        animationType="slide"
        onRequestClose={() => setSubPage(null)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: T.bd,
            }}
          >
            <TouchableOpacity
              onPress={() => setSubPage(null)}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                backgroundColor: T.card2,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: T.wh, fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
            <Text
              style={{
                flex: 1,
                textAlign: 'center',
                color: T.wh,
                fontSize: 16,
                fontWeight: '700',
                marginRight: 40,
              }}
            >
              {subPage === 'posts'
                ? 'Posts'
                : subPage === 'connected'
                ? 'Followers'
                : subPage === 'connections'
                ? 'Following'
                : ''}
            </Text>
          </View>
          <ScrollView style={{ flex: 1 }}>
            {subPage === 'posts' && (
              <PostsPage
                user={profileUser}
                onClose={() => setSubPage(null)}
                onOpenPost={(id) => setOpenPostId(id)}
              />
            )}
            {subPage === 'connected' && (
              <ConnectedPage
                user={profileUser}
                onClose={() => setSubPage(null)}
                onOpenProfile={(u) => {
                  setSubPage(null);
                  openProfile(u);
                }}
              />
            )}
            {subPage === 'connections' && (
              <ConnectionsPage
                user={profileUser}
                onClose={() => setSubPage(null)}
                onOpenProfile={(u) => {
                  setSubPage(null);
                  openProfile(u);
                }}
              />
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ════════════════════ POST DETAIL ════════════════════ */}
      {openPost && (
        <PostDetailScreen
          post={openPost}
          onClose={() => setOpenPostId(null)}
          onLike={() => social.likePost(openPost.id)}
          onReact={(r) => social.addReaction(openPost.id, r)}
          onShare={() => social.sharePost(openPost.id)}
          onSave={() => setSavePostId(openPost.id)}
          onAddComment={(_id, text) => social.addComment(openPost.id, text)}
        />
      )}

      {/* ════════════════════ SAVE TO SHEET ════════════════════ */}
      {savePostId && (
        <SaveToSheet
          visible={!!savePostId}
          collections={collections.collections}
          isSaved={collections.isSaved(savePostId)}
          onClose={() => setSavePostId(null)}
          onToggleQuickSave={() => collections.toggleSave(savePostId)}
          onCreateCollection={(name) => collections.createCollection(name)}
          onAddToCollection={(cid) =>
            collections.addToCollection(savePostId, cid)
          }
          isInCollection={(cid) => collections.isInCollection(savePostId, cid)}
        />
      )}
    </Animated.ScrollView>
  );
}
