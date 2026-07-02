import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { T, IC } from '../../constants/theme';
import type { VProduct } from '../../constants/types';
import { VENDORS, productFitsGarage } from '../../data/vendors';

export function ProductDetailScreen({ product, onBack }: { product: VProduct; onBack: () => void }) {
  const fits = product.fitsSelectedCar ?? productFitsGarage(product).fits;
  const vendor = VENDORS.find(v => v.id === product.vendorId);
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
        </View>

        {/* Product Info */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: 'white' }}>{product.name}</Text>
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
          <Text style={{ fontSize: 17, fontWeight: '700', color: 'white', marginTop: 16 }}>Fitment</Text>
          <Text style={{ fontSize: 15, color: '#C9D1D9', lineHeight: 22, marginTop: 6 }}>{product.fitment || product.compat}</Text>

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginTop: 16 }} />

          {/* Description */}
          <Text style={{ fontSize: 17, fontWeight: '700', color: 'white', marginTop: 16 }}>Description</Text>
          <Text style={{ fontSize: 15, color: '#C9D1D9', lineHeight: 22, marginTop: 6 }}>{product.desc}</Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}
