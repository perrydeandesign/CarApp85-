import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { T } from '../constants/theme';

// react-native-video is a native module. Lazy-require it so the JS bundle builds
// and runs even before `pod install` + a native rebuild (same defensive pattern
// as lib/push and lib/haptics). Until the pod is present we render a black tile
// with a play glyph so video posts still look intentional rather than broken.
let RNVideo: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  RNVideo = require('react-native-video').default;
} catch {
  RNVideo = null;
}

/** True once the native react-native-video pod is installed. */
export const isVideoAvailable = (): boolean => !!RNVideo;

type Props = {
  uri: string;
  style?: StyleProp<ViewStyle>;
  /** Start paused (feed/grid). Default false = autoplay muted. */
  paused?: boolean;
  /** Loop playback (feed). Default true. */
  repeat?: boolean;
  /** Start muted (feed autoplay). Default true. */
  muted?: boolean;
  /** Show native transport controls (detail/composer). Default false. */
  controls?: boolean;
  resizeMode?: 'contain' | 'cover' | 'stretch';
};

/**
 * Plays a remote video. Falls back to a play-glyph placeholder if the native
 * module isn't installed yet, so the UI never crashes or shows a broken image.
 */
export function VideoView({
  uri,
  style,
  paused = false,
  repeat = true,
  muted = true,
  controls = false,
  resizeMode = 'cover',
}: Props) {
  if (!RNVideo) {
    return (
      <View style={[styles.placeholder, style]}>
        <Ionicons name="play-circle" size={44} color={T.mu} />
      </View>
    );
  }
  return (
    <RNVideo
      source={{ uri }}
      style={style}
      paused={paused}
      repeat={repeat}
      muted={muted}
      controls={controls}
      resizeMode={resizeMode}
      playInBackground={false}
      ignoreSilentSwitch="ignore"
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
