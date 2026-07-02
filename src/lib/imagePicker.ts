// Image pick + upload helper.
//
// Upload plumbing is real (Supabase Storage). The library picker degrades
// gracefully: it uses react-native-image-picker if installed, else returns null
// so the app runs unchanged. To enable picking:
//   npm i react-native-image-picker && cd ios && pod install  (native rebuild)

import { supabase } from './supabase';

const BUCKET = 'post_media';

/** Open the OS photo library and return a local file URI (or null). */
export async function pickImageFromLibrary(): Promise<string | null> {
  try {
    // Dynamic require so the bundle builds without the native module present.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { launchImageLibrary } = require('react-native-image-picker');
    const res = await launchImageLibrary({ mediaType: 'photo', quality: 0.8, selectionLimit: 1 });
    if (res?.didCancel) return null;
    return res?.assets?.[0]?.uri ?? null;
  } catch {
    return null; // library not installed
  }
}

/** Whether a native picker is available (drives UI affordances). */
export function isImagePickerAvailable(): boolean {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('react-native-image-picker');
    return true;
  } catch {
    return false;
  }
}

/**
 * Upload a local image URI to Storage under the signed-in user's folder and
 * return its public URL. Reuses the post_media bucket (public read, owner write).
 */
export async function uploadImage(uri: string, folder = 'uploads'): Promise<string | null> {
  const { data: sess } = await supabase.auth.getSession();
  const uid = sess.session?.user?.id;
  if (!uid) return null;

  const resp = await fetch(uri);
  const bytes = new Uint8Array(await resp.arrayBuffer());
  const ext = (uri.split('.').pop() || 'jpg').split('?')[0].toLowerCase();
  const path = `${uid}/${folder}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType: ext === 'png' ? 'image/png' : 'image/jpeg',
    upsert: true,
  });
  if (error) {
    console.warn('uploadImage failed', error.message);
    return null;
  }
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Convenience: pick from library then upload. Returns the public URL or null. */
export async function pickAndUploadImage(folder = 'uploads'): Promise<string | null> {
  const uri = await pickImageFromLibrary();
  if (!uri) return null;
  return uploadImage(uri, folder);
}
