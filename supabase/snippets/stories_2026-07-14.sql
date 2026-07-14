-- =====================================================================
-- Ephemeral Stories — tables, RLS, and the story_media storage bucket.
-- 2026-07-14.
-- =====================================================================
-- WHY THIS EXISTS
--   Adds Instagram-style 24h stories. Backs src/hooks/useUploadStory.ts,
--   src/hooks/useStoriesFeed.ts, and the Stories rail/composer/viewer.
--
--   Conventions match the LIVE (v2) schema:
--     • authorship column is `profile_id` (like posts), FK → profiles(id)
--       named stories_profile_id_fkey so PostgREST can embed
--       `profiles!stories_profile_id_fkey`.
--     • storage path is `<auth_uid>/<file>` (same as post_media / avatars).
--
-- HOW TO APPLY
--   The live DB was built MANUALLY; `supabase db push` is unsafe. Paste this
--   whole file into the Supabase SQL editor and run it. Idempotent — safe to
--   re-run. After applying, regenerate types:
--     supabase gen types typescript --linked > src/types/database.ts
--   (then src/lib/storiesDb.ts's untyped escape hatch can be dropped).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. TABLES
-- ---------------------------------------------------------------------
create table if not exists public.stories (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles (id) on delete cascade,
  media_url   text not null,
  media_type  text not null default 'image' check (media_type in ('image', 'video')),
  caption     text,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default (now() + interval '24 hours')
);

create index if not exists stories_active_idx on public.stories (expires_at);
create index if not exists stories_profile_idx on public.stories (profile_id);

create table if not exists public.story_views (
  story_id   uuid not null references public.stories (id) on delete cascade,
  viewer_id  uuid not null references public.profiles (id) on delete cascade,
  viewed_at  timestamptz not null default now(),
  primary key (story_id, viewer_id)
);

-- ---------------------------------------------------------------------
-- 2. RLS
-- ---------------------------------------------------------------------
alter table public.stories      enable row level security;
alter table public.story_views  enable row level security;

-- stories: anyone signed in sees ACTIVE stories (or their own, even expired);
-- authors manage their own rows.
drop policy if exists stories_select on public.stories;
create policy stories_select on public.stories
  for select to authenticated
  using (expires_at > now() or profile_id = auth.uid());

drop policy if exists stories_insert on public.stories;
create policy stories_insert on public.stories
  for insert to authenticated
  with check (profile_id = auth.uid());

drop policy if exists stories_delete on public.stories;
create policy stories_delete on public.stories
  for delete to authenticated
  using (profile_id = auth.uid());

-- story_views: a viewer records their own views; the story owner + the viewer
-- can read them (owner sees who watched).
drop policy if exists story_views_insert on public.story_views;
create policy story_views_insert on public.story_views
  for insert to authenticated
  with check (viewer_id = auth.uid());

drop policy if exists story_views_select on public.story_views;
create policy story_views_select on public.story_views
  for select to authenticated
  using (
    viewer_id = auth.uid()
    or exists (
      select 1 from public.stories s
      where s.id = story_views.story_id and s.profile_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------
-- 3. STORAGE BUCKET (mirrors post_media: public read, owner write)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('story_media', 'story_media', true)
on conflict (id) do nothing;

drop policy if exists story_media_read on storage.objects;
create policy story_media_read on storage.objects
  for select to public
  using (bucket_id = 'story_media');

drop policy if exists story_media_insert on storage.objects;
create policy story_media_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'story_media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists story_media_delete on storage.objects;
create policy story_media_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'story_media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------
-- VERIFY (run after applying)
-- ---------------------------------------------------------------------
-- select table_name from information_schema.tables
--   where table_schema = 'public' and table_name in ('stories','story_views');
-- select id, public from storage.buckets where id = 'story_media';
-- =====================================================================
