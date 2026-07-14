import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useMeProfile } from './useMeProfile';
import { checkText } from '../lib/moderation';
import { track, captureError } from '../lib/observability';
import { storiesDb, STORY_BUCKET, type StoryMediaType } from '../lib/storiesDb';

export type UploadStoryInput = {
  imageUri: string;
  mediaType?: StoryMediaType;
  caption?: string;
  mimeType?: string;
};

export type UploadStoryState =
  | { status: 'idle' }
  | { status: 'uploading' }
  | { status: 'success'; storyId: string }
  | { status: 'error'; message: string };

/**
 * Media → Storage → story pipeline, mirroring useUploadPost:
 *   1. Resolve the author (session user, or seeded "me" in demo mode).
 *   2. Read the picked file as bytes.
 *   3. Upload to the public `story_media` bucket at `<profileId>/<rand>.<ext>`.
 *   4. Insert the `stories` row (24h expiry is set by the table default).
 * Rolls back (remove object) on failure. Ephemeral: no post/media rows.
 */
export function useUploadStory() {
  const [state, setState] = useState<UploadStoryState>({ status: 'idle' });
  const { data: me } = useMeProfile();

  const upload = useCallback(
    async (input: UploadStoryInput) => {
      setState({ status: 'uploading' });

      let storagePath: string | null = null;

      try {
        const caption = (input.caption ?? '').trim();
        if (caption) {
          const check = checkText(caption);
          if (!check.ok) throw new Error(check.reason);
        }

        // 1. Author.
        const { data: sessionData } = await supabase.auth.getSession();
        const authorId = sessionData.session?.user.id ?? me?.id;
        if (!authorId) throw new Error('No profile to post as.');

        // 2. Read the file.
        const fileResp = await fetch(input.imageUri);
        const bytes = new Uint8Array(await fileResp.arrayBuffer());

        // 3. Upload to Storage.
        const isVideo = input.mediaType === 'video';
        const uriExt = input.imageUri.split('.').pop()?.split('?')[0]?.toLowerCase();
        const ext = uriExt && uriExt.length <= 4 ? uriExt : isVideo ? 'mp4' : 'jpg';
        const contentType = input.mimeType ?? (isVideo ? 'video/mp4' : 'image/jpeg');
        storagePath = `${authorId}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from(STORY_BUCKET)
          .upload(storagePath, bytes, { contentType, upsert: false });
        if (uploadError) throw uploadError;
        const mediaUrl = supabase.storage.from(STORY_BUCKET).getPublicUrl(storagePath).data.publicUrl;

        // 4. Insert the story row (created_at + expires_at defaulted by the table).
        const { data: row, error: storyError } = await storiesDb
          .from('stories')
          .insert({
            profile_id: authorId,
            media_url: mediaUrl,
            media_type: isVideo ? 'video' : 'image',
            caption: caption || null,
          })
          .select('id')
          .single();
        if (storyError) throw storyError;

        track('story_create', { mediaType: isVideo ? 'video' : 'image' });
        setState({ status: 'success', storyId: row.id });
        return row.id as string;
      } catch (err: any) {
        if (storagePath) {
          await supabase.storage.from(STORY_BUCKET).remove([storagePath]).then(() => {}, () => {});
        }
        const message = err?.message ?? 'Upload failed';
        captureError(err, { hook: 'useUploadStory' });
        setState({ status: 'error', message });
        throw err;
      }
    },
    [me?.id],
  );

  const reset = useCallback(() => setState({ status: 'idle' }), []);

  return { state, upload, reset };
}
