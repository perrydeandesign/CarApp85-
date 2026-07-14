import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  Animated,
  Pressable,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Avatar } from '../../components/Avatar';
import { VideoView } from '../../ui/VideoView';
import { markStoryViewed } from '../../hooks/useStoriesFeed';
import type { StoryGroup } from '../../lib/storiesDb';

const { width: SCREEN_W } = Dimensions.get('window');
const PHOTO_MS = 5000;
const VIDEO_MS = 15000;

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  return `${Math.floor(s / 3600)}h`;
}

/**
 * Instagram-style tap-through story viewer. Plays each author's stories in order,
 * auto-advancing with segmented progress bars; tap right/left to skip, X to
 * close. Records a view for every story shown.
 */
export function StoryViewer({
  groups,
  startGroupIndex,
  meId,
  onClose,
}: {
  groups: StoryGroup[];
  startGroupIndex: number;
  meId: string | null;
  onClose: () => void;
}) {
  const [groupIndex, setGroupIndex] = useState(startGroupIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;

  const group = groups[groupIndex];
  const story = group?.stories[storyIndex];

  const advance = () => {
    if (!group) return onClose();
    if (storyIndex < group.stories.length - 1) {
      setStoryIndex((i) => i + 1);
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex((g) => g + 1);
      setStoryIndex(0);
    } else {
      onClose();
    }
  };

  const back = () => {
    if (storyIndex > 0) {
      setStoryIndex((i) => i - 1);
    } else if (groupIndex > 0) {
      const prev = groupIndex - 1;
      setGroupIndex(prev);
      setStoryIndex(Math.max(0, groups[prev].stories.length - 1));
    }
  };

  // Mark viewed + drive the progress bar whenever the current story changes.
  useEffect(() => {
    if (!story) return;
    void markStoryViewed(story.id, meId);
    progress.setValue(0);
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: story.media_type === 'video' ? VIDEO_MS : PHOTO_MS,
      useNativeDriver: false,
    });
    anim.start(({ finished }) => {
      if (finished) advance();
    });
    return () => anim.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupIndex, storyIndex, story?.id]);

  if (!group || !story) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      {/* Media */}
      <View style={{ ...StyleSheetAbsoluteFill }}>
        {story.media_type === 'video' ? (
          <VideoView uri={story.media_url} style={{ flex: 1 }} muted={false} repeat={false} resizeMode="contain" />
        ) : (
          <Image source={{ uri: story.media_url }} style={{ flex: 1 }} resizeMode="contain" />
        )}
      </View>

      {/* Tap zones (left = back, right = forward) */}
      <View style={{ ...StyleSheetAbsoluteFill, flexDirection: 'row' }}>
        <Pressable style={{ width: SCREEN_W * 0.3 }} onPress={back} />
        <Pressable style={{ flex: 1 }} onPress={advance} />
      </View>

      {/* Progress bars */}
      <View style={{ flexDirection: 'row', gap: 4, paddingHorizontal: 10, paddingTop: 8 }}>
        {group.stories.map((s, i) => (
          <View key={s.id} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)', overflow: 'hidden' }}>
            <Animated.View
              style={{
                height: 3,
                borderRadius: 2,
                backgroundColor: '#fff',
                width:
                  i < storyIndex
                    ? '100%'
                    : i === storyIndex
                    ? progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
                    : '0%',
              }}
            />
          </View>
        ))}
      </View>

      {/* Author header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 12 }}>
        <Avatar initials={group.author.username?.[0]?.toUpperCase()} img={group.author.avatarUrl ?? undefined} size={36} />
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14, marginLeft: 10 }}>{group.author.username}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginLeft: 8 }}>{timeAgo(story.created_at)}</Text>
        <View style={{ flex: 1 }} />
        <Pressable onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="close" size={26} color="#fff" />
        </Pressable>
      </View>

      {/* Caption */}
      {story.caption ? (
        <View style={{ position: 'absolute', bottom: 40, left: 16, right: 16 }}>
          <Text style={{ color: '#fff', fontSize: 15, lineHeight: 21, textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 4 }}>
            {story.caption}
          </Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

// Local constant to avoid importing StyleSheet just for absoluteFill.
const StyleSheetAbsoluteFill = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};
