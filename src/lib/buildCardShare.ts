// Build Card share-out — the growth loop.
//
// Given a captured PNG of the BuildCard, this offers the strongest share path
// available: a true one-tap "Share to Instagram Story" when a Facebook App ID is
// configured, otherwise the rich native share sheet (which still includes
// Instagram, Messages, Save to Photos…). Everything degrades gracefully so the
// JS bundle runs even before `pod install` + a native rebuild.

let RNShare: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  RNShare = require('react-native-share').default;
} catch {
  RNShare = null;
}

let FB_APP_ID: string | undefined;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  FB_APP_ID = require('@env').FACEBOOK_APP_ID || undefined;
} catch {
  FB_APP_ID = undefined;
}

type ShareBuildOpts = { message: string; link: string };

/** True once react-native-share's native module is installed. */
export const isRichShareAvailable = (): boolean => !!RNShare;

/**
 * Share a captured Build Card image. Resolves whether or not the user completes
 * the share; never throws.
 */
export async function shareBuildImage(fileUri: string, opts: ShareBuildOpts): Promise<void> {
  // Preferred: one-tap Instagram Story (needs a Facebook App ID + the native lib).
  if (RNShare && FB_APP_ID) {
    try {
      await RNShare.shareSingle({
        social: RNShare.Social.INSTAGRAM_STORIES,
        appId: FB_APP_ID,
        backgroundImage: fileUri,
      });
      return;
    } catch {
      /* user cancelled or IG not installed — fall through to the sheet */
    }
  }

  // Rich share sheet (Instagram, Messages, Save…), still with the card image.
  if (RNShare) {
    try {
      await RNShare.open({ url: fileUri, message: `${opts.message} ${opts.link}` });
      return;
    } catch {
      /* cancelled — nothing to do */
    }
    return;
  }

  // Last resort before the native rebuild: the built-in RN share sheet.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Share } = require('react-native');
  try {
    await Share.share({ url: fileUri, message: `${opts.message} ${opts.link}` });
  } catch {
    /* cancelled */
  }
}
