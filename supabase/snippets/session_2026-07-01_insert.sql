-- Save the 2026-07-01 architecture-hardening session into Supabase.
-- Prereq: apply migration 20260701000001_dev_session_logs.sql first.
-- Run this in the Supabase SQL editor (service_role context) — the anon key
-- cannot write to this table by design.
--
-- The full record lives in docs/dev-sessions/2026-07-01-architecture-hardening.md;
-- this stores a copy in the DB. Dollar-quoting ($log$) avoids escaping issues.

insert into public.dev_session_logs (title, summary, author, body)
values (
  'Architecture review + Top-5 hardening',
  'Reviewed data layer/nav/hooks/Supabase; introspected live schema; killed dual client (removed service_role fallback), reconciled schema mismatches, fixed nav crash/logout, added error surfacing, hardened mirror-image edge function.',
  'perrydeandesign@gmail.com',
  $log$
GROUND TRUTH (live schema): posts uses profile_id (no author_id/is_published);
follows uses following_id; engagement = post_likes/post_comments (likes/comments
NOT deployed); messaging = conversation_members; timeline = timelines (NOT
timeline_entries); collections/saved_posts/collection_posts/reports/blocked_users
DO exist (collections has no cover_post_id).

TOP-5 FIXES:
1. Killed dual Supabase client — removed SUPABASE_SERVICE_ROLE_KEY fallback in
   src/lib/data.ts; sb is now an alias to the auth-aware supabase client. Closes
   the critical RLS-bypass security hole.
2. Reconciled code to live schema: author_id->profile_id + dropped is_published
   (useProfilePosts); followee_id->following_id (useFollow, useFeed,
   useProfilePosts, Home.tsx, data.ts); conversation_participants->
   conversation_members (data.ts); fixed PostRow/FollowRow types.
3. Nav: ForgotPassword no longer crashes (sendPasswordReset with entered email);
   Logout actually calls signOut() with a confirm dialog.
4. Error surfacing: useMessages exposes error state; useConversations stops
   swallowing step 2/3 errors; message + realtime failures report via
   captureError (Sentry seam).
5. Hardened mirror-image edge function: requires user JWT, https host allowlist
   (SSRF guard), 15 MB size cap.

VERIFICATION: tsc --noEmit — zero new type errors from these edits (~194
pre-existing from missing vector-icons types + incomplete Database type).

LEFT FOR FOLLOW-UP: regenerate database.ts (supabase gen types --linked);
reconcile engagement.sql vs live; broaden data.ts error contracts; flip
SKIP_AUTH=false and smoke-test.
  $log$
);
