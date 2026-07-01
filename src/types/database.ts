// Hand-maintained TS contract for the MODIFIED schema.
// When you change a migration, regenerate or update this file in lock-step.
// You can also auto-generate this with: `supabase gen types typescript --linked > src/types/database.ts`

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export type MediaType = 'image' | 'video';

export type ProfileRow = {
  id: string;                  // matches auth.users.id
  username: string;            // citext, unique
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  car_make: string | null;
  car_model: string | null;
  car_year: number | null;
  follower_count: number;      // denormalized, maintained by trigger
  following_count: number;     // denormalized, maintained by trigger
  created_at: string;
  updated_at: string;
};

// Matches the live `posts` table (verified against the deployed schema).
// NOTE: there is no `author_id`, `caption`, `location_text`, or `is_published`
// column — authorship is `profile_id`, and there is no draft/publish flag.
export type PostRow = {
  id: string;
  profile_id: string;
  car_id: string | null;
  type: string;
  title: string;
  body: string;
  like_count: number;          // denormalized, maintained by trigger
  comment_count: number;       // denormalized, maintained by trigger
  created_at: string;
};

// Live `follows` uses `following_id` (NOT `followee_id`).
export type FollowRow = {
  follower_id: string;
  following_id: string;
  created_at: string;
};

export type LikeRow = {
  user_id: string;
  post_id: string;
  created_at: string;
};

export type CommentRow = {
  id: string;
  post_id: string;
  author_id: string;
  parent_comment_id: string | null;
  body: string;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
};

export type SavedPostRow = {
  user_id: string;
  post_id: string;
  saved_at: string;
};

export type CollectionRow = {
  id: string;
  owner_id: string;
  name: string;
  is_private: boolean;
  cover_post_id: string | null;
  created_at: string;
  updated_at: string;
};

export type CollectionPostRow = {
  collection_id: string;
  post_id: string;
  added_at: string;
};

export type NotificationType = 'like' | 'comment' | 'follow' | 'tag' | 'mention';

export type NotificationRow = {
  id: string;
  actor_id: string;
  target_user_id: string;
  type: NotificationType;
  post_id: string | null;
  comment_id: string | null;
  created_at: string;
  read_at: string | null;
};

export type TimelineCategory = 'event' | 'track' | 'modification' | 'notification';

export type TimelineEntryRow = {
  id: string;
  user_id: string;
  category: TimelineCategory;
  title: string;
  description: string | null;
  image_url: string | null;
  like_count: number;
  comment_count: number;
  created_at: string;
};

export type PostMediaRow = {
  id: string;
  post_id: string;
  media_type: MediaType;
  storage_path: string;   // path inside the `post_media` bucket
  position: number;       // 0-based ordering within the post
  width: number | null;
  height: number | null;
  created_at: string;
};

export type PhotoTagRow = {
  id: string;
  post_media_id: string;
  tagged_user_id: string;
  x: number;              // normalized 0..1
  y: number;              // normalized 0..1
  created_at: string;
};

export type PostTagRow = {
  post_id: string;
  tagged_user_id: string;
  created_at: string;
};

export type HashtagRow = {
  id: string;
  tag: string;            // citext, unique, no leading "#"
  created_at: string;
};

export type PostHashtagRow = {
  post_id: string;
  hashtag_id: string;
};

/**
 * Minimal supabase-js typed surface for the tables we ship in Phase 1.
 * Extend this as more tables are added in later migrations.
 */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & Pick<ProfileRow, 'id' | 'username'>;
        Update: Partial<ProfileRow>;
      };
      posts: {
        Row: PostRow;
        Insert: Partial<PostRow> & Pick<PostRow, 'profile_id'>;
        Update: Partial<PostRow>;
      };
      post_media: {
        Row: PostMediaRow;
        Insert: Omit<PostMediaRow, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<PostMediaRow>;
      };
      photo_tags: {
        Row: PhotoTagRow;
        Insert: Omit<PhotoTagRow, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<PhotoTagRow>;
      };
      post_tags: {
        Row: PostTagRow;
        Insert: Omit<PostTagRow, 'created_at'> & { created_at?: string };
        Update: Partial<PostTagRow>;
      };
      hashtags: {
        Row: HashtagRow;
        Insert: Omit<HashtagRow, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<HashtagRow>;
      };
      post_hashtags: {
        Row: PostHashtagRow;
        Insert: PostHashtagRow;
        Update: Partial<PostHashtagRow>;
      };
      follows: {
        Row: FollowRow;
        Insert: Omit<FollowRow, 'created_at'> & { created_at?: string };
        Update: Partial<FollowRow>;
      };
      likes: {
        Row: LikeRow;
        Insert: Omit<LikeRow, 'created_at'> & { created_at?: string };
        Update: Partial<LikeRow>;
      };
      comments: {
        Row: CommentRow;
        Insert: Omit<CommentRow, 'id' | 'is_edited' | 'created_at' | 'updated_at'> & {
          id?: string;
          is_edited?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<CommentRow>;
      };
      saved_posts: {
        Row: SavedPostRow;
        Insert: Omit<SavedPostRow, 'saved_at'> & { saved_at?: string };
        Update: Partial<SavedPostRow>;
      };
      collections: {
        Row: CollectionRow;
        Insert: Omit<CollectionRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<CollectionRow>;
      };
      collection_posts: {
        Row: CollectionPostRow;
        Insert: Omit<CollectionPostRow, 'added_at'> & { added_at?: string };
        Update: Partial<CollectionPostRow>;
      };
      notifications: {
        Row: NotificationRow;
        // Insert intentionally typed loose: trigger-only path; clients should
        // not insert here. RLS will reject anyway.
        Insert: Partial<NotificationRow>;
        Update: Partial<NotificationRow>;
      };
      timeline_entries: {
        Row: TimelineEntryRow;
        Insert: Omit<TimelineEntryRow, 'id' | 'like_count' | 'comment_count' | 'created_at'> & {
          id?: string;
          like_count?: number;
          comment_count?: number;
          created_at?: string;
        };
        Update: Partial<TimelineEntryRow>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
