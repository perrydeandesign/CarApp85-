import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { T, IC, TYPO } from '../../constants/theme';
import type { Vendor, VProduct } from '../../constants/types';
import { VPRODS, productFitsGarage } from '../../data/vendors';
import { decorateUrl } from '../../lib/affiliate';
import { useShare } from '../../components/ShareProvider';
import { Button } from '../../ui/Button';
import { ProductDetailScreen } from './ProductDetail';

export function VendorProductRow({ product, onPress }: { product: VProduct; onPress: () => void }) {
  const fits = product.fitsSelectedCar ?? productFitsGarage(product).fits;
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 12 }}>
      {/* Product image */}
      <View style={{ width: 72, height: 72, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        {product.img ? (
          <Image source={{ uri: product.img }} style={{ width: 72, height: 72 }} resizeMode="cover" />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="cube-outline" size={28} color="rgba(255,255,255,0.15)" />
          </View>
        )}
      </View>
      {/* Name, brand, price */}
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#F0F6FC', marginBottom: 3 }} numberOfLines={2}>{product.name}</Text>
        {product.brand ? <Text style={{ fontSize: 12, color: '#C9D1D9', marginBottom: 4 }}>{product.brand}</Text> : null}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: T.accent }}>${product.price}</Text>
          {product.was ? <Text style={{ fontSize: 12, color: '#C9D1D9', textDecorationLine: 'line-through' }}>${product.was}</Text> : null}
        </View>
      </View>
      {/* Fits checkmark */}
      {fits && <Ionicons name="checkmark-circle" size={22} color={T.accent} />}
    </TouchableOpacity>
  );
}

export function VStore({ vendor, onBack }: { vendor: Vendor; onBack?: () => void }) {
  const [selectedProduct, setSelectedProduct] = useState<VProduct | null>(null);
  const [following, setFollowing] = useState(false);
  const [contacted, setContacted] = useState(false);
  const { share } = useShare();
  const vendorProds = VPRODS.filter(p => p.vendorId === vendor.id)
    .sort((a, b) => {
      const aFits = a.fitsSelectedCar ?? productFitsGarage(a).fits;
      const bFits = b.fitsSelectedCar ?? productFitsGarage(b).fits;
      if (aFits === bFits) return a.name.localeCompare(b.name);
      return aFits ? -1 : 1;
    });
  const cats = vendor.categories ?? [];

  if (selectedProduct) return <ProductDetailScreen product={selectedProduct} onBack={() => setSelectedProduct(null)} />;
  return (
    <View style={{ flex: 1, backgroundColor: '#0D1117' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero image */}
        <View style={{ height: 220, backgroundColor: vendor.color }}>
          {vendor.heroImg ? (
            <Image source={{ uri: vendor.heroImg }} style={{ width: '100%', height: 220 }} resizeMode="cover" />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="car-sport" size={80} color={T.wh} style={{ opacity: 0.2 }} />
            </View>
          )}
          {onBack && (
            <TouchableOpacity onPress={onBack} style={{ position: 'absolute', top: 12, left: 12, zIndex: 10, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="chevron-back" size={IC.back} color={T.wh} />
            </TouchableOpacity>
          )}
        </View>

        {/* Vendor info */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#F0F6FC' }}>{vendor.name}</Text>
          <Text style={{ fontSize: 15, color: '#C9D1D9', lineHeight: 22, marginTop: 8 }}>{vendor.desc}</Text>
          {cats.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {cats.map(c => (
                <View key={c} style={{ paddingHorizontal: 8, paddingVertical: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
                  <Text style={{ fontSize: 11, fontWeight: '500', color: T.accent }}>{c}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Action Bar — Follow (primary) + unified text-only pills:
            Website · Share · Contact (mirrors the user profile layout, no icons). */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, paddingHorizontal: 16, marginTop: 16 }}>
          <Button
            label={following ? 'Following' : 'Follow'}
            variant={following ? 'ghost' : 'primary'}
            size="sm"
            onPress={() => setFollowing(f => !f)}
          />
          <Button
            label="Website"
            variant="ghost"
            size="sm"
            tint="#60A5FA"
            onPress={() => { const u = decorateUrl(vendor.website, vendor.id, 'visit'); if (u) Linking.openURL(u); }}
          />
          <Button
            label="Share"
            variant="secondary"
            size="sm"
            onPress={() => share({ title: vendor.name, message: `Check out ${vendor.name} on MODIFIED`, url: decorateUrl(vendor.website, vendor.id, 'share') ?? undefined })}
          />
          <Button
            label={contacted ? 'Sent!' : 'Contact'}
            variant="ghost"
            size="sm"
            tint="#FBBF24"
            onPress={() => { setContacted(true); setTimeout(() => setContacted(false), 2500); }}
          />
        </View>

        {/* Products */}
        <View style={{ marginTop: 24 }}>
          <Text style={{ ...TYPO.h2, color: T.tx, paddingHorizontal: 16, marginBottom: 12 }}>Products</Text>
          <View style={{ paddingHorizontal: 16, gap: 12 }}>
            {vendorProds.map((p, i) => (
              <VendorProductRow key={i} product={p} onPress={() => setSelectedProduct(p)} />
            ))}
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}
