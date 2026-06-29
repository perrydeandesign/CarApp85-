/**
 * Single source of truth for Supabase table names.
 *
 * Before this existed, table names were string literals scattered across ~20
 * hooks — which let duplicate / phantom tables creep in (`likes` vs
 * `post_likes`, `comments` vs `post_comments`, `conversation_participants` vs
 * `conversation_members`, `timeline_entries` vs `posts`). Several of those
 * names pointed at tables that don't exist, so the calls silently failed.
 *
 * Rule: never write `supabase.from('...')` with a string literal again — import
 * `TABLES` and use `supabase.from(TABLES.x)`. One place to change a name, and
 * the type-checker catches typos.
 *
 * Canonical names below were verified against the live database (row counts in
 * parentheses) on the consolidation pass.
 */
export const TABLES = {
  // Core content
  profiles: 'profiles',            // 51
  cars: 'cars',                    // 170
  modifications: 'modifications',  // 2720
  posts: 'posts',                  // 3263  (also backs the timeline, via `type`)
  postMedia: 'post_media',         // 3360

  // Engagement
  postLikes: 'post_likes',         // 8873  (NOT `likes`)
  postComments: 'post_comments',   // 5370  (NOT `comments`)
  follows: 'follows',              // 0
  notifications: 'notifications',  // 51

  // Messaging
  conversations: 'conversations',            // 30
  conversationMembers: 'conversation_members', // 60  (NOT `conversation_participants`)
  messages: 'messages',                       // 30

  // Competitions
  competitions: 'competitions',            // 4
  competitionEntries: 'competition_entries', // 216
  competitionMedia: 'competition_media',   // 408

  // Saved / collections — NOTE: these tables do NOT exist in the DB yet.
  // The Save-to-collection feature needs the migration in
  // supabase/migrations before it will work; until then useCollections runs
  // in a guarded, local-only mode.
  savedPosts: 'saved_posts',
  collections: 'collections',
  collectionPosts: 'collection_posts',
} as const;

export type TableName = (typeof TABLES)[keyof typeof TABLES];

/** Columns for the engagement tables (verified against the live schema). */
export const COLS = {
  postLikes: { user: 'user_id', post: 'post_id' },
  postComments: { author: 'author_id', post: 'post_id', body: 'body' },
  conversationMembers: { conversation: 'conversation_id', profile: 'profile_id' },
  messages: { conversation: 'conversation_id', sender: 'sender_id', body: 'body' },
} as const;
