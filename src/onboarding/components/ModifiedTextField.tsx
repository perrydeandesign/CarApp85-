import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { T } from '../../constants/theme';

export function ModifiedTextField({ label, value, onChangeText, secure, showToggle, showPassword, onToggle }: {
  label: string; value: string; onChangeText: (v: string) => void; secure?: boolean;
  showToggle?: boolean; showPassword?: boolean; onToggle?: () => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 11, fontWeight: '600', color: focused ? T.accent : '#888', letterSpacing: 1, marginBottom: 6 }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgb(18,23,28)', borderRadius: 12, borderWidth: 1, borderColor: focused ? T.accent : 'transparent', paddingHorizontal: 16 }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ flex: 1, paddingVertical: 14, fontSize: 14, color: 'white' }}
          placeholderTextColor="#555"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {showToggle && onToggle && (
          <TouchableOpacity onPress={onToggle}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#C9D1D9" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
