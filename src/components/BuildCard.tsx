import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { T } from '../constants/theme';
import { FadeInImage } from '../ui/FadeInImage';
import type { CarRow, ModRow } from '../hooks/useProfileData';

type Props = {
  car: CarRow;
  mods: ModRow[];
  username: string;
};

// Deep link the QR points to (web fallback). Build page = feature 1.
export function buildUrl(carId: string) {
  return `https://modified.app/build/${carId}`;
}

// Real, scannable QR rendered as an image — no native dependency.
function qrUrl(data: string) {
  return (
    'https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=0' +
    '&bgcolor=11-19-23&color=0-201-167&data=' +
    encodeURIComponent(data)
  );
}

function firstMod(mods: ModRow[], category: ModRow['category']) {
  return mods.find((m) => m.category === category)?.name ?? '—';
}

/**
 * Branded, shareable spec card for a build. Designed at a fixed 340×560 so it
 * captures cleanly to an image (once react-native-view-shot is added) and reads
 * well as an Instagram-story share.
 */
export function BuildCard({ car, mods, username }: Props) {
  const name = `${car.make} ${car.model}`.toUpperCase();
  const year = car.year ?? '';
  const topMods = mods.slice(0, 4).map((m) => m.name);

  const specs = [
    { label: 'BUILD', value: (car.build_type ?? 'Street').toString() },
    { label: 'ENGINE', value: firstMod(mods, 'engine') },
    { label: 'WHEELS', value: firstMod(mods, 'wheels') },
    { label: 'EXTERIOR', value: firstMod(mods, 'exterior') },
  ];

  return (
    <View style={styles.card}>
      {/* Hero */}
      <FadeInImage
        source={{ uri: car.primary_image_url || '' }}
        containerStyle={styles.hero}
      />
      <View style={styles.heroFade} />

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.sub}>{year ? `${year} · ` : ''}@{username}</Text>

        <View style={styles.divider} />

        {specs.map((s) => (
          <View key={s.label} style={styles.specRow}>
            <Text style={styles.specLabel}>{s.label}</Text>
            <Text style={styles.specValue} numberOfLines={1}>{s.value}</Text>
          </View>
        ))}

        <View style={styles.divider} />

        <Text style={styles.modsHeading}>TOP MODS</Text>
        <View style={styles.modsWrap}>
          {topMods.length === 0 ? (
            <Text style={styles.modPill}>Build in progress</Text>
          ) : (
            topMods.map((m, i) => (
              <Text key={i} style={styles.modPill} numberOfLines={1}>{m}</Text>
            ))
          )}
        </View>

        {/* Footer: branding + QR */}
        <View style={styles.footer}>
          <View style={{ flex: 1 }}>
            <Text style={styles.brand}>MODIFIED</Text>
            <Text style={styles.brandSub}>Scan to view the full build</Text>
          </View>
          <Image source={{ uri: qrUrl(buildUrl(car.id)) }} style={styles.qr} />
        </View>
      </View>
    </View>
  );
}

const CARD_W = 340;
const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    borderRadius: 20,
    backgroundColor: '#0B0F14',
    borderWidth: 1,
    borderColor: T.bd,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  hero: { width: CARD_W, height: 200 },
  heroFade: {
    position: 'absolute',
    top: 150,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: 'rgba(11,15,20,0.55)',
  },
  body: { padding: 18 },
  name: { color: T.wh, fontSize: 22, fontWeight: '900', letterSpacing: 0.5 },
  sub: { color: T.accent, fontSize: 13, fontWeight: '700', marginTop: 2 },
  divider: { height: 1, backgroundColor: T.bd, marginVertical: 14 },
  specRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  specLabel: { width: 96, color: T.mu, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  specValue: { flex: 1, color: T.wh, fontSize: 14, fontWeight: '600' },
  modsHeading: { color: T.mu, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 10 },
  modsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  modPill: {
    color: T.tx,
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: T.card,
    borderWidth: 1,
    borderColor: T.bd,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    overflow: 'hidden',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: T.bd,
    gap: 12,
  },
  brand: { color: T.accent, fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  brandSub: { color: T.mu, fontSize: 11, marginTop: 2 },
  qr: { width: 64, height: 64, borderRadius: 8, backgroundColor: '#11141C' },
});
