import React from 'react';
import { Image, View } from 'react-native';
import { T } from '../../constants/theme';

type Props = {
  uri: string;
  height?: number;
};

export function TimelineImage({ uri, height = 180 }: Props) {
  return (
    <View
      style={{
        marginTop: 10,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: T.card2,
      }}
    >
      <Image
        source={{ uri }}
        style={{ width: '100%', height }}
        resizeMode="cover"
      />
    </View>
  );
}
