import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { T, IC } from '../../constants/theme';
import type { VProduct } from '../../constants/types';
import { VENDORS, productFitsGarage } from '../../data/vendors';
import { productKey } from '../../data/productKey';
import { resolveBuyUrl } from '../../lib/affiliate';
import { useSavedProducts } from '../../hooks/useSavedProducts';
import { useShare } from '../../components/ShareProvider';

export function ProductDetailScreen({ product, onBack }: { product: VProduct; onBack: () => void }) {
  const fits = product.fitsSelectedCar ?? productFitsGarage(product).fits;
  const vendor = VENDORS.find(v => v.id === product.vendorId);
  const { share } = useShare();
  const { isSaved, toggle } = useSavedProducts();
  const key = productKey(product);
  const saved = isSaved(key);
  // Every outbound tap resolves to a working product page (or a live product
  // search) and is decorated with affiliate/attribution params.
  const buyUrl = resolveBuyUrl(product);
  const shareUrl = resolveBuyUrl(product, 'share');
  return (
    <View style={{ flex: 1, backgroundColor: '#0D1117' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={{ height: 260, backgroundColor: product.color }}>
          {product.img ? (
            <Image source={{ uri: product.img }} style={{ width: '100%', height: 260 }} resizeMode="cover" />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="cube-outline" size={80} color={T.wh} style={{ opacity: 0.2 }} />
            </View>
          )}
          <TouchableOpacity onPress={onBack} style={{ position: 'absolute', top: 12, left: 12, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="chevron-back" size={IC.back} color={T.wh} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => toggle(key)}
            style={{ position: 'absolute', top: 12, right: 58, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={18} color={saved ? T.accent : T.wh} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => share({
              title: product.name,
              message: `Check out the ${product.name}${product.brand ? ` by ${product.brand}` : ''} on MODIFIED`,
              url: shareUrl ?? undefined,
              imageUri: product.img,
            })}
            style={{ position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="share-outline" size={18} color={T.wh} />
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#F0F6FC' }}>{product.name}</Text>
          {product.brand ? <Text style={{ fontSize: 14, color: '#C9D1D9', marginTop: 4 }}>{product.brand}</Text> : null}

          {/* Price */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: T.accent }}>${product.price}</Text>
            {product.was ? <Text style={{ fontSize: 14, color: '#C9D1D9', textDecorationLine: 'line-through' }}>${product.was}</Text> : null}
          </View>

          {/* Fits your car */}
          {fits && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }}>
              <Ionicons name="checkmark-circle" size={18} color={T.accent} />
              <Text style={{ fontSize: 12, color: T.accent }}>Fits your car</Text>
            </View>
          )}

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginTop: 16 }} />

          {/* Fitment */}
          <Text style={{ fontSize: 17, fontWeight: '700', color: '#F0F6FC', marginTop: 16 }}>Fitment</Text>
          <Text style={{ fontSize: 15, color: '#C9D1D9', lineHeight: 22, marginTop: 6 }}>{product.fitment || product.compat}</Text>

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginTop: 16 }} />

          {/* Description */}
          <Text style={{ fontSize: 17, fontWeight: '700', color: '#F0F6FC', marginTop: 16 }}>Description</Text>
          <Text style={{ fontSize: 15, color: '#C9D1D9', lineHeight: 22, marginTop: 6 }}>{product.desc}</Text>

          {/* Subtle Buy now — opens the vendor's product page (affiliate-decorated) */}
          {buyUrl ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => Linking.openURL(buyUrl)}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, alignSelf: 'flex-start', marginTop: 16, borderWidth: 1, borderColor: T.accent, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 9 }}
            >
              <Text style={{ color: T.accent, fontSize: 13, fontWeight: '700' }}>Buy now</Text>
              <Ionicons name="open-outline" size={14} color={T.accent} />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}
