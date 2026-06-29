import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { T } from '../constants/theme';
import { ModifiedGradientBg, MODIFIED_TAGLINE } from '../onboarding/components/gradients';
import { ModifiedLogo } from '../onboarding/components/ModifiedLogo';
import { ModifiedTextField } from '../onboarding/components/ModifiedTextField';
import { ModifiedPrimaryButton } from '../onboarding/components/ModifiedPrimaryButton';

import { signUpWithEmail } from '../auth/emailAuth';

export default function Signup() {
  const navigation = useNavigation<any>();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSignup = async () => {
    if (!username.trim() || !email.trim() || !password) {
      Alert.alert('Missing details', 'Please fill in username, email, and password.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Password too short', 'Use at least 6 characters.');
      return;
    }

    try {
      setSubmitting(true);
      const data = await signUpWithEmail(email.trim(), password, username.trim());
      if (data.session) {
        // Auto-signed-in; AppNavigator will swap to MainNavigator.
        return;
      }
      Alert.alert(
        'Check your email',
        'We sent a confirmation link to ' + email.trim() + '. Confirm to finish creating your account.',
      );
      navigation.navigate('Login');
    } catch (err: any) {
      Alert.alert('Sign-up Failed', err?.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModifiedGradientBg>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ alignItems: 'center', paddingTop: 40, marginBottom: 28 }}>
            <ModifiedLogo />
            <Text style={{ fontSize: 14, color: '#888', marginTop: 12 }}>
              {MODIFIED_TAGLINE}
            </Text>
          </View>

          <ModifiedTextField label="USERNAME" value={username} onChangeText={setUsername} />
          <ModifiedTextField label="EMAIL" value={email} onChangeText={setEmail} />
          <ModifiedTextField
            label="PASSWORD"
            value={password}
            onChangeText={setPassword}
            secure={!showPassword}
            showToggle
            showPassword={showPassword}
            onToggle={() => setShowPassword(p => !p)}
          />
          <ModifiedTextField
            label="CONFIRM PASSWORD"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secure={!showConfirmPassword}
            showToggle
            showPassword={showConfirmPassword}
            onToggle={() => setShowConfirmPassword(p => !p)}
          />

          <ModifiedPrimaryButton
            title={submitting ? 'Creating account…' : 'Create Account'}
            onPress={handleSignup}
          />

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 4,
              marginTop: 24,
            }}
          >
            <Text style={{ fontSize: 13, color: '#888' }}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={{ fontSize: 13, color: T.accent }}>Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ModifiedGradientBg>
  );
}
