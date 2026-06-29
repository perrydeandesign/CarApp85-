import React, { useEffect } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Avatar } from './Avatar';
import { T } from '../constants/theme';
import { ME, CONNS } from '../data/users';

type Props = {
  onGoProfile?: () => void;
  onProfile?: (c: any) => void;
};

/** Pulsing teal halo behind an avatar — signals a fresh, unseen post. */
function GlowRing({ size }: { size: number }) {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [pulse]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.35 + pulse.value * 0.55,
    transform: [{ scale: 1 + pulse.value * 0.12 }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: size + 10,
          height: size + 10,
          borderRadius: (size + 10) / 2,
          borderWidth: 2.5,
          borderColor: T.accent,
          shadowColor: T.accent,
          shadowOpacity: 0.9,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 0 },
        },
        style,
      ]}
    />
  );
}

export function Stories({ onGoProfile, onProfile }: Props) {
  const items = [
    { user: 'You', av: ME.av, img: ME.img, isMe: true, hasNew: false },
    ...CONNS.slice(0, 5).map((c, idx) => ({
      user: c.user,
      av: c.av,
      img: c.img,
      conn: c,
      isMe: false,
      // First few connections have a fresh post → glowing ring.
      hasNew: idx < 3,
    })),
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 12,
        gap: 14,
      }}
    >
      {items.map((it, i) => (
        <TouchableOpacity
          key={i}
          onPress={() => {
            if (it.isMe) onGoProfile?.();
            else if (onProfile && (it as any).conn) onProfile((it as any).conn);
          }}
          style={{ alignItems: 'center', gap: 6, width: 64 }}
        >
          <View style={{ width: 58, height: 58, alignItems: 'center', justifyContent: 'center' }}>
            {it.hasNew ? <GlowRing size={58} /> : null}
            <Avatar initials={it.av} img={it.img} size={58} ring={!it.hasNew} />
          </View>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 11,
              color: T.tx2,
              fontWeight: it.isMe ? '700' : '400',
              maxWidth: 64,
            }}
          >
            {it.user}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
