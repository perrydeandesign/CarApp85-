import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { T } from '../constants/theme';

type Props = {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: any;
};

/** Single shimmering placeholder block. Use as a building block. */
export function SkeletonBlock({ width = '100%', height = 16, borderRadius = 6, style }: Props) {
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.85, { duration: 850, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: T.card,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

/** Feed-card-shaped skeleton — matches PostCard layout (avatar row, image, action row, caption). */
export function FeedCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <SkeletonBlock width={32} height={32} borderRadius={16} />
        <View style={{ marginLeft: 8 }}>
          <SkeletonBlock width={120} height={12} />
        </View>
      </View>
      <SkeletonBlock width="100%" height={360} borderRadius={0} style={{ marginVertical: 4 }} />
      <View style={[styles.row, { paddingHorizontal: 12, paddingVertical: 8 }]}>
        <SkeletonBlock width={56} height={14} style={{ marginRight: 16 }} />
        <SkeletonBlock width={56} height={14} style={{ marginRight: 16 }} />
        <SkeletonBlock width={56} height={14} />
      </View>
      <View style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
        <SkeletonBlock width="80%" height={12} style={{ marginBottom: 6 }} />
        <SkeletonBlock width="60%" height={12} />
      </View>
    </View>
  );
}

/** 3-column grid tile skeleton — for the Profile photo tab. */
export function GridTileSkeleton() {
  return (
    <View style={{ width: '33.3333%', aspectRatio: 1, padding: 1 }}>
      <SkeletonBlock width="100%" height="100%" borderRadius={0} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#0D1117', marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 12 },
});
