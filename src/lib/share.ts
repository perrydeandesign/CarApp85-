// Reusable share service. Any screen (events, posts, profiles, vendors) builds
// a ShareContent and calls shareTo(target, content). Each target routes to the
// right app via deep link with a graceful fallback (web intent or the system
// share sheet) so a missing app never leaves the user stuck.
//
// TikTok is intentionally omitted: it has no public link/text share API (only
// video sharing via their SDK), so a "TikTok" button would silently fail.

import { Linking, Share } from 'react-native';
import { copyToClipboard } from './clipboard';
import { haptic } from './haptics';

export type ShareEvent = {
  title: string;
  startsAt: string; // ISO
  endsAt?: string; // ISO — defaults to start + 2h
  location?: string;
  description?: string;
};

export type ShareContent = {
  /** Short human message, e.g. "Check out Sunday Cars & Coffee on MODIFIED". */
  message: string;
  /** Canonical link to the entity. */
  url?: string;
  /** Optional title — used as the email subject. */
  title?: string;
  /** Optional local/remote image uri (posts, build cards) for image download. */
  imageUri?: string;
  /** When present, the Download action adds this to the user's calendar. */
  event?: ShareEvent;
};

export type ShareTarget =
  | 'email'
  | 'messenger'
  | 'text'
  | 'whatsapp'
  | 'x'
  | 'threads'
  | 'download'
  | 'copy';

function fullText(c: ShareContent): string {
  return c.url ? `${c.message} ${c.url}` : c.message;
}

/** Try each candidate URL in order; open the first that the OS can handle. */
async function openFirst(urls: string[]): Promise<boolean> {
  for (const u of urls) {
    try {
      if (await Linking.canOpenURL(u)) {
        await Linking.openURL(u);
        return true;
      }
    } catch {
      /* try next candidate */
    }
  }
  // Last resort: force-open the final candidate. canOpenURL can be flaky for
  // https/mailto schemes that aren't whitelisted, but openURL still works.
  const last = urls[urls.length - 1];
  if (!last) return false;
  try {
    await Linking.openURL(last);
    return true;
  } catch {
    return false;
  }
}

/** ISO -> YYYYMMDDTHHMMSSZ (UTC) for calendar template links. */
function calDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/** Google Calendar "Add event" template URL — no native calendar dep needed. */
function calendarUrl(ev: ShareEvent): string {
  const start = calDate(ev.startsAt);
  const endIso = ev.endsAt ?? new Date(new Date(ev.startsAt).getTime() + 2 * 3600_000).toISOString();
  const end = calDate(endIso);
  const parts = [
    `text=${encodeURIComponent(ev.title)}`,
    `dates=${start}/${end}`,
    ev.description ? `details=${encodeURIComponent(ev.description)}` : '',
    ev.location ? `location=${encodeURIComponent(ev.location)}` : '',
  ].filter(Boolean);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&${parts.join('&')}`;
}

/** Route a share to a specific target. Safe to await; never throws. */
export async function shareTo(target: ShareTarget, c: ShareContent): Promise<void> {
  haptic('selection');
  const text = fullText(c);
  const enc = encodeURIComponent(text);

  switch (target) {
    case 'email':
      await openFirst([`mailto:?subject=${encodeURIComponent(c.title ?? c.message)}&body=${enc}`]);
      return;

    case 'text':
      // iOS SMS body form.
      await openFirst([`sms:&body=${enc}`]);
      return;

    case 'whatsapp':
      await openFirst([`whatsapp://send?text=${enc}`, `https://wa.me/?text=${enc}`]);
      return;

    case 'x':
      await openFirst([
        `twitter://post?message=${enc}`,
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(c.message)}${
          c.url ? `&url=${encodeURIComponent(c.url)}` : ''
        }`,
      ]);
      return;

    case 'messenger': {
      const link = c.url ?? text;
      const scheme = `fb-messenger://share/?link=${encodeURIComponent(link)}`;
      try {
        if (await Linking.canOpenURL(scheme)) {
          await Linking.openURL(scheme);
          return;
        }
      } catch {
        /* app not installed — fall through */
      }
      try {
        await Share.share({ message: text, url: c.url });
      } catch {
        /* user cancelled */
      }
      return;
    }

    case 'threads':
      // Threads has no app deep link for arbitrary posts — use the web intent.
      await openFirst([`https://www.threads.net/intent/post?text=${enc}`]);
      return;

    case 'download':
      if (c.event) {
        await openFirst([calendarUrl(c.event)]);
        return;
      }
      // No event → offer the image (or text) via the system sheet so the user
      // can Save to Photos / Files.
      try {
        await Share.share(c.imageUri ? { url: c.imageUri, message: c.message } : { message: text });
      } catch {
        /* user cancelled */
      }
      return;

    case 'copy':
      await copyToClipboard(c.url ?? text);
      return;
  }
}
