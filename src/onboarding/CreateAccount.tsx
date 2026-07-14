import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, StatusBar, Alert } from 'react-native';
import { ModifiedGradientBg, MODIFIED_TAGLINE } from './components/gradients';
import { ModifiedLogo } from './components/ModifiedLogo';
import { ModifiedTextField } from './components/ModifiedTextField';
import { ModifiedPrimaryButton } from './components/ModifiedPrimaryButton';
import { ModifiedAppleButton } from './components/ModifiedAppleButton';

export function CreateAccountScreen({ onContinue, onLogin }: { onContinue: () => void; onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  return (
    <ModifiedGradientBg>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: 'center', paddingTop: 40, marginBottom: 28 }}>
            <ModifiedLogo />
            <Text style={{ fontSize: 14, color: '#C9D1D9', marginTop: 12 }}>{MODIFIED_TAGLINE}</Text>
          </View>

          <ModifiedTextField label="USERNAME" value={username} onChangeText={setUsername} />
          <ModifiedTextField label="EMAIL" value={email} onChangeText={setEmail} />
          <ModifiedTextField label="PASSWORD" value={password} onChangeText={setPassword} secure={!showPassword} showToggle showPassword={showPassword} onToggle={() => setShowPassword(p => !p)} />
          <ModifiedTextField label="CONFIRM PASSWORD" value={confirmPassword} onChangeText={setConfirmPassword} secure={!showConfirmPassword} showToggle showPassword={showConfirmPassword} onToggle={() => setShowConfirmPassword(p => !p)} />

          <ModifiedPrimaryButton title="Continue" onPress={() => {
            if (!username.trim() || !email.trim()) { Alert.alert('Required Fields', 'Please fill in Username and Email.'); return; }
            onContinue();
          }} />
          <View style={{ marginTop: 12 }}><ModifiedAppleButton /></View>

          {/* Why MODIFIED */}
          <View style={{ alignItems: 'center', marginTop: 28 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: 'white', marginBottom: 8 }}>Why MODIFIED?</Text>
            {['Follow builds', 'Track your mods', 'Connect with vendors', 'Share your journey'].map((t, i) => (
              <Text key={i} style={{ fontSize: 12, color: '#C9D1D9', marginTop: 4 }}>• {t}</Text>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ModifiedGradientBg>
  );
}
