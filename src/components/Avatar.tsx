import React from 'react';
import { Image, Text, View } from 'react-native';
import { T } from '../constants/theme';

type Props = {
  initials?: string;
  size?: number;
  img?: string;
  ring?: boolean;
  accent?: boolean;
  /** Soft drop shadow — use when the avatar sits on a busy/hero surface. */
  shadow?: boolean;
};

// Single source of avatar styling so radius/border/shadow stay consistent
// across the whole app (feed, profile, stories, notifications, comments).
const RING_WIDTH = 2;

export function Avatar({ initials, size = 40, img, ring, accent, shadow }: Props) {
  // Untyped literals so they apply to both <Image> (ImageStyle) and <View>.
  const ringStyle =
    ring || accent ? { borderWidth: RING_WIDTH, borderColor: T.accent } : null;
  const shadowStyle = shadow
    ? {
        shadowColor: '#000',
        shadowOpacity: 0.35,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      }
    : null;

  if (img) {
    return (
      <Image
        source={{ uri: img }}
        style={[
          { width: size, height: size, borderRadius: size / 2 },
          ringStyle,
          shadowStyle,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: T.card2,
          alignItems: 'center',
          justifyContent: 'center',
        },
        ringStyle,
        shadowStyle,
      ]}
    >
      <Text style={{ color: T.wh, fontWeight: '700', fontSize: size / 3 }}>
        {initials ?? '?'}
      </Text>
    </View>
  );
}
