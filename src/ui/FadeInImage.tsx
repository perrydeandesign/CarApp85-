import React, { useState } from 'react';
import { Image, ImageProps, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { T } from '../constants/theme';

const AImage = Animated.createAnimatedComponent(Image);

type Props = ImageProps & {
  /** Placeholder background shown until the image decodes. */
  placeholderColor?: string;
  containerStyle?: ViewStyle | ViewStyle[];
};

/**
 * Image that fades in once loaded, over a dark placeholder. Removes the harsh
 * pop-in when remote photos (e.g. Wikimedia Commons) decode — a small touch
 * that reads as premium across the feed and grids.
 */
export function FadeInImage({ placeholderColor = T.card, containerStyle, style, onLoad, ...rest }: Props) {
  const opacity = useSharedValue(0);
  const [loaded, setLoaded] = useState(false);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={[styles.container, { backgroundColor: placeholderColor }, containerStyle]}>
      <AImage
        {...rest}
        style={[StyleSheet.absoluteFill, style, animatedStyle]}
        onLoad={(e) => {
          if (!loaded) {
            setLoaded(true);
            opacity.value = withTiming(1, { duration: 280, easing: Easing.out(Easing.quad) });
          }
          onLoad?.(e);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
});
