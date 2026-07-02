// Push-notifications seam.
//
// The DB + policy layers are ready now:
//   • device_tokens table (see supabase/snippets/device_tokens_2026-07-02.sql)
//   • notificationPolicy.shouldNotify() — master switch, per-category, quiet hours
//
// To GO LIVE you add a native transport (one native step + rebuild):
//   1. npm i @react-native-firebase/app @react-native-firebase/messaging
//      (or @notifee/react-native for local display)
//   2. cd ios && pod install
//   3. Xcode: enable Push Notifications + Background Modes (Remote notifications)
//   4. Add the APNs key in Firebase / your provider
//   5. Fill in acquireDeviceToken() below and call registerForPush() after login.

import { Platform } from 'react-native';
import { supabase } from './supabase';
import { shouldNotify, NotificationCategory } from './notificationPolicy';
import { readPrefs } from './settingsPrefs';

/** Persist a device token for the signed-in user (upsert). */
export async function registerDeviceToken(token: string): Promise<void> {
  const { data: sess } = await supabase.auth.getSession();
  const uid = sess.session?.user?.id;
  if (!uid || !token) return;
  // Cast: device_tokens is added by a migration; regenerate types once applied.
  await (supabase.from('device_tokens' as any) as any).upsert({
    user_id: uid,
    token,
    platform: Platform.OS === 'android' ? 'android' : 'ios',
  });
}

/** Remove this device's token (call on logout). */
export async function unregisterDeviceToken(token: string): Promise<void> {
  const { data: sess } = await supabase.auth.getSession();
  const uid = sess.session?.user?.id;
  if (!uid || !token) return;
  await (supabase.from('device_tokens' as any) as any)
    .delete()
    .eq('user_id', uid)
    .eq('token', token);
}

/**
 * Acquire the OS push token. Stubbed until a native transport is installed —
 * returns null so the app runs unchanged. Fill in with the chosen library.
 */
async function acquireDeviceToken(): Promise<string | null> {
  // Example once @react-native-firebase/messaging is installed:
  //   const messaging = require('@react-native-firebase/messaging').default;
  //   const status = await messaging().requestPermission();
  //   if (!status) return null;
  //   return await messaging().getToken();
  return null;
}

/** Request permission + register this device. Safe no-op until transport exists. */
export async function registerForPush(): Promise<void> {
  try {
    const token = await acquireDeviceToken();
    if (token) await registerDeviceToken(token);
  } catch {
    /* transport not installed / permission denied — non-fatal */
  }
}

/**
 * Decide whether an INCOMING push should be shown in the foreground, honouring
 * the user's prefs + quiet hours. The push handler calls this before displaying.
 */
export async function shouldDisplayNotification(category: NotificationCategory): Promise<boolean> {
  const prefs = await readPrefs();
  return shouldNotify(category, prefs, new Date());
}
