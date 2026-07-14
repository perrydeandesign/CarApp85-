-- =====================================================================
-- CRITICAL RLS HARDENING — run in the Supabase SQL editor (service_role).
-- =====================================================================
-- Found 2026-07-01: the live tables posts / post_media / post_likes /
-- post_comments accept INSERTs from the anon key (which ships in the app
-- bundle) — anon reached the FK/constraint check instead of being blocked
-- by RLS (error 23503 instead of 42501). Root cause: the original policies
-- referenced columns that don't exist on the live tables (posts.author_id /
-- is_published), so the owner-check INSERT policies were never created.
--
-- This script enables RLS and installs correct policies using the ACTUAL
-- live columns (posts.profile_id, post_likes.user_id, post_comments.author_id).
--
-- NOTE: do NOT `supabase db push` — the live DB was built manually and the
-- repo migration history is desynced (engagement.sql references author_id and
-- would fail). Paste this into the SQL editor instead. Idempotent / safe to
-- re-run. Verify afterward with supabase/snippets/rls_verify_2026-07-01.sh.
-- =====================================================================

-- ── posts ────────────────────────────────────────────────────────────
alter table public.posts enable row level security;
-- remove any legacy policies that referenced the wrong columns
drop policy if exists posts_select_published on public.posts;
drop policy if exists posts_insert_author    on public.posts;
drop policy if exists posts_update_author     on public.posts;
drop policy if exists posts_delete_author     on public.posts;
drop policy if exists posts_select_all on public.posts;
drop policy if exists posts_insert_own on public.posts;
drop policy if exists posts_update_own on public.posts;
drop policy if exists posts_delete_own on public.posts;

create policy posts_select_all on public.posts
  for select using (true);
create policy posts_insert_own on public.posts
  for insert to authenticated with check (profile_id = auth.uid());
create policy posts_update_own on public.posts
  for update to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy posts_delete_own on public.posts
  for delete to authenticated using (profile_id = auth.uid());

-- ── post_media (ownership via parent post) ───────────────────────────
alter table public.post_media enable row level security;
drop policy if exists post_media_select on public.post_media;
drop policy if exists post_media_write  on public.post_media;

create policy post_media_select on public.post_media
  for select using (true);
create policy post_media_write on public.post_media
  for all to authenticated
  using (exists (select 1 from public.posts p where p.id = post_media.post_id and p.profile_id = auth.uid()))
  with check (exists (select 1 from public.posts p where p.id = post_media.post_id and p.profile_id = auth.uid()));

-- ── post_likes ───────────────────────────────────────────────────────
alter table public.post_likes enable row level security;
drop policy if exists post_likes_select on public.post_likes;
drop policy if exists post_likes_insert on public.post_likes;
drop policy if exists post_likes_delete on public.post_likes;

create policy post_likes_select on public.post_likes
  for select using (true);
create policy post_likes_insert on public.post_likes
  for insert to authenticated with check (user_id = auth.uid());
create policy post_likes_delete on public.post_likes
  for delete to authenticated using (user_id = auth.uid());

-- ── post_comments ────────────────────────────────────────────────────
alter table public.post_comments enable row level security;
drop policy if exists post_comments_select on public.post_comments;
drop policy if exists post_comments_insert on public.post_comments;
drop policy if exists post_comments_update on public.post_comments;
drop policy if exists post_comments_delete on public.post_comments;

create policy post_comments_select on public.post_comments
  for select using (true);
create policy post_comments_insert on public.post_comments
  for insert to authenticated with check (author_id = auth.uid());
create policy post_comments_update on public.post_comments
  for update to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());
-- comment author OR the post's owner can delete (moderation)
create policy post_comments_delete on public.post_comments
  for delete to authenticated
  using (
    author_id = auth.uid()
    or exists (select 1 from public.posts p where p.id = post_comments.post_id and p.profile_id = auth.uid())
  );

-- =====================================================================
-- END. After running, re-test: anon INSERT into these tables should now
-- return 42501 (row-level security), matching saved_posts / follows.
-- =====================================================================
