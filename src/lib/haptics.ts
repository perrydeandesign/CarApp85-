// Thin haptics wrapper. Uses react-native-haptic-feedback when the native
// module is linked; degrades to a no-op otherwise (so JS never crashes if the
// pod isn't installed yet, e.g. on a teammate's machine pre-`pod install`).

import { Platform } from 'react-native';

type HapticType = 'selection' | 'light' | 'medium' | 'success' | 'warning';

let impl: ((type: string, opts?: any) => void) | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require('react-native-haptic-feedback');
  const trigger = mod?.default?.trigger ?? mod?.trigger;
  if (typeof trigger === 'function') impl = trigger;
} catch {
  impl = null;
}

const MAP: Record<HapticType, string> = {
  selection: 'selection',
  light: 'impactLight',
  medium: 'impactMedium',
  success: 'notificationSuccess',
  warning: 'notificationWarning',
};

const OPTS = { enableVibrateFallback: false, ignoreAndroidSystemSettings: false };

/** Fire a haptic. No-ops on web / when the native module is unavailable. */
export function haptic(type: HapticType = 'selection') {
  if (!impl || Platform.OS === 'web') return;
  try {
    impl(MAP[type], OPTS);
  } catch {
    // ignore — haptics are non-essential
  }
}
