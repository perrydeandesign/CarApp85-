-- =====================================================================
-- MODIFIED — Phase 2.8: per-user build timeline.
-- =====================================================================
-- Adds:
--   * timeline_category enum
--   * timeline_entries table (user_id is the owner)
--   * RLS: anyone can SELECT; owner can INSERT/UPDATE/DELETE their own.
--
-- Idempotent (safe to re-run).
-- Depends on: 20260617000001_init_profiles_and_posts.sql
-- =====================================================================


-- 1. ENUM ------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'timeline_category') then
    create type public.timeline_category as enum ('event', 'track', 'modification', 'notification');
  end if;
end$$;


-- 2. TABLE -----------------------------------------------------------
create table if not exists public.timeline_entries (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  category      public.timeline_category not null,
  title         text not null check (char_length(title) between 1 and 140),
  description   text,
  image_url     text,
  like_count    integer not null default 0,
  comment_count integer not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists timeline_entries_user_created_idx
  on public.timeline_entries (user_id, created_at desc);


-- 3. ROW-LEVEL SECURITY --------------------------------------------
alter table public.timeline_entries enable row level security;

-- SELECT: timeline is publicly visible on any profile (auth + anon).
drop policy if exists timeline_select_all on public.timeline_entries;
create policy timeline_select_all
  on public.timeline_entries for select
  to authenticated, anon
  using (true);

-- INSERT: only the owner can write entries for themselves.
drop policy if exists timeline_insert_own on public.timeline_entries;
create policy timeline_insert_own
  on public.timeline_entries for insert
  to authenticated
  with check (user_id = auth.uid());

-- UPDATE: owner-only edits (title/description/image).
drop policy if exists timeline_update_own on public.timeline_entries;
create policy timeline_update_own
  on public.timeline_entries for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- DELETE: owner-only.
drop policy if exists timeline_delete_own on public.timeline_entries;
create policy timeline_delete_own
  on public.timeline_entries for delete
  to authenticated
  using (user_id = auth.uid());

-- =====================================================================
-- END Phase 2.8.
-- =====================================================================
