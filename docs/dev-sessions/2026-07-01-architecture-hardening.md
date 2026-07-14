# Dev session — 2026-07-01 · Architecture review + Top-5 hardening

**Author:** perrydeandesign@gmail.com (with Claude)
**Branch:** feature/build-spec-card
**Scope:** Architecture review (data layer, navigation, hooks, Supabase integration) → then executed the agreed Top-5 fixes.

## Ground truth discovered (live Supabase schema)
Introspected the live PostgREST OpenAPI (project ref `ingjymkrefdhrkiievby`) read-only. The deployed DB contradicts the repo migrations + `src/types/database.ts`:

- `posts` uses `profile_id` — **no** `author_id`, **no** `is_published`.
- `follows` uses `following_id` (not `followee_id`).
- Engagement tables are `post_likes` / `post_comments`; the `likes` / `comments` tables from `engagement.sql` are **not deployed**.
- Messaging membership is `conversation_members` (not `conversation_participants`).
- Timeline: live has `timelines` (car-based); `timeline_entries` does **not** exist.
- `collections` / `saved_posts` / `collection_posts` / `reports` / `blocked_users` **do exist** (Save + moderation are not phantom). `collections` has no `cover_post_id`.

## Top-5 fixes applied
1. **Killed the dual Supabase client.** `src/lib/data.ts` no longer creates its own client with a `SUPABASE_SERVICE_ROLE_KEY` fallback (which bypassed RLS). `sb` is now an alias to the single auth-aware `supabase` client. **Critical security hole closed.**
2. **Reconciled code to live schema:** `author_id`→`profile_id` + dropped phantom `is_published` (`useProfilePosts`); `followee_id`→`following_id` across `useFollow`, `useFeed`, `useProfilePosts`, `Home.tsx`, `data.ts`; `conversation_participants`→`conversation_members` (`data.ts`); corrected `PostRow`/`FollowRow` in `types/database.ts`.
3. **Nav fixes:** ForgotPassword no longer crashes (uses existing `sendPasswordReset` with the entered email); Logout now actually calls `signOut()` behind a confirm dialog.
4. **Error surfacing:** `useMessages` now exposes an `error` state; `useConversations` no longer swallows step 2/3 errors; message + realtime failures report through `captureError` (Sentry seam in `lib/observability.ts`).
5. **Hardened `mirror-image` Edge Function:** requires a valid user JWT, allow-lists https hosts (SSRF guard), 15 MB size cap.

**Verification:** `tsc --noEmit` — my edits introduced **zero** new type errors (the ~194 pre-existing errors come from missing `react-native-vector-icons` type declarations and the incomplete `Database` type; verified per-file against HEAD baselines).

## Deliberately left for follow-up
- **Backend audit:** `engagement.sql` contradicts live schema and would fail a fresh `supabase db push`; regenerate `src/types/database.ts` with `supabase gen types typescript --linked`; reconcile migrations.
- **#4 scope:** did not rewrite every `return []`-on-error in `data.ts` (large blast radius) — only the actual silent-failure paths (message hooks + realtime).

## Recommended next step
Flip `SKIP_AUTH=false` (`src/config.ts`) and smoke-test — that's when the #1/#2 fixes prove out, because RLS then genuinely applies.
