import { isWithinQuietHours, shouldNotify } from '../notificationPolicy';
import type { SettingsPrefs } from '../settingsPrefs';

// Local fixture (mirrors DEFAULT_PREFS) so this test needn't import the
// settingsPrefs module, which pulls in AsyncStorage (a native/ESM dep).
const BASE_PREFS: SettingsPrefs = {
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

/** Build prefs from the base fixture with targeted overrides. */
function prefs(overrides: Partial<SettingsPrefs> = {}): SettingsPrefs {
  return { ...BASE_PREFS, ...overrides };
}

/** A Date fixed at the given local hour (day/month arbitrary but valid). */
function at(hour: number): Date {
  return new Date(2026, 0, 1, hour, 0, 0);
}

describe('isWithinQuietHours', () => {
  it('returns false when quiet hours are disabled', () => {
    expect(isWithinQuietHours(prefs({ quietHoursEnabled: false }), at(3))).toBe(false);
  });

  it('handles an overnight window (22 -> 07) wrapping midnight', () => {
    const p = prefs({ quietHoursEnabled: true, quietStart: '22', quietEnd: '07' });
    expect(isWithinQuietHours(p, at(23))).toBe(true); // late night
    expect(isWithinQuietHours(p, at(3))).toBe(true); // early morning
    expect(isWithinQuietHours(p, at(7))).toBe(false); // end is exclusive
    expect(isWithinQuietHours(p, at(12))).toBe(false); // midday
  });

  it('handles a same-day window (09 -> 17)', () => {
    const p = prefs({ quietHoursEnabled: true, quietStart: '09', quietEnd: '17' });
    expect(isWithinQuietHours(p, at(9))).toBe(true); // start is inclusive
    expect(isWithinQuietHours(p, at(16))).toBe(true);
    expect(isWithinQuietHours(p, at(17))).toBe(false); // end is exclusive
    expect(isWithinQuietHours(p, at(8))).toBe(false);
  });

  it('treats an empty window (start === end) as no quiet hours', () => {
    const p = prefs({ quietHoursEnabled: true, quietStart: '10', quietEnd: '10' });
    expect(isWithinQuietHours(p, at(10))).toBe(false);
  });
});

describe('shouldNotify', () => {
  it('suppresses everything when master push is off', () => {
    expect(shouldNotify('like', prefs({ pushEnabled: false }), at(12))).toBe(false);
  });

  it('suppresses during quiet hours even when the category is enabled', () => {
    const p = prefs({
      pushEnabled: true,
      notifyLikes: true,
      quietHoursEnabled: true,
      quietStart: '22',
      quietEnd: '07',
    });
    expect(shouldNotify('like', p, at(2))).toBe(false); // inside quiet window
    expect(shouldNotify('like', p, at(12))).toBe(true); // outside quiet window
  });

  it('respects per-category toggles', () => {
    const p = prefs({ pushEnabled: true, notifyLikes: false, notifyComments: true });
    expect(shouldNotify('like', p, at(12))).toBe(false);
    expect(shouldNotify('comment', p, at(12))).toBe(true);
  });
});
