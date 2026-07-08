import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { T } from '../constants/theme';
import { ModifiedGradientBg, MODIFIED_TAGLINE } from '../onboarding/components/gradients';
import { ModifiedLogo } from '../onboarding/components/ModifiedLogo';
import { ModifiedTextField } from '../onboarding/components/ModifiedTextField';
import { ModifiedPrimaryButton } from '../onboarding/components/ModifiedPrimaryButton';
import { PolicyScreen } from '../components/settings/PolicyScreen';
import {
  TERMS_OF_USE,
  PRIVACY_POLICY,
  COMMUNITY_GUIDELINES,
  POLICY_LAST_UPDATED,
} from './Settings/policies';

import { signUpWithEmail } from '../auth/emailAuth';

type PolicyKey = 'terms' | 'privacy' | 'guidelines';
const POLICY_DOCS: Record<PolicyKey, { title: string; body: string }> = {
  terms: { title: 'Terms of Use', body: TERMS_OF_USE },
  privacy: { title: 'Privacy Policy', body: PRIVACY_POLICY },
  guidelines: { title: 'Community Guidelines', body: COMMUNITY_GUIDELINES },
};

export default function Signup() {
  const navigation = useNavigation<any>();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [policy, setPolicy] = useState<PolicyKey | null>(null);
  const [agreed, setAgreed] = useState(false);

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
    if (!agreed) {
      Alert.alert(
        'Please agree to continue',
        'You must accept the Terms of Use and Community Guidelines, and our zero-tolerance policy, to create an account.',
      );
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
      const msg =
        err?.message ||
        err?.error_description ||
        err?.statusText ||
        (typeof err === 'string' ? err : `HTTP ${err?.status ?? '?'}`);
      Alert.alert('Sign-up Failed', msg);
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
            <Text style={{ fontSize: 14, color: '#C9D1D9', marginTop: 12 }}>
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

          {/* App Review 1.2 (UGC): REQUIRED acceptance of terms + zero-tolerance policy. */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setAgreed(a => !a)}
            style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 8, marginBottom: 16 }}
          >
            <Ionicons
              name={agreed ? 'checkbox' : 'square-outline'}
              size={22}
              color={agreed ? T.accent : '#8B949E'}
              style={{ marginTop: 1 }}
            />
            <Text style={{ flex: 1, fontSize: 12, color: '#8B949E', lineHeight: 18 }}>
              I agree to the{' '}
              <Text style={{ color: T.accent }} onPress={() => setPolicy('terms')}>Terms of Use</Text>{' '}
              and{' '}
              <Text style={{ color: T.accent }} onPress={() => setPolicy('guidelines')}>Community Guidelines</Text>
              , acknowledge the{' '}
              <Text style={{ color: T.accent }} onPress={() => setPolicy('privacy')}>Privacy Policy</Text>
              , and understand MODIFIED has zero tolerance for objectionable content or abusive behaviour.
            </Text>
          </TouchableOpacity>

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
            <Text style={{ fontSize: 13, color: '#C9D1D9' }}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={{ fontSize: 13, color: T.accent }}>Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <Modal
          visible={policy !== null}
          animationType="slide"
          onRequestClose={() => setPolicy(null)}
        >
          {policy !== null && (
            <PolicyScreen
              title={POLICY_DOCS[policy].title}
              lastUpdated={POLICY_LAST_UPDATED}
              body={POLICY_DOCS[policy].body}
              onBack={() => setPolicy(null)}
            />
          )}
        </Modal>
      </SafeAreaView>
    </ModifiedGradientBg>
  );
}
