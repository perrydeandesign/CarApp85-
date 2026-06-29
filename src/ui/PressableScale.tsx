import React, { useCallback } from 'react';
import { Pressable, PressableProps, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = PressableProps & {
  /** How far to scale down while pressed (default 0.96). */
  activeScale?: number;
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
};

/**
 * A Pressable that subtly scales down while held — the small tactile cue that
 * makes buttons and tiles feel premium. Uses Reanimated so it runs on the UI
 * thread (no jank). Drop-in replacement for TouchableOpacity in most places.
 */
export function PressableScale({ activeScale = 0.96, style, children, ...rest }: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const onPressIn = useCallback(
    (e: any) => {
      scale.value = withTiming(activeScale, { duration: 90, easing: Easing.out(Easing.quad) });
      rest.onPressIn?.(e);
    },
    [activeScale, rest, scale],
  );
  const onPressOut = useCallback(
    (e: any) => {
      scale.value = withTiming(1, { duration: 120, easing: Easing.out(Easing.quad) });
      rest.onPressOut?.(e);
    },
    [rest, scale],
  );

  return (
    <AnimatedPressable {...rest} onPressIn={onPressIn} onPressOut={onPressOut} style={[style, animatedStyle]}>
      {children}
    </AnimatedPressable>
  );
}
