-- =====================================================================
-- MODIFIED — Phase 1: profiles, posts, media, tags, hashtags, storage.
-- =====================================================================
-- This migration is idempotent (safe to re-run) and covers:
--   1. Extensions
--   2. Profiles linked to auth.users (+ auto-create trigger on signup)
--   3. Posts and their media (multi-photo, IG-style)
--   4. Positional photo tags (pinned to image coordinates)
--   5. Per-post user tags (non-positional)
--   6. Hashtags + post_hashtags
--   7. updated_at trigger
--   8. Indexes
--   9. RLS policies for every table
--  10. Storage buckets `post_media` and `avatars` + their RLS
--
-- Plain-English summary of the security model:
--   * Public read on every user-facing table (this is a public car-feed app).
--   * Write/delete is locked to the row owner via auth.uid().
--   * Photo/post tags can be removed by the tagged user too (self-untag).
--   * Profiles auto-provision on auth.users insert via SECURITY DEFINER trigger.
-- =====================================================================

-- 1. EXTENSIONS -------------------------------------------------------
create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists citext;     -- case-insensitive usernames / hashtags


-- 2. PROFILES ---------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      citext not null unique,
  display_name  text,
  bio           text,
  avatar_url    text,
  car_make      text,
  car_model     text,
  car_year      int,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint username_length check (char_length(username) between 3 and 32),
  constraint username_charset check (username ~ '^[a-zA-Z0-9_.]+$'),
  constraint car_year_range check (car_year is null or (car_year between 1900 and 2100))
);

comment on table public.profiles is 'Public profile, one-per-user, linked to auth.users.';

-- 2a. Auto-create a profile row on signup. Uses SECURITY DEFINER because
-- the trigger fires as the auth schema, but inserts into public.profiles.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  candidate_username citext;
  base_username      citext;
  suffix             text;
begin
  base_username := coalesce(
    nullif(new.raw_user_meta_data->>'username', ''),
    nullif(split_part(new.email, '@', 1), ''),
    'user'
  );
  -- Strip anything not in the allowed charset, then keep it short.
  base_username := regexp_replace(base_username, '[^a-zA-Z0-9_.]', '', 'g');
  if char_length(base_username) < 3 then
    base_username := base_username || 'user';
  end if;
  -- Suffix with a slice of the user id to avoid collisions on common emails.
  suffix := substr(replace(new.id::text, '-', ''), 1, 6);
  candidate_username := substr(base_username, 1, 25) || '_' || suffix;

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    candidate_username,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name'
    ),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 3. POSTS ------------------------------------------------------------
create table if not exists public.posts (
  id            uuid primary key default gen_random_uuid(),
  author_id     uuid not null references public.profiles(id) on delete cascade,
  caption       text,
  location_text text,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint caption_length check (caption is null or char_length(caption) <= 2200)
);
create index if not exists posts_author_created_idx on public.posts (author_id, created_at desc);
create index if not exists posts_created_idx        on public.posts (created_at desc);


-- 4. POST MEDIA (multi-photo, ordered) --------------------------------
create table if not exists public.post_media (
  id            uuid primary key default gen_random_uuid(),
  post_id       uuid not null references public.posts(id) on delete cascade,
  media_type    text not null check (media_type in ('image', 'video')),
  storage_path  text not null,
  position      int  not null default 0,
  width         int,
  height        int,
  created_at    timestamptz not null default now(),
  unique (post_id, position)
);
create index if not exists post_media_post_idx on public.post_media (post_id, position);


-- 5. PHOTO TAGS (positional, like IG "tap to tag") --------------------
create table if not exists public.photo_tags (
  id              uuid primary key default gen_random_uuid(),
  post_media_id   uuid not null references public.post_media(id) on delete cascade,
  tagged_user_id  uuid not null references public.profiles(id)   on delete cascade,
  x               numeric(5,4) not null check (x between 0 and 1),
  y               numeric(5,4) not null check (y between 0 and 1),
  created_at      timestamptz not null default now(),
  unique (post_media_id, tagged_user_id)
);
create index if not exists photo_tags_user_idx on public.photo_tags (tagged_user_id);


