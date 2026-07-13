import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, StatusBar, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { T } from '../../constants/theme';
import { ModifiedGradientBg } from '../../onboarding/components/gradients';
import { ModifiedLogo } from '../../onboarding/components/ModifiedLogo';
import { ModifiedTextField } from '../../onboarding/components/ModifiedTextField';
import { ModifiedPrimaryButton } from '../../onboarding/components/ModifiedPrimaryButton';
import {
  verifyEmailOtp,
  resendSignupOtp,
  verifyRecoveryOtp,
  updatePassword,
  sendPasswordReset,
} from '../../auth/emailAuth';

function errMsg(err: any): string {
  const m =
    err?.message ||
    err?.error_description ||
    err?.statusText ||
    (typeof err === 'string' ? err : '');
  // Guard against raw HTTP/response bodies leaking into an alert (e.g. a 500).
  if (m && m.length <= 140) return m;
  return 'Something went wrong. Please try again in a moment.';
}

function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <ModifiedGradientBg>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: 'center', paddingTop: 40, marginBottom: 24 }}>
            <ModifiedLogo />
          </View>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#fff', textAlign: 'center' }}>{title}</Text>
          <Text style={{ fontSize: 13, color: '#C9D1D9', textAlign: 'center', marginTop: 8, marginBottom: 24, lineHeight: 19 }}>
            {subtitle}
          </Text>
          {children}
        </ScrollView>
      </SafeAreaView>
    </ModifiedGradientBg>
  );
}

// ── VERIFY EMAIL (signup confirmation code) ─────────────────────────────────
export function VerifyEmailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const email: string = route.params?.email ?? '';
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const verify = async () => {
    if (code.trim().length < 6) {
      Alert.alert('Enter the code', 'Enter the 6-digit code from your email.');
      return;
    }
    try {
      setBusy(true);
      await verifyEmailOtp(email, code);
      // Success → Supabase sets a session; AppNavigator swaps to the app.
    } catch (err: any) {
      Alert.alert('Verification failed', errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    try {
      await resendSignupOtp(email);
      Alert.alert('Code sent', `We sent a new code to ${email}.`);
    } catch (err: any) {
      Alert.alert('Could not resend', errMsg(err));
    }
  };

  return (
    <AuthShell title="Verify your email" subtitle={`Enter the 6-digit code we sent to ${email} to finish creating your account.`}>
      <ModifiedTextField label="VERIFICATION CODE" value={code} onChangeText={setCode} />
      <ModifiedPrimaryButton title={busy ? 'Verifying…' : 'Verify'} onPress={verify} />
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: 20 }}>
        <Text style={{ fontSize: 13, color: '#C9D1D9' }}>Didn’t get it?</Text>
        <TouchableOpacity onPress={resend}>
          <Text style={{ fontSize: 13, color: T.accent }}>Resend code</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 16, alignSelf: 'center' }}>
        <Text style={{ fontSize: 13, color: '#C9D1D9' }}>Back to log in</Text>
      </TouchableOpacity>
    </AuthShell>
  );
}

// ── RESET PASSWORD (recovery code + new password) ───────────────────────────
export function ResetPasswordScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const email: string = route.params?.email ?? '';
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (code.trim().length < 6) {
      Alert.alert('Enter the code', 'Enter the 6-digit code from your email.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Password too short', 'Use at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Passwords don’t match', 'Re-enter the same password.');
      return;
    }
    try {
      setBusy(true);
      await verifyRecoveryOtp(email, code); // establishes a recovery session
      await updatePassword(password); // sets the new password
      Alert.alert('Password updated', 'You’re all set — you’re now signed in.');
      // Session is active → AppNavigator swaps to the app.
    } catch (err: any) {
      Alert.alert('Could not reset password', errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    try {
      await sendPasswordReset(email);
      Alert.alert('Code sent', `We sent a new reset code to ${email}.`);
    } catch (err: any) {
      Alert.alert('Could not resend', errMsg(err));
    }
  };

  return (
    <AuthShell title="Reset password" subtitle={`Enter the 6-digit code sent to ${email}, then choose a new password.`}>
      <ModifiedTextField label="RESET CODE" value={code} onChangeText={setCode} />
      <ModifiedTextField
        label="NEW PASSWORD"
        value={password}
        onChangeText={setPassword}
        secure={!show}
        showToggle
        showPassword={show}
        onToggle={() => setShow((s) => !s)}
      />
      <ModifiedTextField
        label="CONFIRM PASSWORD"
        value={confirm}
        onChangeText={setConfirm}
        secure={!show}
      />
      <ModifiedPrimaryButton title={busy ? 'Updating…' : 'Update password'} onPress={submit} />
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: 20 }}>
        <Text style={{ fontSize: 13, color: '#C9D1D9' }}>Didn’t get it?</Text>
        <TouchableOpacity onPress={resend}>
          <Text style={{ fontSize: 13, color: T.accent }}>Resend code</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 16, alignSelf: 'center' }}>
        <Text style={{ fontSize: 13, color: '#C9D1D9' }}>Back to log in</Text>
      </TouchableOpacity>
    </AuthShell>
  );
}
