import React, { useState } from 'react';
import { Image, ImageProps, ImageSourcePropType, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { T } from '../constants/theme';
import { resolveImage } from '../lib/imageMirror';

const AImage = Animated.createAnimatedComponent(Image);

type Props = ImageProps & {
  /** Placeholder background shown until the image decodes. */
  placeholderColor?: string;
  containerStyle?: ViewStyle | ViewStyle[];
};

function uriOf(source: ImageSourcePropType | undefined): string | undefined {
  if (source && typeof source === 'object' && 'uri' in source) return (source as any).uri;
  return undefined;
}

/**
 * Image that fades in once loaded, over a dark placeholder. Also lazily mirrors
 * remote images into our Storage (via the mirror-image Edge Function) and swaps
 * to the Storage copy once available — removing the production hotlink risk
 * without any change to what the user sees.
 */
export function FadeInImage({ placeholderColor = T.card, containerStyle, style, onLoad, source, ...rest }: Props) {
  const opacity = useSharedValue(0);
  const [loaded, setLoaded] = useState(false);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  // Start with the original URL (instant), swap to the Storage copy when the
  // background mirror resolves.
  const original = uriOf(source);
  const [shownUri, setShownUri] = useState<string | undefined>(original);
  React.useEffect(() => {
    if (!original) return;
    const resolved = resolveImage(original, (storageUrl) => setShownUri(storageUrl));
    setShownUri(resolved);
  }, [original]);

  const finalSource = shownUri ? { uri: shownUri } : source;

  return (
    <View style={[styles.container, { backgroundColor: placeholderColor }, containerStyle]}>
      <AImage
        {...rest}
        source={finalSource}
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
