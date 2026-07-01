import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useReduceMotion } from '../context/AppPrefsContext';

type Props = {
  /** When this value changes, the children cross-fade back in. */
  triggerKey: string | number;
  children: React.ReactNode;
  style?: any;
};

/**
 * Fades its content in whenever `triggerKey` changes — used to cross-fade
 * between bottom-tab screens instead of a hard cut. Lightweight: a single
 * opacity timing on the UI thread.
 */
export function FadeSwitch({ triggerKey, children, style }: Props) {
  const opacity = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const reduceMotion = useReduceMotion();

  useEffect(() => {
    if (reduceMotion) {
      opacity.value = 1; // instant switch, no fade
      return;
    }
    opacity.value = 0;
    opacity.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.quad) });
  }, [triggerKey, opacity, reduceMotion]);

  return (
    <Animated.View style={[styles.fill, animatedStyle, style]}>{children}</Animated.View>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
