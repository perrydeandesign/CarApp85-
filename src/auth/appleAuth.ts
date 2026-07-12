// src/auth/appleAuth.ts
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { supabase } from '../lib/supabase';

/**
 * True only when Sign in with Apple can actually run: the native module is
 * linked (pod installed + "Sign in with Apple" capability) and the device
 * supports it (iOS 13+). The Login screen uses this to hide the Apple button
 * until it's ready, so we never ship a dead button (App Review guideline 2.1).
 *
 * The code is fully wired — enabling it is a native/credentials step only.
 * See docs/APPLE_SIGNIN_SETUP.md.
 */
export const isAppleConfigured = (): boolean => {
  try {
    return !!appleAuth && appleAuth.isSupported;
  } catch {
    return false;
  }
};

/**
 * Runs the native Apple flow and exchanges the identity token for a Supabase
 * session. Returns null if the user cancels (not an error). Throws on real
 * failures. AppNavigator swaps to MainNavigator automatically once the session
 * updates via onAuthStateChange.
 */
export const signInWithApple = async () => {
  let resp;
  try {
    resp = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
    });
  } catch (err: any) {
    if (err?.code === appleAuth.Error.CANCELED) return null; // user dismissed the sheet
    throw err;
  }

  const identityToken = resp.identityToken;
  if (!identityToken) throw new Error('Apple Sign-In returned no identity token');

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: identityToken,
  });
  if (error) throw error;
  return data;
};
