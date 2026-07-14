-- =====================================================================
-- CRITICAL RLS HARDENING v2 — run in the Supabase SQL editor (service_role).
-- =====================================================================
-- v1 didn't take effect (anon INSERT still returns 23503, not 42501). Most
-- likely the tables carry a LEFTOVER PERMISSIVE policy from manual dashboard
-- setup (e.g. "Enable insert for all users") whose name v1 didn't drop, and
-- policies are OR'd so the permissive one still wins.
--
-- This version DROPS EVERY existing policy on each of the 4 tables (dynamically
-- via pg_policies), guarantees RLS is enabled, then installs the correct
-- owner-check policies using the LIVE columns.
--
-- Safe / idempotent. Paste the whole thing and run once. Then re-run
-- bash supabase/snippets/rls_verify_2026-07-01.sh  (expect 4x PASS / 42501).
-- =====================================================================

do $$
declare
  t   text;
  pol record;
begin
  foreach t in array array['posts','post_media','post_likes','post_comments']
  loop
    -- 1. drop ALL existing policies on this table (whatever they're named)
    for pol in
      select policyname from pg_policies
      where schemaname = 'public' and tablename = t
    loop
      execute format('drop policy if exists %I on public.%I', pol.policyname, t);
    end loop;
    -- 2. make sure RLS is actually on
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- ── posts ────────────────────────────────────────────────────────────
create policy posts_select_all on public.posts
  for select using (true);
create policy posts_insert_own on public.posts
  for insert to authenticated with check (profile_id = auth.uid());
create policy posts_update_own on public.posts
  for update to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy posts_delete_own on public.posts
  for delete to authenticated using (profile_id = auth.uid());

-- ── post_media (ownership via parent post) ───────────────────────────
create policy post_media_select on public.post_media
  for select using (true);
create policy post_media_write on public.post_media
  for all to authenticated
  using (exists (select 1 from public.posts p where p.id = post_media.post_id and p.profile_id = auth.uid()))
  with check (exists (select 1 from public.posts p where p.id = post_media.post_id and p.profile_id = auth.uid()));

-- ── post_likes ───────────────────────────────────────────────────────
create policy post_likes_select on public.post_likes
  for select using (true);
create policy post_likes_insert on public.post_likes
  for insert to authenticated with check (user_id = auth.uid());
create policy post_likes_delete on public.post_likes
  for delete to authenticated using (user_id = auth.uid());

-- ── post_comments ────────────────────────────────────────────────────
create policy post_comments_select on public.post_comments
  for select using (true);
create policy post_comments_insert on public.post_comments
  for insert to authenticated with check (author_id = auth.uid());
create policy post_comments_update on public.post_comments
  for update to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy post_comments_delete on public.post_comments
  for delete to authenticated
  using (
    author_id = auth.uid()
    or exists (select 1 from public.posts p where p.id = post_comments.post_id and p.profile_id = auth.uid())
  );

-- =====================================================================
-- Sanity check — list policies now on the 4 tables (should show the
-- owner-check policies above and nothing permissive):
select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
  and tablename in ('posts','post_media','post_likes','post_comments')
order by tablename, cmd;
-- =====================================================================
