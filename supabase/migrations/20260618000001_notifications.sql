-- =====================================================================
-- ⚠️ STALE / NOT DEPLOYED — DO NOT TRUST THIS FILE FOR THE LIVE SCHEMA.
-- The live `notifications` table is a different ("v2") shape
-- (profile_id, actor_id, type, body, read, created_at) and the live
-- engagement tables are post_likes / post_comments / post_tags — NOT the
-- likes / comments / photo_tags this file targets. The working triggers live
-- in supabase/snippets/notification_triggers_2026-07-09.sql (apply via the SQL
-- editor). Kept only for history. See memory: live-schema-ground-truth.
-- =====================================================================
-- MODIFIED — Phase 2.7: notifications.
-- =====================================================================
-- Adds:
--   * notification_type enum
--   * notifications table (target_user_id is the recipient)
--   * 5 SECURITY DEFINER trigger functions that auto-insert notifications on:
--       likes insert, comments insert (post-author notification),
--       follows insert, photo_tags insert, post_tags insert
--   * 2 mention-parsing triggers (post caption + comment body)
--   * RLS: target recipient can SELECT/UPDATE/DELETE their own notifications.
--          Clients CANNOT insert directly — only triggers (SECURITY DEFINER) can.
--
-- Idempotent (safe to re-run).
-- Depends on: 20260617000001_init_profiles_and_posts.sql,
--             20260617000002_engagement.sql
-- =====================================================================


-- 1. ENUM ------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'notification_type') then
    create type public.notification_type as enum ('like', 'comment', 'follow', 'tag', 'mention');
  end if;
end$$;


-- 2. TABLE -----------------------------------------------------------
create table if not exists public.notifications (
  id              uuid primary key default gen_random_uuid(),
  actor_id        uuid not null references public.profiles(id) on delete cascade,
  target_user_id  uuid not null references public.profiles(id) on delete cascade,
  type            public.notification_type not null,
  post_id         uuid references public.posts(id)    on delete cascade,
  comment_id      uuid references public.comments(id) on delete cascade,
  created_at      timestamptz not null default now(),
  read_at         timestamptz,
  constraint no_self_notification check (actor_id <> target_user_id)
);

create index if not exists notifications_target_idx
  on public.notifications (target_user_id, created_at desc);

create index if not exists notifications_unread_idx
  on public.notifications (target_user_id)
  where read_at is null;

-- A like + post can only generate one notification per actor/post pair.
create unique index if not exists notifications_like_unique
  on public.notifications (actor_id, target_user_id, post_id)
  where type = 'like';

-- One follow notification per actor → target.
create unique index if not exists notifications_follow_unique
  on public.notifications (actor_id, target_user_id)
  where type = 'follow';


-- 3. TRIGGER: LIKES → notification ----------------------------------
create or replace function public.handle_new_like_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  post_author uuid;
begin
  select author_id into post_author from public.posts where id = new.post_id;
  if post_author is not null and post_author <> new.user_id then
    insert into public.notifications (actor_id, target_user_id, type, post_id)
    values (new.user_id, post_author, 'like', new.post_id)
    on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists likes_notification on public.likes;
create trigger likes_notification
  after insert on public.likes
  for each row execute function public.handle_new_like_notification();


