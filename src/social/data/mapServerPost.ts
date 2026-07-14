import type { Post, UserPreview } from './posts';

// Shape of the join we expect from useFeed's select() call.
// Matches the MODIFIED v2 schema: posts.profile_id → profiles.id (FK posts_profile_id_fkey),
// post_media holds direct media_url (no storage path lookup needed).
export type ServerPostRow = {
  id: string;
  title: string | null;
  body: string | null;
  created_at: string;
  like_count: number;
  comment_count: number;
  author: {
    id: string;
    username: string;
    avatar_url: string | null;
  } | null;
  post_media: Array<{
    id: string;
    media_type: 'image' | 'video';
    media_url: string;
  }>;
};

export type EngagementFlags = {
  likedPostIds: Set<string>;
  savedPostIds: Set<string>;
  followedAuthorIds: Set<string>;
};

export function mapServerPost(row: ServerPostRow, flags?: EngagementFlags): Post | null {
  if (!row.author) return null;
  const firstMedia = row.post_media?.[0];
  // Text posts have no media — keep them (mediaUrl='' signals a text card).

  const author: UserPreview = {
    id: row.author.id,
    username: row.author.username,
    avatarUrl: row.author.avatar_url ?? '',
  };

  // Caption = title + body for a richer post body.
  const caption = [row.title, row.body].filter(Boolean).join(' — ');

  return {
    id: row.id,
    author,
    mediaUrl: firstMedia?.media_url ?? '',
    mediaType: firstMedia?.media_type ?? 'image',
    caption,
    likeCount: row.like_count,
    commentCount: row.comment_count,
    isLikedByCurrentUser: flags?.likedPostIds.has(row.id) ?? false,
    isSavedByCurrentUser: flags?.savedPostIds.has(row.id) ?? false,
    isAuthorFollowedByCurrentUser: flags?.followedAuthorIds.has(author.id) ?? false,
    createdAt: row.created_at,
  };
}

// PostgREST select string. The `!posts_profile_id_fkey` hint resolves the FK
// added in the v2 migration.
export const SERVER_POST_SELECT = `
  id,
  title,
  body,
  created_at,
  like_count,
  comment_count,
  author:profiles!posts_profile_id_fkey ( id, username, avatar_url ),
  post_media:post_media!post_id ( id, media_url, media_type )
`;
