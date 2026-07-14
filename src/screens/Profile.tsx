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
} from 'react-native';
import { Button } from '../ui/Button';
import { buildUrl } from '../components/BuildCard';
import { shareBuildImage } from '../lib/buildCardShare';
import { BannerFade } from '../components/BannerFade';
import { useShare } from '../components/ShareProvider';
import { captureRef } from 'react-native-view-shot';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Contexts
import { ViewProfileContext, type ViewedProfile } from '../context/ViewProfileContext';
import { SearchPrefillContext } from '../navigation/SearchPrefillContext';

// Data
import { CONNS, ME, categorizeMods } from '../data/users';
import { getAchievements, topTier, winCount, TIER_COLOR } from '../data/achievements';
import { AchievementsModal } from '../components/AchievementsModal';
import { useCars, useCarMods, bucketMods, usePostsByCar, useProfilePosts, useProfileIdByUsername } from '../hooks/useProfileData';
import { useMeProfile } from '../hooks/useMeProfile';
import { useProfileHeader } from '../hooks/useProfileHeader';
import type { TimelineCategory } from '../types/database';
import type { TimelineEntry } from '../hooks/useTimeline';

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

// Components
import { Avatar } from '../components/Avatar';
import { ProfileVideosTab } from '../components/ProfileVideosTab';
import { GarageMod } from '../components/GarageMod';
import { TimelineModal } from '../components/Timeline/TimelineModal';
import { PostsPage, ConnectedPage, ConnectionsPage } from './Profile/SubPages';
import {
  ProfileStatsRow,
  ProfileTabBar,
  ProfileHeroTab,
  ProfilePhotoGridTab,
  ProfileGarageTab,
} from './Profile/ProfileTabs';
import { ModsEditor } from './Profile/ModsEditor';
import { PostDetailScreen } from './PostDetailScreen';
import { SaveToSheet } from './Saved/SaveToSheet';

// Hooks
import { usePostInteractions } from '../social/hooks/usePostInteractions';
import { useCollections } from '../social/hooks/useCollections';

// Theme
import { T, IC, AVATAR } from '../constants/theme';

// Constants
const AVATAR_SZ = AVATAR.hero;
const BANNER_H = 165; // 25% shorter than the 220 redesign height

