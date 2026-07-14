import React, { useCallback } from 'react';
import { TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { T } from '../constants/theme';
import { Icon } from './Icon';
import { AnimatedCount } from './AnimatedCount';
import { haptic } from '../lib/haptics';

type Props = {
  liked: boolean;
  count?: number;
  size?: number;
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
        <Icon name={liked ? 'heart' : 'heart-outline'} size={size} color={color} />
      </Animated.View>
      {showCount && count != null ? (
        <AnimatedCount value={count} style={[{ color, fontSize: 13, fontWeight: '600' }, countStyle]} />
      ) : null}
    </TouchableOpacity>
  );
}
