import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert, Pressable } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { T, TYPO } from '../../constants/theme';
import { AnimatedCount } from '../../ui/AnimatedCount';
import { PressableScale } from '../../ui/PressableScale';
import { FadeInImage } from '../../ui/FadeInImage';
import { GridMedia } from '../../ui/GridMedia';
import { Button } from '../../ui/Button';
import { GridTileSkeleton } from '../../components/Skeleton';
import { ProfileEmpty } from '../../components/ProfileEmpty';
import { ProfilePostsTab } from '../../components/ProfilePostsTab';
import { FloatingYearPicker } from '../../components/FloatingYearPicker';
import { RimIcon } from '../../components/RimIcon';
import { ModsList } from '../../components/ModsList';
import { VideoView } from '../../ui/VideoView';
import { useBuildVideo } from '../../hooks/useBuildVideo';
import { choosePhotoOrVideo } from '../../lib/imagePicker';
import { TimelineList } from '../../components/Timeline/TimelineList';
import { GalleryItem } from '../../social/components/GalleryItem';
import { BuildCard } from '../../components/BuildCard';
import type { CarRow, ModRow } from '../../hooks/useProfileData';
import type { Post } from '../../social/data/posts';
import type { TimelineEntry } from '../../hooks/useTimeline';

export type ProfileTab = 'hero' | 'posts' | 'videos' | 'garage';
type ModKey = 'engine' | 'wheels' | 'interior' | 'exterior';
export type SubPageKey = 'posts' | 'connected' | 'connections';

const MOD_KEYS: readonly ModKey[] = ['engine', 'wheels', 'interior', 'exterior'];
const MOD_ICON: Record<ModKey, string> = {
  engine: 'engine-outline',
  wheels: 'tire', // unused for wheels (custom RimIcon below)
  interior: 'car-seat',
  exterior: 'car-side',
};

