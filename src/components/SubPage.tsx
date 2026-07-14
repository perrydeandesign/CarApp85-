import React, { type ReactNode } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { T } from '../constants/theme';

type Props = {
  title: string;
  onBack: () => void;
  children: ReactNode;
};

export function SubPage({ title, onBack, children }: Props) {
  return (
    <View style={StyleSheet.absoluteFill}>
      <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            borderBottomWidth: 1,
            borderBottomColor: T.bd,
          }}
        >
          <TouchableOpacity onPress={onBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="chevron-back" size={26} color={T.wh} />
          </TouchableOpacity>
          <Text style={{ color: T.wh, fontSize: 17, fontWeight: '700', marginLeft: 12 }}>{title}</Text>
        </View>
        <View style={{ flex: 1 }}>{children}</View>
      </SafeAreaView>
    </View>
  );
}
