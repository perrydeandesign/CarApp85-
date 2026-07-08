import React from 'react';
import { View } from 'react-native';

/**
 * A pure-View alloy-rim glyph (outer ring + hub + spokes). Used instead of a
 * font icon because the bundled MaterialCommunityIcons has no `car-wheel`, and
 * `tire` reads as a tyre rather than a rim. No native dependency required.
 */
export function RimIcon({ size = 22, color = '#FFFFFF' }: { size?: number; color?: string }) {
  const spokes = 5;
  const spokeW = Math.max(1.5, size * 0.08);
  const spokeH = size * 0.62;
  const hub = size * 0.26;
  const ring = Math.max(1.5, size * 0.09);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* outer rim */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: ring,
          borderColor: color,
        }}
      />
      {/* spokes (diameters through the hub) */}
      {Array.from({ length: spokes }).map((_, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            width: spokeW,
            height: spokeH,
            backgroundColor: color,
            borderRadius: spokeW / 2,
            transform: [{ rotate: `${(360 / spokes) * i}deg` }],
          }}
        />
      ))}
      {/* center hub — masks the spoke overlap */}
      <View style={{ position: 'absolute', width: hub, height: hub, borderRadius: hub / 2, backgroundColor: color }} />
    </View>
  );
}
