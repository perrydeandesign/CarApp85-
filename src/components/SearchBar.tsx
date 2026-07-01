import React from 'react';
import { TextInput, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { T } from '../constants/theme';

type Props = {
  value: string;
  onChangeText: (s: string) => void;
  placeholder?: string;
};

export function SearchBar({ value, onChangeText, placeholder = 'Search' }: Props) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: T.card,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 40,
        marginHorizontal: 16,
        marginVertical: 8,
      }}
    >
      <Ionicons name="search" size={16} color={T.mu} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={T.mu}
        style={{ flex: 1, color: T.wh, marginLeft: 8, padding: 0 }}
      />
    </View>
  );
}
