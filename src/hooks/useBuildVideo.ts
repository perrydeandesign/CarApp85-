import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';
import { track, captureError } from '../lib/observability';
import type { MediaPick } from '../lib/imagePicker';

const BUCKET = 'post_media';

/**
 * Attach / replace / remove a car's hero "build walkthrough" video. The file
 * lives in the existing public post_media bucket under
 * `<uid>/build_videos/...`; the public URL is stored on cars.build_video_url.
 */
export function useBuildVideo(carId: string | null) {
  const [busy, setBusy] = useState(false);

  const upload = useCallback(
    async (media: MediaPick): Promise<string | null> => {
      if (!carId) return null;
      setBusy(true);
      let storagePath: string | null = null;
      try {
        const { data: sess } = await supabase.auth.getSession();
        const uid = sess.session?.user?.id;
        if (!uid) throw new Error('You need to be signed in.');

        const resp = await fetch(media.uri);
        const bytes = new Uint8Array(await resp.arrayBuffer());
        const uriExt = media.uri.split('.').pop()?.split('?')[0]?.toLowerCase();
        const ext = uriExt && uriExt.length <= 4 ? uriExt : 'mp4';
        storagePath = `${uid}/build_videos/${carId}_${Date.now()}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(storagePath, bytes, { contentType: 'video/mp4', upsert: false });
        if (upErr) throw upErr;
        const url = supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;

        const { error: dbErr } = await supabase
          .from('cars')
          .update({ build_video_url: url })
          .eq('id', carId);
        if (dbErr) throw dbErr;

        track('build_video_add', { carId });
        return url;
      } catch (e) {
        if (storagePath) {
          await supabase.storage.from(BUCKET).remove([storagePath]).then(() => {}, () => {});
        }
        captureError(e, { hook: 'useBuildVideo', action: 'upload', carId });
        throw e;
      } finally {
        setBusy(false);
      }
    },
    [carId],
  );

  const remove = useCallback(
    async (currentUrl: string | null): Promise<void> => {
      if (!carId) return;
      setBusy(true);
      try {
        const { error } = await supabase
          .from('cars')
          .update({ build_video_url: null })
          .eq('id', carId);
        if (error) throw error;

        // Best-effort delete of the storage object (parse the path after the bucket).
        const marker = `/${BUCKET}/`;
        const idx = currentUrl?.indexOf(marker) ?? -1;
        if (currentUrl && idx >= 0) {
          const path = currentUrl.slice(idx + marker.length);
          await supabase.storage.from(BUCKET).remove([path]).then(() => {}, () => {});
        }
        track('build_video_remove', { carId });
      } catch (e) {
        captureError(e, { hook: 'useBuildVideo', action: 'remove', carId });
        throw e;
      } finally {
        setBusy(false);
      }
    },
    [carId],
  );

  return { busy, upload, remove };
}
