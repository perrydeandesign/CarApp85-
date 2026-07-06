// Thin clipboard wrapper. Uses @react-native-clipboard/clipboard when the
// native module is linked; degrades to the system share sheet (which offers a
// Copy action) otherwise — same defensive pattern as lib/haptics, so JS never
// crashes if the pod isn't installed yet (e.g. on a teammate's machine
// pre-`pod install`).

let impl: { setString: (s: string) => void } | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require('@react-native-clipboard/clipboard');
  const candidate = mod?.default ?? mod;
  if (candidate && typeof candidate.setString === 'function') impl = candidate;
} catch {
  impl = null;
}

/** True when the native clipboard module is available. */
export function clipboardAvailable(): boolean {
  return !!impl;
}

/**
 * Copy text to the clipboard. Returns true when the native copy succeeded.
 * Falls back to the system share sheet so the user is never stuck.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (impl) {
    try {
      impl.setString(text);
      return true;
    } catch {
      // fall through to share-sheet fallback
    }
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Share } = require('react-native');
    await Share.share({ message: text });
  } catch {
    /* nothing else we can do */
  }
  return false;
}