-- 4. TRIGGER: COMMENTS → notification + mention scan ---------------
-- 4a. Post-author notification (the comment author told the post owner something).
create or replace function public.handle_new_comment_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  post_author uuid;
begin
  select author_id into post_author from public.posts where id = new.post_id;
  if post_author is not null and post_author <> new.author_id then
    insert into public.notifications (actor_id, target_user_id, type, post_id, comment_id)
    values (new.author_id, post_author, 'comment', new.post_id, new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists comments_notification on public.comments;
create trigger comments_notification
  after insert on public.comments
  for each row execute function public.handle_new_comment_notification();

-- 4b. @-mention notifications inside the comment body.
create or replace function public.handle_comment_mentions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  mention citext;
  mention_uid uuid;
begin
  if new.body is null then return new; end if;
  for mention in
    select distinct lower((m)[1])::citext
    from regexp_matches(new.body, '@([a-zA-Z0-9_.]+)', 'g') as m
  loop
    select id into mention_uid from public.profiles where username = mention;
    if mention_uid is not null and mention_uid <> new.author_id then
      insert into public.notifications (actor_id, target_user_id, type, post_id, comment_id)
      values (new.author_id, mention_uid, 'mention', new.post_id, new.id);
    end if;
  end loop;
  return new;
end;
$$;

drop trigger if exists comments_mention_notification on public.comments;
create trigger comments_mention_notification
  after insert on public.comments
  for each row execute function public.handle_comment_mentions();


-- 5. TRIGGER: POSTS caption → mention notifications ---------------
create or replace function public.handle_post_caption_mentions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  mention citext;
  mention_uid uuid;
begin
  if new.caption is null then return new; end if;
  for mention in
    select distinct lower((m)[1])::citext
    from regexp_matches(new.caption, '@([a-zA-Z0-9_.]+)', 'g') as m
  loop
    select id into mention_uid from public.profiles where username = mention;
    if mention_uid is not null and mention_uid <> new.author_id then
      insert into public.notifications (actor_id, target_user_id, type, post_id)
      values (new.author_id, mention_uid, 'mention', new.id);
    end if;
  end loop;
  return new;
end;
$$;

drop trigger if exists posts_mention_notification on public.posts;
create trigger posts_mention_notification
  after insert on public.posts
  for each row execute function public.handle_post_caption_mentions();


-- 6. TRIGGER: FOLLOWS → notification --------------------------------
create or replace function public.handle_new_follow_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.follower_id <> new.followee_id then
    insert into public.notifications (actor_id, target_user_id, type)
    values (new.follower_id, new.followee_id, 'follow')
    on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists follows_notification on public.follows;
create trigger follows_notification
  after insert on public.follows
  for each row execute function public.handle_new_follow_notification();


-- 7. TRIGGER: PHOTO_TAGS → notification -----------------------------
create or replace function public.handle_new_photo_tag_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  parent_post_id uuid;
  post_author    uuid;
begin
  select pm.post_id, p.author_id
    into parent_post_id, post_author
  from public.post_media pm
  join public.posts p on p.id = pm.post_id
  where pm.id = new.post_media_id;

  if post_author is not null and post_author <> new.tagged_user_id then
    insert into public.notifications (actor_id, target_user_id, type, post_id)
    values (post_author, new.tagged_user_id, 'tag', parent_post_id);
  end if;
  return new;
end;
$$;

drop trigger if exists photo_tags_notification on public.photo_tags;
create trigger photo_tags_notification
  after insert on public.photo_tags
  for each row execute function public.handle_new_photo_tag_notification();


-- 8. TRIGGER: POST_TAGS → notification ------------------------------
create or replace function public.handle_new_post_tag_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  post_author uuid;
begin
  select author_id into post_author from public.posts where id = new.post_id;
  if post_author is not null and post_author <> new.tagged_user_id then
    insert into public.notifications (actor_id, target_user_id, type, post_id)
    values (post_author, new.tagged_user_id, 'tag', new.post_id);
  end if;
  return new;
end;
$$;

drop trigger if exists post_tags_notification on public.post_tags;
create trigger post_tags_notification
  after insert on public.post_tags
  for each row execute function public.handle_new_post_tag_notification();


-- 9. ROW-LEVEL SECURITY --------------------------------------------
alter table public.notifications enable row level security;

-- SELECT: only the recipient sees their own.
drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own
  on public.notifications for select
  to authenticated
  using (target_user_id = auth.uid());

-- UPDATE: only the recipient can mark as read.
drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own
  on public.notifications for update
  to authenticated
  using (target_user_id = auth.uid())
  with check (target_user_id = auth.uid());

-- DELETE: recipient can dismiss/delete.
drop policy if exists notifications_delete_own on public.notifications;
create policy notifications_delete_own
  on public.notifications for delete
  to authenticated
  using (target_user_id = auth.uid());

-- INSERT policy is INTENTIONALLY OMITTED.
-- Triggers run as SECURITY DEFINER (owner: postgres) and bypass RLS.
-- Without an INSERT policy, the `authenticated` role cannot insert
-- notifications directly — they can only originate from the triggers.

-- =====================================================================
-- END Phase 2.7.
-- =====================================================================
