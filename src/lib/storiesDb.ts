import { supabase } from './supabase';

// The `stories` / `story_views` tables + `story_media` bucket are defined in
// supabase/snippets/stories_2026-07-14.sql and are now part of the regenerated
// Database type, so the standard typed client covers them. Re-exported here so
// the Stories hooks share one import surface alongside the row types below.
export const storiesDb = supabase;

export const STORY_BUCKET = 'story_media';

export type StoryMediaType = 'image' | 'video';

export type StoryRow = {
  id: string;
  profile_id: string;
  media_url: string;
  media_type: StoryMediaType;
  caption: string | null;
  created_at: string;
  expires_at: string;
};

export type StoryAuthor = { id: string; username: string; avatarUrl: string | null };

/** All of one author's active (unexpired) stories, plus whether I've seen them all. */
export type StoryGroup = {
  author: StoryAuthor;
  stories: StoryRow[];
  hasUnseen: boolean;
};
