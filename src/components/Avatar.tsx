import React from 'react';
import { Image, Text, View } from 'react-native';
import { T } from '../constants/theme';

type Props = {
  initials?: string;
  size?: number;
  img?: string;
  ring?: boolean;
  accent?: boolean;
};

export function Avatar({ initials, size = 40, img, ring, accent }: Props) {
  const ringStyle =
    ring || accent ? { borderWidth: 2, borderColor: T.accent } : null;

  if (img) {
    return (
      <Image
        source={{ uri: img }}
        style={[{ width: size, height: size, borderRadius: size / 2 }, ringStyle]}
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
      ]}
    >
      <Text style={{ color: T.wh, fontWeight: '700', fontSize: size / 3 }}>
        {initials ?? '?'}
      </Text>
    </View>
  );
}
