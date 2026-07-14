import React from 'react';
import { Text, TouchableOpacity, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export function ModifiedAppleButton({ onPress }: { onPress?: () => void }) {
  return (
    <TouchableOpacity onPress={onPress || (() => Alert.alert('Apple Sign In', 'Coming soon'))} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: 15, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12 }}>
      <Ionicons name="logo-apple" size={18} color="white" />
      <Text style={{ fontSize: 14, fontWeight: '600', color: 'white' }}>Continue with Apple</Text>
    </TouchableOpacity>
  );
}
