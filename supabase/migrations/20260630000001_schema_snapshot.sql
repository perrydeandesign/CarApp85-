-- Schema snapshot generated from the live Supabase OpenAPI spec (19 tables).
-- Captures the canonical tables so the DB can be recreated from the repo and
-- ends the drift between code and database.
--
-- Idempotent: CREATE TABLE IF NOT EXISTS only (never alters existing tables).
--
-- LIMITATIONS (OpenAPI can't express these — add by hand for a true rebuild):
--   * foreign keys, indexes, defaults, check constraints
--   * composite primary keys (e.g. conversation_members is (conversation_id,
--     profile_id) — shown here as a single-column PK)
-- For a byte-exact dump, run `pg_dump --schema-only` with the project's
-- DATABASE_URL (not in .env). This snapshot records WHICH tables/columns exist;
-- src/data/tables.ts is the code-side mirror.

create table if not exists public.car_images (
  id uuid primary key,
  car_id uuid not null,
  image_url text not null,
  angle text not null,
  is_primary boolean not null
);

create table if not exists public.cars (
  id uuid primary key,
  profile_id uuid not null,
  make text not null,
  model text not null,
  year integer not null,
  build_type text not null,
  primary_image_url text,
  created_at timestamptz not null
);

create table if not exists public.competition_entries (
  id uuid primary key,
  competition_id uuid not null,
  profile_id uuid not null,
  car_id uuid
);

create table if not exists public.competition_media (
  id uuid primary key,
  entry_id uuid not null,
  media_url text not null
);

create table if not exists public.competitions (
  id uuid primary key,
  name text not null,
  description text,
  ends_at timestamptz not null
);

create table if not exists public.conversation_members (
  conversation_id uuid primary key,
  profile_id uuid primary key
);

create table if not exists public.conversations (
  id uuid primary key,
  created_at timestamptz not null
);

create table if not exists public.follows (
  follower_id uuid primary key,
  following_id uuid primary key,
  created_at timestamptz
);

create table if not exists public.hashtags (
  id uuid primary key,
  tag text not null,
  created_at timestamptz not null
);

create table if not exists public.messages (
  id uuid primary key,
  conversation_id uuid not null,
  sender_id uuid not null,
  body text not null,
  created_at timestamptz not null
);

create table if not exists public.modifications (
  id uuid primary key,
  car_id uuid not null,
  category text not null,
  details text,
  created_at timestamptz,
  name text,
  notes text
);

create table if not exists public.notifications (
  id uuid primary key,
  profile_id uuid not null,
  actor_id uuid,
  type text not null,
  body text,
  read boolean not null,
  created_at timestamptz not null
);

create table if not exists public.post_comments (
  id uuid primary key,
  post_id uuid not null,
  author_id uuid not null,
  body text not null,
  created_at timestamptz
);

create table if not exists public.post_hashtags (
  post_id uuid primary key,
  hashtag_id uuid primary key
);

create table if not exists public.post_likes (
  id uuid primary key,
  post_id uuid not null,
  user_id uuid not null,
  created_at timestamptz
);

create table if not exists public.post_media (
  id uuid primary key,
  post_id uuid not null,
  media_type text not null,
  width integer,
  height integer,
  created_at timestamptz not null,
  media_url text not null
);

create table if not exists public.posts (
  id uuid primary key,
  profile_id uuid not null,
  car_id uuid,
  type text not null,
  title text not null,
  body text not null,
  created_at timestamptz not null,
  like_count integer not null,
  comment_count integer not null
);

create table if not exists public.profiles (
  id uuid primary key,
  username text not null,
  full_name text,
  bio text,
  avatar_url text,
  location text,
  created_at timestamptz,
  display_name text
);

create table if not exists public.timelines (
  id uuid primary key,
  car_id uuid not null,
  title text not null,
  description text,
  event_date text,
  created_at timestamptz
);

