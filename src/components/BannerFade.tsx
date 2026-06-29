import React from 'react';
import { View } from 'react-native';

/**
 * Pure-RN bottom-up dark gradient (no native gradient dependency). Stacks a few
 * absolutely-positioned bands of increasing opacity so banner photos fade into
 * the dark page — the avatar + name then sit on darkness, not a hard photo edge.
 */
export function BannerFade({ height = 120, color = '13,17,23' }: { height?: number; color?: string }) {
  const bands = 8;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height }}>
      {Array.from({ length: bands }).map((_, i) => {
        const t = (i + 1) / bands; // 0→1 toward the bottom
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: (height * (i + 1)) / bands,
              backgroundColor: `rgba(${color},${0.14 * t})`,
            }}
          />
        );
      })}
    </View>
  );
}