export function ProfileScreen() {
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const { share } = useShare();

  const { openProfile, viewedUser, onEditProfile } = useContext(ViewProfileContext);
  const { goToSearch } = useContext(SearchPrefillContext);

  const isMe = !viewedUser;

  // Competition achievements → avatar champion ring + trophy pill/modal.
  const achievements = getAchievements(isMe);
  const ringTier = topTier(achievements);
  const wins = winCount(achievements);
  const ringColor = ringTier ? TIER_COLOR[ringTier] : T.bg;
  const [achOpen, setAchOpen] = useState(false);

  // 1️⃣ Determine Conn (guard against null / partial objects coming from search)
  const conn = ((isMe
    ? CONNS.find((c) => c.userId === ME.id) || CONNS[0]
    : viewedUser) || {}) as ViewedProfile;

  // Resolve a username from whichever field the caller supplied.
  const connUsername = conn.user || conn.username || 'user';

  // Demo fallbacks — used only until live data resolves (and for the demo "me").
  const demoUser = DEMO_USERS.find((u) => u.id === conn.userId);
  const profileOverride = USER_PROFILES[connUsername];

  // 2️⃣ Resolve the REAL Supabase profile.id, then its live header.
  //    isMe → the signed-in profile; viewing someone → lookup by username.
  const { data: me } = useMeProfile();
  const { data: lookupId } = useProfileIdByUsername(isMe ? null : connUsername);
  const realProfileId = isMe ? me?.id ?? null : lookupId ?? null;
  const header = useProfileHeader(realProfileId);

  // 3️⃣ Unified profile object — live header wins; demo is last-resort fallback
  //    so nothing renders empty before live data loads.
  const profileUser = {
    id: realProfileId ?? conn.userId,
    username: header?.username || (isMe ? me?.username : undefined) || connUsername,
    avatar: header?.avatarUrl || (isMe ? me?.avatar_url : undefined) || conn.img || demoUser?.avatar || '',
    car: demoUser?.car || { make: '', model: '', year: '', image: '' },
    carImage: demoUser?.car.image || conn.carImg || '',
    bio:
      header?.bio ||
      profileOverride?.bio ||
      demoUser?.bio ||
      'Car enthusiast. Modified community member.',
    followers: header?.followers ?? conn.followers ?? 0,
    following: header?.following ?? conn.following ?? 0,
    posts: header?.posts ?? (profileOverride?.posts || demoUser?.photos.length || 0),
    photos: demoUser?.photos || [],
    videos: demoUser?.videos || [],
    timeline: ((profileOverride?.timeline || demoUser?.timeline || []) as any[]),
    mods: profileOverride?.mods || categorizeMods(demoUser?.car?.mods),
    gallery: profileOverride?.gallery || [],
    color: conn.color || '#1a1a1a',
  };

  // 4️⃣ Active car — Supabase cars for the resolved profile.
  const { data: supaCars, refresh: refreshCars } = useCars(realProfileId);
  // Live cars only. A real user with no car sees the Garage empty state (below)
  // rather than a seeded sample build. The demo profile (jake_sti) has a real
  // seeded car, so demos stay populated from Supabase.
  const garageCars = supaCars ?? [];
  useEffect(() => {
    if (garageCars.length > 0 && !selectedCarId) {
      setSelectedCarId(garageCars[0].id);
    }
  }, [garageCars, selectedCarId]);
  const { data: supaMods, refresh: refreshMods } = useCarMods(selectedCarId);
  const buildMods = supaMods ?? [];
  const [modsEditorOpen, setModsEditorOpen] = useState(false);

  const selectedSupaCar = garageCars.find((c) => c.id === selectedCarId) ?? null;
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

  const switchCar = (car: any) => {
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
  const modKeys = ['engine', 'wheels', 'interior', 'exterior'] as const;
  const [modTab, setModTab] = useState<'engine' | 'wheels' | 'interior' | 'exterior'>('engine');

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
    // Live car posts only — no demo fallback. A real user with no posts gets the
    // empty state instead of a stranger's sample timeline. jake_sti's 6 seeded
    // car posts populate this from Supabase.
    return supaTimeline;
  }, [supaTimeline]);

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
        isVideo: p.post_media[0]?.media_type === 'video',
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
    () => ({ id: me?.id ?? '', username: me?.username ?? '', avatarUrl: me?.avatar_url ?? '' }),
    [me?.id, me?.username, me?.avatar_url],
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
    const link = buildUrl(car.id, profileUser.username);
    const message = `Check out my ${car.year ?? ''} ${car.make} ${car.model} build on MODIFIED`;
    try {
      setCapturing(true);
      // Give remote hero + QR a tick to be fully painted before snapshot.
      await new Promise<void>((r) => setTimeout(() => r(), 350));
      const uri = await captureRef(buildCardRef, { format: 'png', quality: 1 });
      // One-tap IG Story when configured, else the rich share sheet (with image).
      await shareBuildImage(uri, { message, link });
    } catch (_) {
      try { await Share.share({ url: link, message: `${message} — ${link}` }); } catch (__) {}
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


        {/* Trophy button — icon only; opens the full achievements modal */}
        {achievements.length > 0 && (
          <TouchableOpacity
            onPress={() => setAchOpen(true)}
            activeOpacity={0.85}
            accessibilityLabel="View won competitions"
            style={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              width: 34,
              height: 34,
              borderRadius: 17,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.6)',
              borderWidth: 1,
              borderColor: ringColor,
            }}
          >
            <Ionicons name="trophy" size={16} color={TIER_COLOR.gold} />
          </TouchableOpacity>
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
        {/* Avatar — champion ring (gold/silver/teal) when the user holds a trophy. */}
        <View style={{ position: 'relative' }}>
        <View
          style={{
            borderRadius: AVATAR_SZ / 2 + 3,
            borderWidth: ringTier ? 3 : 2,
            borderColor: ringColor,
            backgroundColor: T.bg,
          }}
        >
          <Avatar
            initials={profileUser.username[0]?.toUpperCase()}
            size={AVATAR_SZ}
            img={isMe ? me?.avatar_url || profileUser.avatar : profileUser.avatar}
            shadow
          />
        </View>
        {ringTier && (
          <View
            style={{
              position: 'absolute',
              right: -2,
              bottom: -2,
              width: 26,
              height: 26,
              borderRadius: 13,
              backgroundColor: ringColor,
              borderWidth: 2,
              borderColor: T.bg,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="trophy" size={13} color={ringTier === 'teal' ? '#04110E' : '#3A2A00'} />
          </View>
        )}
        </View>

        <View style={{ flex: 1, marginLeft: 12, marginBottom: 6 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: T.wh }}>
            {isMe ? me?.username || profileUser.username : profileUser.username}
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
      <ProfileStatsRow
        posts={profileUser.posts}
        followers={profileUser.followers}
        following={profileUser.following}
        onOpen={(page) => setSubPage(page)}
      />

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
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginTop: 14 }}>
        <View style={{ flex: 1 }}>
          <Button
            label={isMe ? 'Edit Profile' : 'Follow'}
            variant={isMe ? 'secondary' : 'primary'}
            size="md"
            fullWidth
            onPress={() =>
              isMe ? onEditProfile?.() : undefined
            }
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            label="Share"
            variant="secondary"
            size="md"
            fullWidth
            onPress={() =>
              share({
                title: `${isMe ? 'My' : `@${profileUser.username}'s`} build on MODIFIED`,
                message: `Check out ${isMe ? 'my' : `@${profileUser.username}'s`} build on MODIFIED — ${activeCar.name}.`,
                url: `https://modified.app/profile/${profileUser.username}`,
              })
            }
          />
        </View>
      </View>

      {/* ════════════════════ TAB BAR (INSTAGRAM STYLE) ════════════════════ */}
      <ProfileTabBar active={activeTab} onChange={setActiveTab} />

      {/* ════════════════════ HERO TAB ════════════════════ */}
      {activeTab === 'hero' && (
        <ProfileHeroTab
          allYears={allYears}
          selectedYear={selectedYear}
          onSelectYear={setSelectedYear}
          modTab={modTab}
          onModTab={setModTab}
          mods={activeCar.mods}
          isMe={isMe}
          onAddTimeline={() => setAddTLOpen(true)}
          timeline={filteredTimeline}
          onDeleteEntry={deleteEntry}
          galleryPosts={social.posts}
          onOpenPost={(id) => setOpenPostId(id)}
        />
      )}

      {/* ════════════════════ POSTS TAB ════════════════════ */}
      {activeTab === 'posts' && (
        <ProfilePhotoGridTab
          loading={profilePostsLoading}
          photos={photoGrid}
          onOpenPost={(id) => setOpenPostId(id)}
          isMe={isMe}
          username={profileUser.username}
        />
      )}

      {/* ════════════════════ VIDEOS TAB ════════════════════ */}
      {activeTab === 'videos' && (
        <ProfileVideosTab videos={profileUser.videos} />
      )}

      {/* ════════════════════ GARAGE TAB ════════════════════ */}
      {activeTab === 'garage' && (
        <ProfileGarageTab
          cars={garageCars}
          selectedCarId={selectedCarId}
          onSelectCar={setSelectedCarId}
          isMe={isMe}
          username={profileUser.username}
          selectedCar={selectedSupaCar}
          buildMods={buildMods}
          capturing={capturing}
          onShareBuild={() => shareBuild(selectedSupaCar)}
          onEditBuild={() => setModsEditorOpen(true)}
          onVideoChanged={refreshCars}
          buildCardRef={buildCardRef}
        />
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

      <AchievementsModal
        visible={achOpen}
        onClose={() => setAchOpen(false)}
        username={profileUser.username}
        achievements={achievements}
      />

      {/* ════════════════════ EDIT BUILD (mods CRUD) ════════════════════ */}
      {isMe && selectedSupaCar && (
        <ModsEditor
          carId={selectedSupaCar.id}
          carName={`${selectedSupaCar.year ?? ''} ${selectedSupaCar.make} ${selectedSupaCar.model}`.trim()}
          visible={modsEditorOpen}
          onClose={(changed) => {
            setModsEditorOpen(false);
            if (changed) refreshMods();
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
