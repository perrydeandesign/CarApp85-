import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useMeProfile } from './useMeProfile';
import { checkText } from '../lib/moderation';
import type { PhotoTag } from '../social/data/posts';

export type UploadPostInput = {
  imageUri: string;
  /** 'video' uploads as a video post; defaults to 'image'. */
  mediaType?: 'image' | 'video';
  caption: string;
  taggedUsernames: string[];
  photoTags: PhotoTag[];
  mimeType?: string;
};

export type UploadPostState =
  | { status: 'idle' }
  | { status: 'uploading' }
  | { status: 'success'; postId: string }
  | { status: 'error'; message: string };

const BUCKET = 'post_media';

/**
 * Camera → Storage → post pipeline, against the canonical schema:
 *   1. Resolve the author (session user, or seeded "me" in demo mode).
 *   2. Read the picked file as bytes.
 *   3. Upload to the public `post_media` bucket at `<profileId>/<rand>.jpg`.
 *   4. Insert the `posts` row (profile_id, type, title, body).
 *   5. Insert `post_media` with the Storage public URL.
 * Rolls back (delete post + remove object) on failure.
 */
export function useUploadPost() {
  const [state, setState] = useState<UploadPostState>({ status: 'idle' });
  const { data: me } = useMeProfile();

  const upload = useCallback(
    async (input: UploadPostInput) => {
      setState({ status: 'uploading' });

      let createdPostId: string | null = null;
      let storagePath: string | null = null;

      try {
        const caption = (input.caption ?? '').trim();
        const check = checkText(caption);
        if (!check.ok) throw new Error(check.reason);

        // 1. Author — prefer the real session, fall back to seeded "me" (demo).
        const { data: sessionData } = await supabase.auth.getSession();
        const authorId = sessionData.session?.user.id ?? me?.id;
        if (!authorId) throw new Error('No profile to post as.');

        // 2. Read the file.
        const fileResp = await fetch(input.imageUri);
        const bytes = new Uint8Array(await fileResp.arrayBuffer());

        // 3. Upload to Storage.
        const isVideo = input.mediaType === 'video';
        // Prefer the picked file's extension, else a sensible default per type.
        const uriExt = input.imageUri.split('.').pop()?.split('?')[0]?.toLowerCase();
        const ext = uriExt && uriExt.length <= 4 ? uriExt : (isVideo ? 'mp4' : 'jpg');
        const contentType = input.mimeType ?? (isVideo ? 'video/mp4' : 'image/jpeg');
        storagePath = `${authorId}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(storagePath, bytes, {
            contentType,
            upsert: false,
          });
        if (uploadError) throw uploadError;
        const mediaUrl = supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;

        // 4. Insert the post (title is NOT NULL — derive a headline).
        const title = caption.length > 60 ? `${caption.slice(0, 57)}…` : caption || 'New post';
        const { data: postRow, error: postError } = await supabase
          .from('posts')
          .insert({
            profile_id: authorId,
            car_id: null,
            type: 'media',
            title,
            body: caption || null,
            like_count: 0,
            comment_count: 0,
          })
          .select('id')
          .single();
        if (postError) throw postError;
        createdPostId = postRow.id;

        // 5. Insert the media row.
        const { error: mediaError } = await supabase
          .from('post_media')
          .insert({ post_id: createdPostId, media_url: mediaUrl, media_type: isVideo ? 'video' : 'image' });
        if (mediaError) throw mediaError;

        setState({ status: 'success', postId: createdPostId });
        return createdPostId;
      } catch (err: any) {
        if (createdPostId) {
          await supabase.from('posts').delete().eq('id', createdPostId);
        }
        if (storagePath) {
          await supabase.storage.from(BUCKET).remove([storagePath]).then(() => {}, () => {});
        }
        const message = err?.message ?? 'Upload failed';
        setState({ status: 'error', message });
        throw err;
      }
    },
    [me?.id],
  );

  const reset = useCallback(() => setState({ status: 'idle' }), []);

  return { state, upload, reset };
}
