import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, TextInput, Modal } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { T, SCREEN_W, VENDOR_CATEGORIES, CAT_TITLE, CAT_SUBTITLE } from '../../constants/theme';
import type { Vendor, VProduct } from '../../constants/types';
import { VENDORS, VPRODS, productFitsGarage } from '../../data/vendors';
import { VStore, VendorProductRow } from './VendorDetail';
import { ProductDetailScreen } from './ProductDetail';

/* ── Vendor Card (full-width, matches existing app style) ── */
export function VendorCard({ vendor, onPress }: { vendor: Vendor; onPress: () => void }) {
  const fits = vendor.fitsMyGarage ?? false;
  const cats = vendor.categories ?? [];
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, overflow: 'hidden' }}>
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
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: '#F0F6FC', fontSize: 16, fontWeight: '700', flex: 1 }}>{vendor.name}</Text>
          {fits && (
            <View style={{ borderWidth: 1, borderColor: T.accent, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 8 }}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: T.accent }}>Fits Car</Text>
            </View>
          )}
        </View>
        <Text style={{ color: '#C9D1D9', fontSize: 13, lineHeight: 18, marginTop: 6 }} numberOfLines={2}>{vendor.desc}</Text>
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

/* ── Compact horizontal shelf cards ── */
// SALE_ACCENT mirrors the profile trophy treatment — a subtle warm ring + badge.
const SALE_ACCENT = '#FBBF24';

function VendorShelfCard({ vendor, onPress, sale }: { vendor: Vendor; onPress: () => void; sale?: boolean }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        width: 150,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: sale ? 1.5 : 0,
        borderColor: sale ? 'rgba(251,191,36,0.55)' : 'transparent',
      }}
    >
      <View style={{ height: 96, backgroundColor: 'rgba(255,255,255,0.05)' }}>
        {vendor.heroImg ? <Image source={{ uri: vendor.heroImg }} style={{ width: '100%', height: '100%' }} resizeMode="cover" /> : null}
        {sale ? (
          <View style={{ position: 'absolute', top: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(0,0,0,0.6)', borderWidth: 1, borderColor: SALE_ACCENT, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3 }}>
            <Ionicons name="pricetag" size={10} color={SALE_ACCENT} />
            <Text style={{ color: SALE_ACCENT, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>SALE</Text>
          </View>
        ) : null}
      </View>
      <View style={{ padding: 10 }}>
        <Text numberOfLines={1} style={{ color: '#F0F6FC', fontSize: 13, fontWeight: '700' }}>{vendor.name}</Text>
        {sale ? (
          <Text style={{ color: SALE_ACCENT, fontSize: 11, marginTop: 2, fontWeight: '700' }}>Sale on now</Text>
        ) : vendor.fitsMyGarage ? (
          <Text style={{ color: T.accent, fontSize: 11, marginTop: 2 }}>Fits your car</Text>
        ) : (
          <Text numberOfLines={1} style={{ color: '#8B949E', fontSize: 11, marginTop: 2 }}>{(vendor.categories ?? [])[0] ?? ''}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

function ProductShelfCard({ product, onPress }: { product: VProduct; onPress: () => void }) {
  const fits = product.fitsSelectedCar ?? productFitsGarage(product).fits;
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={{ width: 150, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 14, overflow: 'hidden' }}>
      <View style={{ height: 110, backgroundColor: 'rgba(255,255,255,0.05)' }}>
        {product.img ? <Image source={{ uri: product.img }} style={{ width: '100%', height: '100%' }} resizeMode="cover" /> : null}
        {fits ? (
          <View style={{ position: 'absolute', top: 8, right: 8 }}>
            <Ionicons name="checkmark-circle" size={20} color={T.accent} />
          </View>
        ) : null}
      </View>
      <View style={{ padding: 10 }}>
        <Text numberOfLines={1} style={{ color: '#F0F6FC', fontSize: 12.5, fontWeight: '700' }}>{product.name}</Text>
        <Text style={{ color: T.accent, fontSize: 12.5, fontWeight: '800', marginTop: 3 }}>${product.price}</Text>
      </View>
    </TouchableOpacity>
  );
}

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 10 }}>
      <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 2, color: '#8B949E' }}>{title}</Text>
      {onSeeAll ? <TouchableOpacity onPress={onSeeAll}><Text style={{ fontSize: 12, fontWeight: '700', color: T.accent }}>See all ›</Text></TouchableOpacity> : null}
    </View>
  );
}

