import React, { useCallback } from 'react';
import { Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { T } from '../constants/theme';
import { AnimatedCount } from './AnimatedCount';
import { haptic } from '../lib/haptics';

type Props = {
  liked: boolean;
  count?: number;
  size?: number;
  /** 'feather' (feed) or 'ionicon' (timeline / messaging) to match local icon set. */
  iconSet?: 'feather' | 'ionicon';
  onPress: () => void;
  style?: ViewStyle;
  countStyle?: TextStyle;
  showCount?: boolean;
};

/**
 * The single source of truth for "like" across the app: teal when active,
 * spring-pop on tap, light haptic, optional animated count. Use everywhere a
 * heart toggle appears so the interaction is identical app-wide.
 */
export function LikeButton({
  liked,
  count,
  size = 16,
  iconSet = 'ionicon',
  onPress,
  style,
  countStyle,
  showCount = true,
}: Props) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = useCallback(() => {
    haptic('light');
    scale.value = withSequence(
      withSpring(1.35, { damping: 6, stiffness: 220 }),
      withSpring(1, { damping: 9, stiffness: 180 }),
    );
    onPress();
  }, [onPress, scale]);

  const color = liked ? T.accent : T.mu;

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[{ flexDirection: 'row', alignItems: 'center', gap: 6 }, style]}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      activeOpacity={0.8}
    >
      <Animated.View style={animStyle}>
        {iconSet === 'feather' ? (
          <Feather name="heart" size={size} color={color} />
        ) : (
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={size} color={color} />
        )}
      </Animated.View>
      {showCount && count != null ? (
        <AnimatedCount value={count} style={[{ color, fontSize: 13, fontWeight: '600' }, countStyle]} />
      ) : null}
    </TouchableOpacity>
  );
}
