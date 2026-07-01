import React from 'react';
import { Image, ScrollView } from 'react-native';
import { T } from '../constants/theme';
import type { GalleryPhoto } from '../constants/types';

type Props = {
  photos?: GalleryPhoto[];
  carModel?: string;
};

export function PhotoGallery({ photos = [] }: Props) {
  if (!photos || photos.length === 0) return null;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginTop: 12 }}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
    >
      {photos.map((p, i) => (
        <Image
          key={i}
          source={{ uri: (p as any).uri ?? (p as any).img }}
          style={{ width: 100, height: 100, borderRadius: 8, backgroundColor: T.card }}
        />
      ))}
    </ScrollView>
  );
}
