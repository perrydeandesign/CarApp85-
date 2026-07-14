import { useCallback, useEffect, useState } from 'react';
import { captureError, track } from '../lib/observability';
import { storiesDb, type StoryGroup, type StoryRow } from '../lib/storiesDb';

/**
 * Active (unexpired) stories, grouped by author, with a per-author `hasUnseen`
 * flag derived from my `story_views`. Replaces useStoryPeople — the rail now
 * reflects real ephemeral stories rather than recent post authors.
 */
export function useStoriesFeed(meId: string | null) {
  const [groups, setGroups] = useState<StoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const nowIso = new Date().toISOString();
      const { data: rows, error } = await storiesDb
        .from('stories')
        .select(
          'id, profile_id, media_url, media_type, caption, created_at, expires_at, author:profiles!stories_profile_id_fkey ( id, username, avatar_url )',
        )
        .gt('expires_at', nowIso)
        .order('created_at', { ascending: true });
      if (error) {
        if (!cancelled) { setGroups([]); setLoading(false); }
        captureError(error, { hook: 'useStoriesFeed' });
        return;
      }

      // Which of these stories have I already viewed?
      let viewed = new Set<string>();
      if (meId) {
        const { data: views } = await storiesDb
          .from('story_views')
          .select('story_id')
          .eq('viewer_id', meId);
        viewed = new Set((views ?? []).map((v: any) => v.story_id));
      }

      const byAuthor = new Map<string, StoryGroup>();
      for (const r of (rows ?? []) as any[]) {
        const a = r.author;
        if (!a?.id) continue;
        const story: StoryRow = {
          id: r.id,
          profile_id: r.profile_id,
          media_url: r.media_url,
          media_type: r.media_type,
          caption: r.caption,
          created_at: r.created_at,
          expires_at: r.expires_at,
        };
        const existing = byAuthor.get(a.id);
        if (existing) {
          existing.stories.push(story);
          if (!viewed.has(story.id)) existing.hasUnseen = true;
        } else {
          byAuthor.set(a.id, {
            author: { id: a.id, username: a.username, avatarUrl: a.avatar_url },
            stories: [story],
            hasUnseen: !viewed.has(story.id),
          });
        }
      }

      if (!cancelled) {
        setGroups(Array.from(byAuthor.values()));
        setLoading(false);
      }
    })().catch((e) => {
      if (!cancelled) { setGroups([]); setLoading(false); }
      captureError(e, { hook: 'useStoriesFeed' });
    });
    return () => { cancelled = true; };
  }, [meId, tick]);

  return { groups, loading, refresh };
}

/** Record that `meId` viewed `storyId` (idempotent). Fires a `story_view` event. */
export async function markStoryViewed(storyId: string, meId: string | null) {
  if (!meId) return;
  try {
    await storiesDb
      .from('story_views')
      .upsert({ story_id: storyId, viewer_id: meId }, { onConflict: 'story_id,viewer_id', ignoreDuplicates: true });
    track('story_view', { storyId });
  } catch (e) {
    captureError(e, { hook: 'markStoryViewed', storyId });
  }
}