// ── STATS (tight 3-up) ──────────────────────────────────────────────────────
export function ProfileStatsRow({
  posts,
  followers,
  following,
  onOpen,
}: {
  posts: number;
  followers: number;
  following: number;
  onOpen: (page: SubPageKey) => void;
}) {
  const stats = [
    { label: 'POSTS', value: posts, page: 'posts' as const },
    { label: 'FOLLOWERS', value: followers, page: 'connected' as const },
    { label: 'FOLLOWING', value: following, page: 'connections' as const },
  ];
  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginTop: 18 }}>
      {stats.map((s) => (
        <TouchableOpacity
          key={s.label}
          onPress={() => onOpen(s.page)}
          activeOpacity={0.7}
          style={{ flex: 1, alignItems: 'center' }}
        >
          <AnimatedCount value={Number(s.value) || 0} style={{ fontSize: 19, fontWeight: '800', color: T.wh }} />
          <Text style={{ fontSize: 11, fontWeight: '700', color: T.mu, letterSpacing: 0.6, marginTop: 2 }}>
            {s.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── TAB BAR (Instagram style) ────────────────────────────────────────────────
export function ProfileTabBar({ active, onChange }: { active: ProfileTab; onChange: (t: ProfileTab) => void }) {
  const tabs = [
    { key: 'hero', icon: 'grid', fam: 'ion', size: 22 },
    { key: 'posts', icon: 'image-outline', fam: 'ion', size: 23 },
    { key: 'videos', icon: 'play-circle-outline', fam: 'ion', size: 24 },
    { key: 'garage', icon: 'garage', fam: 'mci', size: 23 },
  ] as const;
  return (
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
      {tabs.map((t) => {
        const isActive = active === t.key;
        const color = isActive ? T.accent : T.tx2;
        return (
          <TouchableOpacity
            key={t.key}
            onPress={() => onChange(t.key)}
            activeOpacity={0.7}
            style={{ flex: 1, alignItems: 'center', paddingVertical: 10 }}
          >
            <View
              style={{
                width: 48,
                height: 32,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isActive ? T.accentDim : 'transparent',
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
  );
}

// ── HERO TAB (build + timeline + gallery) ────────────────────────────────────
export function ProfileHeroTab({
  allYears,
  selectedYear,
  onSelectYear,
  modTab,
  onModTab,
  mods,
  isMe,
  onAddTimeline,
  timeline,
  onDeleteEntry,
  galleryPosts,
  onOpenPost,
}: {
  allYears: number[];
  selectedYear: number | null;
  onSelectYear: (y: number | null) => void;
  modTab: ModKey;
  onModTab: (k: ModKey) => void;
  mods: Record<string, any[]>;
  isMe: boolean;
  onAddTimeline: () => void;
  timeline: TimelineEntry[];
  onDeleteEntry: (id: string) => void;
  galleryPosts: Post[];
  onOpenPost: (id: string) => void;
}) {
  return (
    <View style={{ position: 'relative' }}>
      <FloatingYearPicker years={allYears} selected={selectedYear} onSelect={onSelectYear} />

      {/* ⭐ MODIFICATIONS */}
      <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={{ ...TYPO.h2, color: T.tx }}>My Build</Text>
          {selectedYear && (
            <View style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1.5, borderColor: T.accent }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: T.accent }}>{selectedYear}</Text>
            </View>
          )}
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          {MOD_KEYS.map((k) => {
            const active = modTab === k;
            return (
              <TouchableOpacity
                key={k}
                onPress={() => onModTab(k)}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 12,
                  backgroundColor: active ? 'rgba(0,201,167,0.10)' : 'transparent',
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: active ? T.accent : 'rgba(0,201,167,0.3)',
                }}
              >
                {k === 'wheels' ? (
                  <RimIcon size={20} color={active ? T.accent : T.wh} />
                ) : (
                  <MaterialCommunityIcons name={MOD_ICON[k]} size={20} color={active ? T.accent : T.wh} />
                )}
                <Text style={{ fontSize: 11, fontWeight: '600', color: active ? T.accent : T.wh, marginTop: 6 }}>
                  {k.charAt(0).toUpperCase() + k.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <ModsList items={mods[modTab] || []} categoryLabel={modTab} />
      </View>

      {/* ⭐ TIMELINE */}
      <View style={{ paddingHorizontal: 16, marginTop: 24, paddingBottom: 40 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text style={{ ...TYPO.h2, color: T.tx }}>Timeline</Text>
          {isMe && (
            <PressableScale
              onPress={onAddTimeline}
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
          entries={timeline}
          emptyText={`No entries for ${selectedYear}`}
          canDelete={isMe}
          onDelete={(id) => isMe && onDeleteEntry(id)}
        />
      </View>

      {/* ⭐ PREMIUM GALLERY (3-column grid) */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {galleryPosts.map((sp) => (
          <View key={`gallery-${sp.id}`} style={{ width: '33.3333%', padding: 1 }}>
            <GalleryItem
              imageUrl={sp.mediaUrl}
              isVideo={sp.mediaType === 'video'}
              likeCount={sp.likeCount}
              commentCount={sp.commentCount}
              onPress={() => onOpenPost(sp.id)}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

// ── POSTS TAB (3-col photo grid) ─────────────────────────────────────────────
type PhotoTile = { id: string; url: string | null; isVideo: boolean };
export function ProfilePhotoGridTab({
  loading,
  photos,
  onOpenPost,
  isMe,
  username,
}: {
  loading: boolean;
  photos: PhotoTile[];
  onOpenPost: (id: string) => void;
  isMe: boolean;
  username: string;
}) {
  if (loading && photos.length === 0) {
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <GridTileSkeleton key={`sk-${i}`} />
        ))}
      </View>
    );
  }
  if (photos.length === 0) {
    return <ProfilePostsTab isMe={isMe} username={username} />;
  }
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {photos.map((p) => (
        <TouchableOpacity
          key={`grid-${p.id}`}
          activeOpacity={0.85}
          onPress={() => onOpenPost(p.id)}
          style={{ width: '33.3333%', aspectRatio: 1, padding: 1 }}
        >
          <GridMedia uri={p.url!} isVideo={p.isVideo} containerStyle={{ width: '100%', height: '100%' }} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── BUILD WALKTHROUGH VIDEO (hero clip atop the build card) ───────────────────
function BuildVideoSection({
  carId,
  videoUrl,
  isMe,
  onChanged,
}: {
  carId: string;
  videoUrl: string | null;
  isMe: boolean;
  onChanged?: () => void;
}) {
  const { busy, upload, remove } = useBuildVideo(carId);
  const [fullscreen, setFullscreen] = useState(false);

  const pickAndUpload = async () => {
    const picked = await choosePhotoOrVideo();
    if (!picked) return;
    if (picked.type !== 'video') {
      Alert.alert('Choose a video', 'A build walkthrough needs to be a video clip.');
      return;
    }
    try {
      await upload(picked);
      onChanged?.();
    } catch (e: any) {
      Alert.alert('Could not upload video', e?.message ?? String(e));
    }
  };

  const confirmRemove = () => {
    Alert.alert('Remove build video?', 'This clip will be removed from your build card.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await remove(videoUrl);
            onChanged?.();
          } catch (e: any) {
            Alert.alert('Could not remove', e?.message ?? String(e));
          }
        },
      },
    ]);
  };

  // Non-owner with no video → render nothing.
  if (!videoUrl && !isMe) return null;

  return (
    <View style={{ gap: 10 }}>
      <Text style={{ color: T.wh, fontSize: 16, fontWeight: '800' }}>Build walkthrough</Text>

      {videoUrl ? (
        <>
          <TouchableOpacity activeOpacity={0.9} onPress={() => setFullscreen(true)}>
            <View style={{ width: '100%', aspectRatio: 16 / 9, borderRadius: 14, overflow: 'hidden', backgroundColor: '#000' }}>
              <VideoView uri={videoUrl} style={{ width: '100%', height: '100%' }} muted repeat resizeMode="cover" />
              <View
                style={{
                  position: 'absolute',
                  right: 10,
                  bottom: 10,
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: 'rgba(0,0,0,0.55)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="expand" size={18} color={T.wh} />
              </View>
            </View>
          </TouchableOpacity>

          {isMe && (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button label="Replace" variant="secondary" size="sm" loading={busy} onPress={pickAndUpload} />
              <Button label="Remove" variant="danger" size="sm" onPress={confirmRemove} />
            </View>
          )}

          <Modal visible={fullscreen} animationType="fade" onRequestClose={() => setFullscreen(false)}>
            <View style={{ flex: 1, backgroundColor: '#000' }}>
              <VideoView uri={videoUrl} style={{ flex: 1 }} muted={false} controls resizeMode="contain" />
              <Pressable
                onPress={() => setFullscreen(false)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={{ position: 'absolute', top: 50, right: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' }}
              >
                <Ionicons name="close" size={26} color="#fff" />
              </Pressable>
            </View>
          </Modal>
        </>
      ) : (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={pickAndUpload}
          disabled={busy}
          style={{
            width: '100%',
            aspectRatio: 16 / 9,
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: T.bd,
            borderStyle: 'dashed',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            backgroundColor: T.card,
          }}
        >
          <Ionicons name="videocam-outline" size={28} color={T.accent} />
          <Text style={{ color: T.tx2, fontSize: 13, fontWeight: '600' }}>
            {busy ? 'Uploading…' : 'Add a build walkthrough video'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── GARAGE TAB (car picker + build card) ─────────────────────────────────────
export function ProfileGarageTab({
  cars,
  selectedCarId,
  onSelectCar,
  isMe,
  username,
  selectedCar,
  buildMods,
  capturing,
  onShareBuild,
  onEditBuild,
  onVideoChanged,
  buildCardRef,
}: {
  cars: CarRow[];
  selectedCarId: string | null;
  onSelectCar: (id: string) => void;
  isMe: boolean;
  username: string;
  selectedCar: CarRow | null;
  buildMods: ModRow[];
  capturing: boolean;
  onShareBuild: () => void;
  onEditBuild: () => void;
  onVideoChanged?: () => void;
  buildCardRef: React.RefObject<View | null>;
}) {
  return (
    <View style={{ padding: 16, gap: 12 }}>
      {cars.length === 0 ? (
        <ProfileEmpty
          icon="garage"
          title={isMe ? 'Your garage is empty' : `@${username} hasn't added a car yet`}
          subtitle={
            isMe
              ? 'Add your car to show off your first build and track your mods over time.'
              : 'Check back later to see their build.'
          }
        />
      ) : (
        cars.map((car) => {
          const active = car.id === selectedCarId;
          const name = `${car.year ?? ''} ${car.make} ${car.model}`.trim();
          return (
            <PressableScale
              key={car.id}
              onPress={() => onSelectCar(car.id)}
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
      {selectedCar && (
        <View style={{ marginTop: 12, gap: 14 }}>
          <BuildVideoSection
            carId={selectedCar.id}
            videoUrl={selectedCar.build_video_url}
            isMe={isMe}
            onChanged={onVideoChanged}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ ...TYPO.h2, color: T.tx }}>Build Card</Text>
            {isMe && (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Button label="Edit build" variant="secondary" size="sm" onPress={onEditBuild} />
                <Button
                  label="Share"
                  variant="primary"
                  size="sm"
                  loading={capturing}
                  onPress={onShareBuild}
                />
              </View>
            )}
          </View>
          <View ref={buildCardRef} collapsable={false}>
            <BuildCard car={selectedCar} mods={buildMods} username={username} />
          </View>
        </View>
      )}
    </View>
  );
}
