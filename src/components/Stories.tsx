import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Avatar } from './Avatar';
import { T, AVATAR } from '../constants/theme';
import { ME } from '../data/users';
import { DEMO_MODE } from '../config';
import { useMeProfile } from '../hooks/useMeProfile';
import { useStoriesFeed } from '../hooks/useStoriesFeed';
import { useStoryPeople } from '../hooks/useStoryPeople';
import { choosePhotoOrVideo, type MediaPick } from '../lib/imagePicker';
import { StoryComposer } from '../screens/Stories/StoryComposer';
import { StoryViewer } from '../screens/Stories/StoryViewer';

type Props = {
  onGoProfile?: () => void;
  onProfile?: (c: any) => void;
};

const AV = AVATAR.lg; // 72 — story avatars are hero-sized, not thumbnails.
const TILE_W = AV + 12; // fixed tile width so the 4th tile crops → signals overflow.

/** Pulsing teal halo behind an avatar — signals a fresh, unseen story. */
function GlowRing({ size }: { size: number }) {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [pulse]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.35 + pulse.value * 0.55,
    transform: [{ scale: 1 + pulse.value * 0.12 }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: size + 10,
          height: size + 10,
          borderRadius: (size + 10) / 2,
          borderWidth: 2.5,
          borderColor: T.accent,
          shadowColor: T.accent,
          shadowOpacity: 0.9,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 0 },
        },
        style,
      ]}
    />
  );
}

function StoryTile({
  label,
  initials,
  img,
  hasNew,
  plus,
  onPress,
  onPlus,
}: {
  label: string;
  initials?: string;
  img?: string;
  hasNew?: boolean;
  plus?: boolean;
  onPress: () => void;
  onPlus?: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={{ alignItems: 'center', gap: 6, width: TILE_W }}>
      <View style={{ width: AV, height: AV, alignItems: 'center', justifyContent: 'center' }}>
        {hasNew ? <GlowRing size={AV} /> : null}
        <Avatar initials={initials} img={img} size={AV} ring={!hasNew} shadow />
        {plus ? (
          <TouchableOpacity
            onPress={onPlus}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{
              position: 'absolute',
              right: -2,
              bottom: -2,
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: T.accent,
              borderWidth: 2,
              borderColor: T.bg,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="add" size={15} color="#04110E" />
          </TouchableOpacity>
        ) : null}
      </View>
      <Text numberOfLines={1} style={{ fontSize: 11, color: T.tx2, maxWidth: TILE_W }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function Stories({ onProfile }: Props) {
  const { data: me } = useMeProfile();
  const { groups, refresh } = useStoriesFeed(me?.id ?? null);
  // Fallback rail: when nobody has an active story yet, surface recent post
  // authors so the rail is never empty (its pre-Stories behavior).
  const recentPeople = useStoryPeople();

  const myGroup = groups.find((g) => g.author.id === me?.id) ?? null;
  const others = groups.filter((g) => g.author.id !== me?.id);
  // Ordered exactly as rendered, so a tapped tile maps to the right viewer index.
  const displayGroups = myGroup ? [myGroup, ...others] : others;
  // Only fall back when there are no real stories from others to show.
  const fallbackPeople = others.length === 0
    ? recentPeople.filter((p) => p.id !== me?.id)
    : [];

  const [composer, setComposer] = useState<MediaPick | null>(null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const startCreate = async () => {
    const picked = await choosePhotoOrVideo();
    if (picked) setComposer(picked);
  };

  const myAvatar = me?.avatar_url || (DEMO_MODE ? ME.img : undefined);
  const myInitial = me?.username?.[0]?.toUpperCase() || (DEMO_MODE ? ME.av : 'Y');

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 16, paddingRight: 8, paddingTop: 14, paddingBottom: 12, gap: 12 }}
      >
        {/* Your story — create, or view your own + add more via the + badge. */}
        <StoryTile
          label="Your story"
          initials={myInitial}
          img={myAvatar}
          hasNew={!!myGroup?.hasUnseen}
          plus
          onPress={() => (myGroup ? setViewerIndex(0) : startCreate())}
          onPlus={startCreate}
        />

        {others.map((g) => {
          const idx = displayGroups.indexOf(g);
          return (
            <StoryTile
              key={g.author.id}
              label={g.author.username}
              initials={g.author.username?.[0]?.toUpperCase()}
              img={g.author.avatarUrl ?? undefined}
              hasNew={g.hasUnseen}
              onPress={() => setViewerIndex(idx)}
            />
          );
        })}

        {/* No active stories yet → show recent post authors; tapping opens their
            profile (they have no story to view). */}
        {fallbackPeople.map((p) => (
          <StoryTile
            key={p.id}
            label={p.username}
            initials={p.username?.[0]?.toUpperCase()}
            img={p.avatarUrl ?? undefined}
            onPress={() => onProfile?.({ userId: p.id, username: p.username, img: p.avatarUrl ?? undefined })}
          />
        ))}
      </ScrollView>

      {/* Composer */}
      <Modal visible={!!composer} animationType="slide" onRequestClose={() => setComposer(null)}>
        {composer ? (
          <StoryComposer
            media={composer}
            onClose={() => setComposer(null)}
            onPublished={refresh}
          />
        ) : null}
      </Modal>

      {/* Viewer */}
      <Modal visible={viewerIndex !== null} animationType="fade" onRequestClose={() => setViewerIndex(null)}>
        {viewerIndex !== null ? (
          <StoryViewer
            groups={displayGroups}
            startGroupIndex={viewerIndex}
            meId={me?.id ?? null}
            onClose={() => {
              setViewerIndex(null);
              refresh();
            }}
          />
        ) : null}
      </Modal>
    </>
  );
}
