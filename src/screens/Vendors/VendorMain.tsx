import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { T, SCREEN_W, VENDOR_CATEGORIES, CAT_TITLE, CAT_SUBTITLE } from '../../constants/theme';
import type { Vendor, VProduct } from '../../constants/types';
import { VENDORS, VPRODS } from '../../data/vendors';
import { VStore, VendorProductRow } from './VendorDetail';
import { ProductDetailScreen } from './ProductDetail';

/* ── Vendor Card ── */
export function VendorCard({ vendor, onPress }: { vendor: Vendor; onPress: () => void }) {
  const fits = vendor.fitsMyGarage ?? false;
  const cats = vendor.categories ?? [];
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, overflow: 'hidden' }}>
      {/* Hero image */}
      <View style={{ height: 160, backgroundColor: 'rgba(255,255,255,0.05)' }}>
        {vendor.heroImg ? (
          <Image source={{ uri: vendor.heroImg }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="storefront-outline" size={40} color="rgba(255,255,255,0.15)" />
          </View>
        )}
      </View>
      <View style={{ padding: 12 }}>
        {/* Name + Fits badge */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: '#F0F6FC', fontSize: 16, fontWeight: '700', flex: 1 }}>{vendor.name}</Text>
          {fits && (
            <View style={{ borderWidth: 1, borderColor: T.accent, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 8 }}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: T.accent }}>Fits Car</Text>
            </View>
          )}
        </View>
        {/* Description */}
        <Text style={{ color: '#C9D1D9', fontSize: 13, lineHeight: 18, marginTop: 6 }} numberOfLines={2}>{vendor.desc}</Text>
        {/* Category chips */}
        {cats.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {cats.map(c => (
              <View key={c} style={{ paddingHorizontal: 8, paddingVertical: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
                <Text style={{ fontSize: 11, fontWeight: '500', color: T.accent }}>{c}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

/* ── Vendor Category Screen ── */
const CAT_COUNT: Record<string, number> = Object.fromEntries(VENDOR_CATEGORIES.map(c => [c, VENDORS.filter(v => v.cat === c).length]));

const AZ_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function VendorDirectoryScreen({ initialCategory, onBack, onVendor }: { initialCategory?: string; onBack: () => void; onVendor: (v: Vendor) => void }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#0D1117' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 28, fontWeight: '800', color: '#F0F6FC', paddingHorizontal: 16, paddingTop: 12 }}>Vendors</Text>

        {VENDORS.map(vendor => (
          <View key={vendor.id} style={{ paddingHorizontal: 16, marginTop: 16 }}>
            <VendorCard vendor={vendor} onPress={() => onVendor(vendor)} />
          </View>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

/* ── Vendor Tab (with stack: main → store → product) ── */
export function VendorTab() {
  const [screen, setScreen] = useState<'main' | 'store' | 'product'>('main');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [fitsOnly, setFitsOnly] = useState(false);
  const [sel, setSel] = useState<typeof VENDORS[0] | null>(null);
  const [selProd, setSelProd] = useState<VProduct | null>(null);

  if (screen === 'product' && selProd) return <ProductDetailScreen product={selProd} onBack={() => { setSelProd(null); setScreen('main'); }} />;
  if (screen === 'store' && sel) return <VStore vendor={sel} onBack={() => { setSel(null); setScreen('main'); }} />;

  const filteredVendors = VENDORS.filter(
    v =>
      (!selectedCategory || (v.categories ?? []).includes(selectedCategory)) &&
      (!fitsOnly || v.fitsMyGarage),
  );
  const trendingProducts = VPRODS.filter(p => p.img).slice(0, 5);
  const GRID_GAP = 8;
  const TILE_W = (SCREEN_W - 32 - GRID_GAP) / 2;

  return (
    <View style={{ flex: 1, backgroundColor: '#0D1117' }}>
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      {/* Title */}
      <Text style={{ fontSize: 28, fontWeight: '800', color: '#F0F6FC', paddingHorizontal: 16, paddingTop: 12 }}>Vendors</Text>

      {/* 2x2 Category Grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP, paddingHorizontal: 16, marginTop: 16 }}>
        {VENDOR_CATEGORIES.map(cat => {
          const isSelected = selectedCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              activeOpacity={0.8}
              onPress={() => setSelectedCategory(isSelected ? null : cat)}
              style={{ width: TILE_W, padding: 12, backgroundColor: isSelected ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)', borderRadius: 12, borderWidth: isSelected ? 1 : 0, borderColor: isSelected ? T.accent : 'transparent' }}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#F0F6FC' }} numberOfLines={1}>{CAT_TITLE[cat] || cat}</Text>
              <Text style={{ fontSize: 11, color: '#C9D1D9', marginTop: 4, lineHeight: 15 }} numberOfLines={2}>{CAT_SUBTITLE[cat]}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Fits-your-car filter */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginTop: 16 }}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setFitsOnly(v => !v)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: fitsOnly ? T.accent : 'rgba(255,255,255,0.15)',
            backgroundColor: fitsOnly ? T.accent : 'transparent',
          }}
        >
          <Ionicons name="car-sport" size={15} color={fitsOnly ? '#0D1117' : T.accent} />
          <Text style={{ fontSize: 13, fontWeight: '700', color: fitsOnly ? '#0D1117' : '#F0F6FC' }}>
            Fits your car
          </Text>
        </TouchableOpacity>
      </View>

      {/* Vendor List */}
      <View style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 17, fontWeight: '700', color: '#F0F6FC', paddingHorizontal: 16, marginBottom: 12 }}>
          {fitsOnly ? 'Vendors that fit your car' : 'Vendors'}
        </Text>
        {filteredVendors.length === 0 && (
          <Text style={{ color: '#C9D1D9', fontSize: 13, paddingHorizontal: 16 }}>
            No vendors match your car in this category yet.
          </Text>
        )}
        {filteredVendors.map(vendor => (
          <View key={vendor.id} style={{ paddingHorizontal: 16, marginBottom: 12 }}>
            <VendorCard vendor={vendor} onPress={() => { setSel(vendor); setScreen('store'); }} />
          </View>
        ))}
      </View>

      {/* Trending Products */}
      {trendingProducts.length > 0 && (
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: '#F0F6FC', paddingHorizontal: 16, marginBottom: 8 }}>Trending Products</Text>
          {trendingProducts.map((p, i) => (
            <View key={i} style={{ paddingHorizontal: 16, marginBottom: 8 }}>
              <VendorProductRow product={p} onPress={() => { setSelProd(p); setScreen('product'); }} />
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
    </View>
  );
}
