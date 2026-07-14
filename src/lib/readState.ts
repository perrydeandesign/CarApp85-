// Local (on-device) conversation read-state.
//
// The messages / conversation_members tables have no read-tracking columns, so
// unread counts can't come from the server. We track the last time the user
// opened each conversation in AsyncStorage and derive "unread" as messages newer
// than that timestamp (from someone else). Purely client-side, per-device.

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'conv_last_read_v1';

/** Map of conversationId -> ISO timestamp the user last opened it. */
export async function getLastReadMap(): Promise<Record<string, string>> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

/** Record that the user has now read `conversationId` up to `at` (default: now). */
export async function markConversationRead(
  conversationId: string,
  at: string = new Date().toISOString(),
): Promise<void> {
  try {
    const map = await getLastReadMap();
    map[conversationId] = at;
    await AsyncStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    // non-fatal — unread badge is a nicety, not correctness-critical
  }
}