/* ── Legacy directory export (kept for compatibility) ── */
export function VendorDirectoryScreen({ onBack, onVendor }: { initialCategory?: string; onBack: () => void; onVendor: (v: Vendor) => void }) {
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

/* ── Fits-your-car toggle pill ── */
function FitsToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onToggle}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: on ? T.accent : 'rgba(255,255,255,0.15)', backgroundColor: on ? T.accent : 'transparent' }}
    >
      <Ionicons name="car-sport" size={15} color={on ? '#0D1117' : T.accent} />
      <Text style={{ fontSize: 13, fontWeight: '700', color: on ? '#0D1117' : '#F0F6FC' }}>Fits your car</Text>
    </TouchableOpacity>
  );
}

/* ══════════════════ VENDOR TAB — 2 screens (Hub → Results) + detail sheets ══════════════════ */
export function VendorTab() {
  const [view, setView] = useState<'hub' | 'results'>('hub');
  const [resultsCat, setResultsCat] = useState<string | null>(null);
  const [seg, setSeg] = useState<'vendors' | 'products'>('vendors');
  const [query, setQuery] = useState('');
  const [fitsOnly, setFitsOnly] = useState(false);

  // Detail sheets (keep navigable depth at 2)
  const [vendorSheet, setVendorSheet] = useState<Vendor | null>(null);
  const [productSheet, setProductSheet] = useState<VProduct | null>(null);

  const GRID_GAP = 8;
  const TILE_W = (SCREEN_W - 32 - GRID_GAP) / 2;

  const openResults = (cat: string | null, segment: 'vendors' | 'products') => {
    setResultsCat(cat);
    setSeg(segment);
    setView('results');
  };
  const backToHub = () => { setView('hub'); setResultsCat(null); setQuery(''); };

  // Category id → vendor ids (to filter products by their vendor's category)
  const vendorIdsInCat = useMemo(() => {
    if (!resultsCat) return null;
    return new Set(VENDORS.filter(v => (v.categories ?? []).includes(resultsCat)).map(v => v.id));
  }, [resultsCat]);

  const q = query.trim().toLowerCase();
  const filteredVendors = useMemo(() =>
    VENDORS
      .filter(v => (!resultsCat || (v.categories ?? []).includes(resultsCat)))
      .filter(v => (!fitsOnly || v.fitsMyGarage))
      .filter(v => !q || v.name.toLowerCase().includes(q) || v.desc.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name)),
    [resultsCat, fitsOnly, q],
  );
  const filteredProducts = useMemo(() =>
    VPRODS
      .filter(p => (!vendorIdsInCat || vendorIdsInCat.has(p.vendorId)))
      .filter(p => (!fitsOnly || (p.fitsSelectedCar ?? productFitsGarage(p).fits)))
      .filter(p => !q || p.name.toLowerCase().includes(q) || (p.brand ?? '').toLowerCase().includes(q)),
    [vendorIdsInCat, fitsOnly, q],
  );

  const featuredVendors = useMemo(() => [...VENDORS].sort((a, b) => Number(b.fitsMyGarage ?? false) - Number(a.fitsMyGarage ?? false)).slice(0, 8), []);
  const trendingProducts = useMemo(() => VPRODS.filter(p => p.img && (p.badge === 'pop' || p.badge === 'new')).slice(0, 10), []);

  const detailSheets = (
    <>
      <Modal visible={!!vendorSheet} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setVendorSheet(null)}>
        {vendorSheet && <VStore vendor={vendorSheet} onBack={() => setVendorSheet(null)} />}
      </Modal>
      <Modal visible={!!productSheet} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setProductSheet(null)}>
        {productSheet && <ProductDetailScreen product={productSheet} onBack={() => setProductSheet(null)} />}
      </Modal>
    </>
  );

  /* ── SCREEN 2 — RESULTS ── */
  if (view === 'results') {
    return (
      <View style={{ flex: 1, backgroundColor: '#0D1117' }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingTop: 12 }}>
          <TouchableOpacity onPress={backToHub} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="chevron-back" size={26} color="#F0F6FC" />
          </TouchableOpacity>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#161B22', borderRadius: 12, borderWidth: 1, borderColor: '#1E2630', paddingHorizontal: 12, height: 40 }}>
            <Ionicons name="search" size={16} color="#8B949E" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={resultsCat ? CAT_TITLE[resultsCat] || resultsCat : 'Search parts & brands'}
              placeholderTextColor="#8B949E"
              style={{ flex: 1, color: '#F0F6FC', fontSize: 14, paddingVertical: 0 }}
              autoFocus={!resultsCat}
            />
            {query ? <TouchableOpacity onPress={() => setQuery('')}><Ionicons name="close-circle" size={16} color="#8B949E" /></TouchableOpacity> : null}
          </View>
        </View>

        {/* Segmented */}
        <View style={{ flexDirection: 'row', backgroundColor: '#161B22', borderRadius: 12, borderWidth: 1, borderColor: '#1E2630', marginHorizontal: 16, marginTop: 12, padding: 4 }}>
          {(['vendors', 'products'] as const).map(s => (
            <TouchableOpacity key={s} onPress={() => setSeg(s)} style={{ flex: 1, paddingVertical: 8, borderRadius: 9, backgroundColor: seg === s ? T.accent : 'transparent', alignItems: 'center' }}>
              <Text style={{ fontWeight: '800', fontSize: 14, color: seg === s ? '#04110E' : '#8B949E' }}>{s === 'vendors' ? 'Vendors' : 'Products'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sub-header: title + fits toggle */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 12 }}>
          <Text style={{ color: '#8B949E', fontSize: 13 }}>
            {seg === 'vendors' ? `${filteredVendors.length} vendors` : `${filteredProducts.length} products`}
            {resultsCat ? ` · ${CAT_TITLE[resultsCat] || resultsCat}` : ''}
          </Text>
          <FitsToggle on={fitsOnly} onToggle={() => setFitsOnly(v => !v)} />
        </View>

        <ScrollView style={{ flex: 1, marginTop: 12 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {seg === 'vendors' ? (
            filteredVendors.length === 0 ? (
              <Text style={{ color: '#8B949E', fontSize: 13, paddingHorizontal: 16 }}>No vendors match.</Text>
            ) : filteredVendors.map(vendor => (
              <View key={vendor.id} style={{ paddingHorizontal: 16, marginBottom: 12 }}>
                <VendorCard vendor={vendor} onPress={() => setVendorSheet(vendor)} />
              </View>
            ))
          ) : (
            filteredProducts.length === 0 ? (
              <Text style={{ color: '#8B949E', fontSize: 13, paddingHorizontal: 16 }}>No products match.</Text>
            ) : filteredProducts.map((p, i) => (
              <View key={i} style={{ paddingHorizontal: 16, marginBottom: 8 }}>
                <VendorProductRow product={p} onPress={() => setProductSheet(p)} />
              </View>
            ))
          )}
          <View style={{ height: 32 }} />
        </ScrollView>
        {detailSheets}
      </View>
    );
  }

  /* ── SCREEN 1 — HUB ── */
  return (
    <View style={{ flex: 1, backgroundColor: '#0D1117' }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 28, fontWeight: '800', color: '#F0F6FC', paddingHorizontal: 16, paddingTop: 12 }}>Vendors</Text>

        {/* Search (opens Results) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => openResults(null, 'products')}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#161B22', borderRadius: 12, borderWidth: 1, borderColor: '#1E2630', marginHorizontal: 16, marginTop: 14, paddingHorizontal: 12, height: 44 }}
        >
          <Ionicons name="search" size={16} color="#8B949E" />
          <Text style={{ color: '#8B949E', fontSize: 14 }}>Search parts & brands</Text>
        </TouchableOpacity>

        {/* Fits toggle */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginTop: 14 }}>
          <FitsToggle on={fitsOnly} onToggle={() => setFitsOnly(v => !v)} />
        </View>

        {/* Category grid (hero) */}
        <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 2, color: '#8B949E', paddingHorizontal: 16, marginTop: 22, marginBottom: 10 }}>SHOP BY CATEGORY</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP, paddingHorizontal: 16 }}>
          {VENDOR_CATEGORIES.map(cat => {
            const count = VENDORS.filter(v => (v.categories ?? []).includes(cat)).length;
            return (
              <TouchableOpacity
                key={cat}
                activeOpacity={0.8}
                onPress={() => openResults(cat, 'vendors')}
                style={{ width: TILE_W, padding: 12, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12 }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#F0F6FC' }} numberOfLines={1}>{CAT_TITLE[cat] || cat}</Text>
                <Text style={{ fontSize: 11, color: '#C9D1D9', marginTop: 4, lineHeight: 15 }} numberOfLines={2}>{CAT_SUBTITLE[cat]}</Text>
                <Text style={{ fontSize: 11, color: T.accent, marginTop: 6, fontWeight: '600' }}>{count} brand{count === 1 ? '' : 's'}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Featured Vendors shelf */}
        <View style={{ marginTop: 26 }}>
          <SectionHeader title="FEATURED VENDORS" onSeeAll={() => openResults(null, 'vendors')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
            {featuredVendors.map((v, i) => <VendorShelfCard key={v.id} vendor={v} sale={i === 0} onPress={() => setVendorSheet(v)} />)}
          </ScrollView>
        </View>

        {/* Trending Products shelf */}
        {trendingProducts.length > 0 && (
          <View style={{ marginTop: 26 }}>
            <SectionHeader title="TRENDING PRODUCTS" onSeeAll={() => openResults(null, 'products')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
              {trendingProducts.map((p, i) => <ProductShelfCard key={i} product={p} onPress={() => setProductSheet(p)} />)}
            </ScrollView>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
      {detailSheets}
    </View>
  );
}
