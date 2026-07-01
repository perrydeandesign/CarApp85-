import React, { useState } from 'react';
import { View, Text, SafeAreaView, StatusBar, TouchableOpacity, Alert } from 'react-native';
import { T } from '../constants/theme';
import { ModifiedGradientBg, MODIFIED_TAGLINE } from './components/gradients';
import { ModifiedLogo } from './components/ModifiedLogo';
import { ModifiedTextField } from './components/ModifiedTextField';
import { ModifiedPrimaryButton } from './components/ModifiedPrimaryButton';

export function PasswordResetScreen({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  return (
    <ModifiedGradientBg>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
        <View style={{ flex: 1, paddingHorizontal: 24 }}>
          <View style={{ alignItems: 'center', paddingTop: 40, marginBottom: 28 }}>
            <ModifiedLogo />
            <Text style={{ fontSize: 14, color: '#C9D1D9', marginTop: 12 }}>{MODIFIED_TAGLINE}</Text>
          </View>

          <ModifiedTextField label="EMAIL" value={email} onChangeText={setEmail} />

          <ModifiedPrimaryButton title={sent ? 'Sent!' : 'Send Reset Link'} onPress={() => {
            if (!email.trim()) { Alert.alert('Email Required', 'Please enter your email.'); return; }
            setSent(true); setTimeout(() => setSent(false), 3000);
          }} />

          <TouchableOpacity onPress={onBack} style={{ alignItems: 'center', marginTop: 16 }}>
            <Text style={{ fontSize: 12, color: T.accent }}>Back to Log In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ModifiedGradientBg>
  );
}
