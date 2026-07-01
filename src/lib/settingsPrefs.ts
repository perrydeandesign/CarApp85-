// Device-local settings preferences (AsyncStorage).
//
// These are per-device UI/UX prefs — notifications toggles, language, units,
// appearance, etc. Account-level privacy (private account, who-can-X) belongs
// on the server and is intentionally NOT stored here (stubbed until a
// user_settings migration exists).

import AsyncStorage from '@react-native-async-storage/async-storage';

export type SettingsPrefs = {
  // Notifications
  pushEnabled: boolean;
  notifyLikes: boolean;
  notifyComments: boolean;
  notifyFollows: boolean;
  notifyMentions: boolean;
  notifyMessages: boolean;
  notifyCompetitions: boolean;
  emailNotifications: boolean;
  // Privacy & safety (device-local mirror; server is source of truth once wired)
  activityStatus: boolean;
  // Security
  biometricUnlock: boolean;
  // Language & region
  language: string; // e.g. 'en'
  region: string; // e.g. 'US'
  units: 'mi' | 'km';
  // Appearance / data (recommended additions)
  theme: 'system' | 'dark' | 'light';
  autoplayVideos: 'always' | 'wifi' | 'never';
  dataSaver: boolean;
  // Accessibility
  textSize: 'default' | 'large' | 'xlarge';
  reduceMotion: boolean;
  highContrast: boolean;
  // Quiet hours (mutes push between start–end, device-local)
  quietHoursEnabled: boolean;
  quietStart: string; // '00'..'23'
  quietEnd: string; // '00'..'23'
};

export const DEFAULT_PREFS: SettingsPrefs = {
  pushEnabled: true,
  notifyLikes: true,
  notifyComments: true,
  notifyFollows: true,
  notifyMentions: true,
  notifyMessages: true,
  notifyCompetitions: true,
  emailNotifications: false,
  activityStatus: true,
  biometricUnlock: false,
  language: 'en',
  region: 'US',
  units: 'mi',
  theme: 'system',
  autoplayVideos: 'wifi',
  dataSaver: false,
  textSize: 'default',
  reduceMotion: false,
  highContrast: false,
  quietHoursEnabled: false,
  quietStart: '22',
  quietEnd: '07',
};

const KEY = 'settings_prefs_v1';

export async function readPrefs(): Promise<SettingsPrefs> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<SettingsPrefs>) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

export async function writePrefs(prefs: SettingsPrefs): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    /* non-fatal */
  }
}

/** Text-size pref → font multiplier applied by useFontScale / scaleFont. */
export const FONT_SCALE: Record<SettingsPrefs['textSize'], number> = {
  default: 1,
  large: 1.15,
  xlarge: 1.3,
};
