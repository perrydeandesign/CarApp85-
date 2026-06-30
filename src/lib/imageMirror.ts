import { supabase } from './supabase';

/**
 * Lazy, on-demand image mirroring (client side of the `mirror-image` Edge
 * Function). When a remote image is first shown, we ask the function to copy it
 * into our own Storage and, once it resolves, swap the displayed URL to the
 * Storage copy. This spreads the load over real usage instead of a bulk pull
 * (which Wikimedia rate-limits), and removes the production hotlink dependency.
 *
 * Fully defensive: if the function isn't deployed, or the URL is already on our
 * Storage / not a remote http URL, it no-ops and the original URL keeps showing.
 */

const memo = new Map<string, string>(); // original → storage url (per session)
const inFlight = new Set<string>();

function shouldMirror(url: string | undefined): url is string {
  if (!url || !/^https?:\/\//.test(url)) return false;
  // Already on our Storage, or a data/asset URL — skip.
  if (url.includes('/storage/v1/object/')) return false;
  return true;
}

/**
 * Returns a Storage URL if we already have one for `url`; otherwise returns
 * `url` and kicks off a background mirror. `onResolved` is called with the
 * Storage URL once mirroring completes (so the caller can swap the image).
 */
export function resolveImage(url: string | undefined, onResolved?: (storageUrl: string) => void): string {
  if (!shouldMirror(url)) return url ?? '';
  const cached = memo.get(url);
  if (cached) return cached;

  if (!inFlight.has(url)) {
    inFlight.add(url);
    supabase.functions
      .invoke('mirror-image', { body: { url } })
      .then(({ data, error }) => {
        const storageUrl = (data as any)?.storageUrl as string | undefined;
        if (!error && storageUrl) {
          memo.set(url, storageUrl);
          onResolved?.(storageUrl);
        }
      })
      .catch(() => {})
      .finally(() => inFlight.delete(url));
  }
  return url;
}
