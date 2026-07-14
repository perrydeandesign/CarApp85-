// Notification decision layer — pure functions the push handler calls to decide
// whether to surface a notification, based on the user's device prefs (master
// push switch, per-category toggles, quiet hours). No side effects; unit-testable.
//
// Wire-up (when push is built): in the incoming-notification handler, call
// shouldNotify(category, prefs, new Date()) and drop the alert if it returns false.

import { SettingsPrefs } from './settingsPrefs';

export type NotificationCategory =
  | 'like'
  | 'comment'
  | 'follow'
  | 'mention'
  | 'message'
  | 'competition';

const CATEGORY_PREF: Record<NotificationCategory, keyof SettingsPrefs> = {
  like: 'notifyLikes',
  comment: 'notifyComments',
  follow: 'notifyFollows',
  mention: 'notifyMentions',
  message: 'notifyMessages',
  competition: 'notifyCompetitions',
};

/** True if `date`'s hour falls inside the user's quiet-hours window. */
export function isWithinQuietHours(prefs: SettingsPrefs, date: Date): boolean {
  if (!prefs.quietHoursEnabled) return false;
  const start = parseInt(prefs.quietStart, 10);
  const end = parseInt(prefs.quietEnd, 10);
  if (Number.isNaN(start) || Number.isNaN(end) || start === end) return false;
  const h = date.getHours();
  // Same-day window (e.g. 09–17) vs overnight wrap (e.g. 22–07).
  return start < end ? h >= start && h < end : h >= start || h < end;
}

/** Whether a notification of `category` should be shown right now. */
export function shouldNotify(
  category: NotificationCategory,
  prefs: SettingsPrefs,
  date: Date,
): boolean {
  if (!prefs.pushEnabled) return false;
  if (isWithinQuietHours(prefs, date)) return false;
  return Boolean(prefs[CATEGORY_PREF[category]]);
}
