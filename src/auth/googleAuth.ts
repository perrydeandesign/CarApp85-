// src/auth/googleAuth.ts
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID, GOOGLE_IOS_CLIENT_ID } from '@env';
import { supabase } from '../lib/supabase';

/**
 * True only when real OAuth client IDs are present (not the placeholders).
 * The Login screen uses this to hide the Google button until it's configured,
 * so we never ship a dead button (App Review guideline 2.1).
 */
export const isGoogleConfigured = (): boolean => {
  const ok = (v?: string) => !!v && !v.startsWith('YOUR_') && v.includes('.apps.googleusercontent.com');
  return ok(GOOGLE_WEB_CLIENT_ID) && ok(GOOGLE_IOS_CLIENT_ID);
};

export const configureGoogle = () => {
  if (!isGoogleConfigured()) return;
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
  });
};

export const signInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const result = await GoogleSignin.signIn();
    if (result.type !== 'success') return;
    const idToken = result.data.idToken;
    if (!idToken) throw new Error('Google Sign-In returned no ID token');

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Google Sign-In Error:', err);
    throw err;
  }
};
