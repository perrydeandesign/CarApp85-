// Crash / error reporting seam.
//
// Uses @sentry/react-native when it's installed AND a DSN is configured;
// otherwise degrades to console logging so the app never depends on it being
// present (same defensive pattern as lib/haptics). To go live with Sentry:
//   1. npm i @sentry/react-native && cd ios && pod install   (native rebuild)
//   2. add SENTRY_DSN=... to .env  (and to the @env declarations)
//   3. that's it — initObservability() + captureError() start reporting.

let sentry: any = null;
let dsn: string | undefined;

try {
  // DSN from the app's env (react-native-dotenv). Undefined if not set.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  dsn = require('@env').SENTRY_DSN;
} catch {
  dsn = undefined;
}

export function initObservability() {
  if (!dsn) return; // no DSN → stay in console mode
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    sentry = require('@sentry/react-native');
    sentry.init({
      dsn,
      enableAutoSessionTracking: true,
      tracesSampleRate: 0.2,
    });
  } catch {
    sentry = null; // pod not installed yet
  }
}

/** Report a caught error with optional context. Always safe to call. */
export function captureError(error: unknown, context?: Record<string, any>) {
  if (sentry) {
    try {
      sentry.captureException(error, context ? { extra: context } : undefined);
      return;
    } catch {
      // fall through to console
    }
  }
  console.error('[captureError]', error, context ?? '');
}

/**
 * Lightweight analytics/breadcrumb seam. Records a named event (e.g.
 * 'story_create', 'story_view', 'mod_edit', 'notification_open') as a Sentry
 * breadcrumb when available, else logs to the console. Always safe to call.
 */
export function track(event: string, data?: Record<string, any>) {
  if (sentry) {
    try {
      sentry.addBreadcrumb({ category: 'app', type: 'user', message: event, data, level: 'info' });
      return;
    } catch {
      // fall through to console
    }
  }
  if (__DEV__) console.log('[track]', event, data ?? '');
}

/** Tag the signed-in user on reports (call after login / on resolve). */
export function setUserContext(user: { id: string; username?: string } | null) {
  if (!sentry) return;
  try {
    sentry.setUser(user ? { id: user.id, username: user.username } : null);
  } catch {
    /* no-op */
  }
}
