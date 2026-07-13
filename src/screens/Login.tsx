import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Alert,
  Linking
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { T } from '../constants/theme';
import { ModifiedGradientBg, MODIFIED_TAGLINE } from '../onboarding/components/gradients';
import { ModifiedLogo } from '../onboarding/components/ModifiedLogo';
import { ModifiedTextField } from '../onboarding/components/ModifiedTextField';
import { ModifiedPrimaryButton } from '../onboarding/components/ModifiedPrimaryButton';
import { ModifiedAppleButton } from '../onboarding/components/ModifiedAppleButton';
import { Button } from '../ui/Button';

import { configureGoogle, signInWithGoogle, isGoogleConfigured } from '../auth/googleAuth';
import { signInWithApple, isAppleConfigured } from '../auth/appleAuth';
import { signInWithEmail, sendPasswordReset } from '../auth/emailAuth';

// ⭐ Navigation
import { useNavigation } from '@react-navigation/native';

export default function Login() {
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Google config
  useEffect(() => {
    configureGoogle();
  }, []);

  // Email login — AppNavigator swaps to MainNavigator automatically once the
  // Supabase session updates via onAuthStateChange, so no manual nav needed.
  const handleEmailLogin = async () => {
    try {
      if (!email || !password) {
        Alert.alert('Missing details', 'Please enter email and password.');
        return;
      }
      await signInWithEmail(email.trim(), password);
    } catch (err: any) {
      const msg =
        err?.message ||
        err?.error_description ||
        err?.statusText ||
        (typeof err === 'string' ? err : `HTTP ${err?.status ?? '?'}`);
      Alert.alert('Login Failed', msg);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      const msg =
        err?.message ||
        err?.error_description ||
        err?.statusText ||
        (typeof err === 'string' ? err : `HTTP ${err?.status ?? '?'}`);
      Alert.alert('Google Sign-In Failed', msg);
    }
  };

  const handleAppleLogin = async () => {
    try {
      await signInWithApple();
    } catch (err: any) {
      const msg =
        err?.message ||
        err?.error_description ||
        err?.statusText ||
        (typeof err === 'string' ? err : `HTTP ${err?.status ?? '?'}`);
      Alert.alert('Apple Sign-In Failed', msg);
    }
  };

  // ⭐ Forgot password — sends a reset email to the address already entered.
  // (There is no ForgotPassword screen; navigating to one crashed.)
  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Enter your email', 'Type your email above, then tap "Forgot password" to get a reset code.');
      return;
    }
    try {
      await sendPasswordReset(email.trim());
      // Move to the reset screen where the user enters the emailed code + new password.
      navigation.navigate('ResetPassword', { email: email.trim() });
    } catch (err: any) {
      Alert.alert('Could not send reset email', err?.message ?? String(err));
    }
  };

  // ⭐ Signup
  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  return (
    <ModifiedGradientBg>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo + tagline */}
          <View style={{ alignItems: 'center', paddingTop: 40, marginBottom: 28 }}>
            <ModifiedLogo />
            <Text style={{ fontSize: 14, color: '#C9D1D9', marginTop: 12 }}>
              {MODIFIED_TAGLINE}
            </Text>
          </View>

          {/* Email */}
          <ModifiedTextField
            label="EMAIL"
            value={email}
            onChangeText={setEmail}
          />

          {/* Password */}
          <ModifiedTextField
            label="PASSWORD"
            value={password}
            onChangeText={setPassword}
            secure={!showPassword}
            showToggle
            showPassword={showPassword}
            onToggle={() => setShowPassword(p => !p)}
          />

          {/* Forgot password */}
          <TouchableOpacity
            onPress={handleForgotPassword}
            style={{ alignSelf: 'flex-end', marginBottom: 20, marginTop: -8 }}
          >
            <Text style={{ fontSize: 12, color: T.accent }}>Forgot password</Text>
          </TouchableOpacity>

          {/* Email login */}
          <ModifiedPrimaryButton title="Log In" onPress={handleEmailLogin} />

          {/* Apple login — hidden until the native "Sign in with Apple"
              capability + Supabase Apple provider are configured (never ship a
              dead button; App Review 2.1). See docs/APPLE_SIGNIN_SETUP.md. */}
          {isAppleConfigured() && (
            <View style={{ marginTop: 12 }}>
              <ModifiedAppleButton onPress={handleAppleLogin} />
            </View>
          )}

          {/* Google login — hidden until real OAuth client IDs are configured
              (never ship a dead button; App Review 2.1). */}
          {isGoogleConfigured() && (
            <Button
              label="Continue with Google"
              icon="logo-google"
              variant="secondary"
              size="lg"
              fullWidth
              onPress={handleGoogle}
              style={{ marginTop: 12 }}
            />
          )}

          {/* Signup link */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 4,
              marginTop: 24
            }}
          >
            <Text style={{ fontSize: 13, color: '#C9D1D9' }}>
              Don't have an account?
            </Text>
            <TouchableOpacity onPress={handleSignup}>
              <Text style={{ fontSize: 13, color: T.accent }}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ModifiedGradientBg>
  );
}