-- 6. POST TAGS (non-positional user tags) -----------------------------
create table if not exists public.post_tags (
  post_id         uuid not null references public.posts(id)     on delete cascade,
  tagged_user_id  uuid not null references public.profiles(id)  on delete cascade,
  created_at      timestamptz not null default now(),
  primary key (post_id, tagged_user_id)
);
create index if not exists post_tags_user_idx on public.post_tags (tagged_user_id);


-- 7. HASHTAGS ---------------------------------------------------------
create table if not exists public.hashtags (
  id          uuid primary key default gen_random_uuid(),
  tag         citext not null unique,
  created_at  timestamptz not null default now(),
  constraint tag_length check (char_length(tag) between 1 and 64),
  constraint tag_charset check (tag ~ '^[a-zA-Z0-9_]+$')
);

create table if not exists public.post_hashtags (
  post_id     uuid not null references public.posts(id)    on delete cascade,
  hashtag_id  uuid not null references public.hashtags(id) on delete cascade,
  primary key (post_id, hashtag_id)
);
create index if not exists post_hashtags_hashtag_idx on public.post_hashtags (hashtag_id);


-- 8. updated_at trigger -----------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();


-- 9. ROW-LEVEL SECURITY ----------------------------------------------
alter table public.profiles      enable row level security;
alter table public.posts         enable row level security;
alter table public.post_media    enable row level security;
alter table public.photo_tags    enable row level security;
alter table public.post_tags     enable row level security;
alter table public.hashtags      enable row level security;
alter table public.post_hashtags enable row level security;

-- ── profiles ────────────────────────────────────────────────────────
-- Anyone (anon or signed in) can read profiles. Important: anon read is
-- intentional so an unauthenticated user can preview a profile before sign-in.
drop policy if exists profiles_select_all on public.profiles;
create policy profiles_select_all
  on public.profiles for select
  using (true);

-- Only an authenticated user can insert THEIR own profile row. The auto-
-- trigger above also handles this, but this lets the client correct/upsert.
drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

-- Only the owner can update their own profile.
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Only the owner can delete their own profile (cascades to auth.users? No.
-- This deletes the public.profiles row only; auth deletion is admin-only.)
drop policy if exists profiles_delete_self on public.profiles;
create policy profiles_delete_self
  on public.profiles for delete
  to authenticated
  using (id = auth.uid());

-- ── posts ───────────────────────────────────────────────────────────
-- Anyone can read PUBLISHED posts. Authors can additionally read their
-- own unpublished drafts.
drop policy if exists posts_select_published on public.posts;
create policy posts_select_published
  on public.posts for select
  using (is_published = true or author_id = auth.uid());

-- A signed-in user can only create posts where they are the author.
drop policy if exists posts_insert_author on public.posts;
create policy posts_insert_author
  on public.posts for insert
  to authenticated
  with check (author_id = auth.uid());

drop policy if exists posts_update_author on public.posts;
create policy posts_update_author
  on public.posts for update
  to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

drop policy if exists posts_delete_author on public.posts;
create policy posts_delete_author
  on public.posts for delete
  to authenticated
  using (author_id = auth.uid());

-- ── post_media ──────────────────────────────────────────────────────
-- Read: anyone if the parent post is visible (published or own draft).
drop policy if exists post_media_select on public.post_media;
create policy post_media_select
  on public.post_media for select
  using (
    exists (
      select 1 from public.posts p
      where p.id = post_media.post_id
        and (p.is_published = true or p.author_id = auth.uid())
    )
  );

-- Write: only the parent post's author.
drop policy if exists post_media_write on public.post_media;
create policy post_media_write
  on public.post_media for all
  to authenticated
  using (
    exists (select 1 from public.posts p where p.id = post_media.post_id and p.author_id = auth.uid())
  )
  with check (
    exists (select 1 from public.posts p where p.id = post_media.post_id and p.author_id = auth.uid())
  );

-- ── photo_tags ──────────────────────────────────────────────────────
-- Read: anyone if the underlying post is visible.
drop policy if exists photo_tags_select on public.photo_tags;
create policy photo_tags_select
  on public.photo_tags for select
  using (
    exists (
      select 1
      from public.post_media pm
      join public.posts p on p.id = pm.post_id
      where pm.id = photo_tags.post_media_id
        and (p.is_published = true or p.author_id = auth.uid())
    )
  );

-- Insert: only the post author (you can only tag people in your OWN post).
drop policy if exists photo_tags_insert on public.photo_tags;
create policy photo_tags_insert
  on public.photo_tags for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.post_media pm
      join public.posts p on p.id = pm.post_id
      where pm.id = photo_tags.post_media_id and p.author_id = auth.uid()
    )
  );

