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

/** Open the OS camera and return a local file URI (or null). No-op on simulator. */
export async function captureImageFromCamera(): Promise<string | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { launchCamera } = require('react-native-image-picker');
    const res = await launchCamera({ mediaType: 'photo', quality: 0.8, saveToPhotos: false });
    if (res?.didCancel) return null;
    if (res?.errorCode) return null; // e.g. camera unavailable on simulator
    return res?.assets?.[0]?.uri ?? null;
  } catch {
    return null;
  }
}

/**
 * Present a Take Photo / Choose from Library chooser and return a local URI.
 * The camera row is offered but degrades gracefully (simulators have no camera),
 * so the library path always works. Resolves null if the user cancels.
 */
export function choosePhoto(): Promise<string | null> {
  // Imported lazily to keep this module free of React Native UI deps at the top.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Alert } = require('react-native');
  return new Promise((resolve) => {
    Alert.alert('Add a photo', undefined, [
      { text: 'Take Photo', onPress: async () => resolve(await captureImageFromCamera()) },
      { text: 'Choose from Library', onPress: async () => resolve(await pickImageFromLibrary()) },
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(null) },
    ]);
  });
}

export type MediaPick = { uri: string; type: 'image' | 'video' };

/** Launch the picker and normalise the result to { uri, type }. */
async function launchMedia(fn: 'launchCamera' | 'launchImageLibrary', options: any): Promise<MediaPick | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const picker = require('react-native-image-picker');
    const res = await picker[fn](options);
    if (res?.didCancel || res?.errorCode) return null;
    const asset = res?.assets?.[0];
    if (!asset?.uri) return null;
    const isVideo = String(asset.type ?? '').startsWith('video') || options.mediaType === 'video';
    return { uri: asset.uri, type: isVideo ? 'video' : 'image' };
  } catch {
    return null;
  }
}

/**
 * Chooser for a photo OR video → returns { uri, type }. Library supports both
 * (mixed); camera rows degrade gracefully on the simulator. Null on cancel.
 */
export function choosePhotoOrVideo(): Promise<MediaPick | null> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Alert } = require('react-native');
  return new Promise((resolve) => {
    Alert.alert('Add media', undefined, [
      { text: 'Take Photo', onPress: async () => resolve(await launchMedia('launchCamera', { mediaType: 'photo', quality: 0.8, saveToPhotos: false })) },
      { text: 'Record Video', onPress: async () => resolve(await launchMedia('launchCamera', { mediaType: 'video', videoQuality: 'high', durationLimit: 60, saveToPhotos: false })) },
      { text: 'Choose from Library', onPress: async () => resolve(await launchMedia('launchImageLibrary', { mediaType: 'mixed', quality: 0.8, selectionLimit: 1 })) },
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(null) },
    ]);
  });
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