-- Delete: the post author OR the tagged user (self-untag).
drop policy if exists photo_tags_delete on public.photo_tags;
create policy photo_tags_delete
  on public.photo_tags for delete
  to authenticated
  using (
    tagged_user_id = auth.uid()
    or exists (
      select 1
      from public.post_media pm
      join public.posts p on p.id = pm.post_id
      where pm.id = photo_tags.post_media_id and p.author_id = auth.uid()
    )
  );

-- ── post_tags ───────────────────────────────────────────────────────
drop policy if exists post_tags_select on public.post_tags;
create policy post_tags_select
  on public.post_tags for select
  using (
    exists (
      select 1 from public.posts p
      where p.id = post_tags.post_id and (p.is_published = true or p.author_id = auth.uid())
    )
  );

drop policy if exists post_tags_insert on public.post_tags;
create policy post_tags_insert
  on public.post_tags for insert
  to authenticated
  with check (
    exists (select 1 from public.posts p where p.id = post_tags.post_id and p.author_id = auth.uid())
  );

drop policy if exists post_tags_delete on public.post_tags;
create policy post_tags_delete
  on public.post_tags for delete
  to authenticated
  using (
    tagged_user_id = auth.uid()
    or exists (select 1 from public.posts p where p.id = post_tags.post_id and p.author_id = auth.uid())
  );

-- ── hashtags ────────────────────────────────────────────────────────
-- Public read so the explore/search screen can list them.
drop policy if exists hashtags_select on public.hashtags;
create policy hashtags_select on public.hashtags for select using (true);

-- Any authenticated user can create a hashtag row (the public.attach_post_hashtag
-- helper below does this). We don't allow updates/deletes from the client;
-- hashtags are functionally write-once.
drop policy if exists hashtags_insert on public.hashtags;
create policy hashtags_insert
  on public.hashtags for insert
  to authenticated
  with check (true);

-- ── post_hashtags ───────────────────────────────────────────────────
drop policy if exists post_hashtags_select on public.post_hashtags;
create policy post_hashtags_select
  on public.post_hashtags for select
  using (
    exists (
      select 1 from public.posts p
      where p.id = post_hashtags.post_id and (p.is_published = true or p.author_id = auth.uid())
    )
  );

drop policy if exists post_hashtags_write on public.post_hashtags;
create policy post_hashtags_write
  on public.post_hashtags for all
  to authenticated
  using (
    exists (select 1 from public.posts p where p.id = post_hashtags.post_id and p.author_id = auth.uid())
  )
  with check (
    exists (select 1 from public.posts p where p.id = post_hashtags.post_id and p.author_id = auth.uid())
  );


-- 10. STORAGE BUCKETS + POLICIES -------------------------------------
-- `post_media`: public read, owner write. Public so we can render images via
--    a stable CDN URL without signing every time.
-- `avatars`: same shape.
-- We use convention: every object's path starts with `<auth_uid>/...` so a
-- single owner-check is `(storage.foldername(name))[1] = auth.uid()::text`.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'post_media',
    'post_media',
    true,
    52428800, -- 50 MB
    array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'video/mp4', 'video/quicktime']
  ),
  (
    'avatars',
    'avatars',
    true,
    5242880, -- 5 MB
    array['image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do nothing;

-- Storage RLS is already enabled by Supabase on storage.objects.

-- ── post_media ──────────────────────────────────────────────────────
drop policy if exists post_media_read on storage.objects;
create policy post_media_read
  on storage.objects for select
  using (bucket_id = 'post_media');

drop policy if exists post_media_upload on storage.objects;
create policy post_media_upload
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'post_media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists post_media_update on storage.objects;
create policy post_media_update
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'post_media'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'post_media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists post_media_delete on storage.objects;
create policy post_media_delete
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'post_media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── avatars ─────────────────────────────────────────────────────────
drop policy if exists avatars_read on storage.objects;
create policy avatars_read
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists avatars_upload on storage.objects;
create policy avatars_upload
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists avatars_update on storage.objects;
create policy avatars_update
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists avatars_delete on storage.objects;
create policy avatars_delete
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================================
-- END Phase 1.
-- =====================================================================
