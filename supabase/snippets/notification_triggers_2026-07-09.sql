-- =====================================================================
-- Notification-generation triggers — rewritten for the LIVE (v2) schema.
-- 2026-07-09.
-- =====================================================================
-- WHY THIS EXISTS
--   migrations/20260618000001_notifications.sql is STALE. It targets tables
--   `likes` / `comments` / `photo_tags` (which do NOT exist on the live DB) and
--   inserts columns `target_user_id` / `post_id` / `comment_id` / `read_at`
--   (which the live `notifications` table does NOT have). Result: liking,
--   commenting, following, and tagging generate NO notifications in production.
--
--   Verified live schema (via PostgREST OpenAPI, 2026-07-09 audit):
--     notifications(id, profile_id→recipient, actor_id, type text, body text,
--                   read bool, created_at)          -- no post_id / read_at
--     post_likes(id, post_id, user_id→profiles, created_at)
--     post_comments(id, post_id, author_id→profiles, body, created_at)
--     follows(follower_id, following_id, created_at)
--     post_tags(id, post_id, tagged_type, profile_id, vendor_id, created_at)
--     posts(id, profile_id→author, type, title, body, ...)
--
--   The app reads notifications by profile_id + boolean `read`, and renders
--   actor.username + a label derived from `type` (like|comment|follow|mention);
--   `body` is only shown for unrecognised types. So we emit those 4 types.
--
-- MENTION MODEL (no double-notify)
--   • @-mentions of PEOPLE in a post caption are persisted as post_tags rows
--     (tagged_type='profile') by src/social/tagging.ts → handled by the
--     post_tags trigger below as type='mention'. We deliberately do NOT also
--     scan posts.body, or mentioned users would be notified twice.
--   • @-mentions inside a COMMENT are not captured as tags, so the comment
--     trigger scans post_comments.body itself.
--
-- DELIVERY / SECURITY
--   Functions are SECURITY DEFINER (owner = postgres) so inserts bypass RLS —
--   the `authenticated` role has no INSERT policy on notifications, by design.
--
-- HOW TO APPLY
--   The live DB was built MANUALLY; `supabase db push` is unsafe. Paste this
--   whole file into the Supabase SQL editor and run it. Idempotent — safe to
--   re-run. Verify with the queries at the bottom.
-- =====================================================================

-- Remove any stale triggers from earlier attempts (old names / wrong tables).
drop trigger if exists likes_notification            on public.post_likes;
drop trigger if exists post_likes_notification        on public.post_likes;
drop trigger if exists comments_notification          on public.post_comments;
drop trigger if exists post_comments_notification     on public.post_comments;
drop trigger if exists comments_mention_notification  on public.post_comments;
drop trigger if exists follows_notification           on public.follows;
drop trigger if exists posts_mention_notification     on public.posts;
drop trigger if exists post_tags_notification         on public.post_tags;


-- =====================================================================
-- 1. LIKE  →  notify the post author.
--    Collapses to one UNREAD 'like' per (recipient, actor): the live table
--    has no post_id, so we can't scope per-post — dedup avoids like-spam.
-- =====================================================================
create or replace function public.notify_on_post_like()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recipient uuid;
begin
  select profile_id into recipient from public.posts where id = new.post_id;
  if recipient is null or recipient = new.user_id then
    return new;
  end if;

  if not exists (
    select 1 from public.notifications
    where profile_id = recipient
      and actor_id   = new.user_id
      and type       = 'like'
      and read       = false
  ) then
    insert into public.notifications (profile_id, actor_id, type, read)
    values (recipient, new.user_id, 'like', false);
  end if;

  return new;
end;
$$;

create trigger post_likes_notification
  after insert on public.post_likes
  for each row execute function public.notify_on_post_like();


-- =====================================================================
-- 2. COMMENT  →  notify the post author, plus @-mentions in the body.
-- =====================================================================
create or replace function public.notify_on_post_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recipient   uuid;
  mention     text;
  mention_uid uuid;
begin
  -- 2a. Notify the post author (unless they commented on their own post).
  select profile_id into recipient from public.posts where id = new.post_id;
  if recipient is not null and recipient <> new.author_id then
    insert into public.notifications (profile_id, actor_id, type, read)
    values (recipient, new.author_id, 'comment', false);
  end if;

  -- 2b. Notify each @-mentioned user in the comment body.
  if new.body is not null then
    for mention in
      select distinct lower(m[1])
      from regexp_matches(new.body, '@([a-zA-Z0-9_.]+)', 'g') as m
    loop
      select id into mention_uid
      from public.profiles
      where lower(username) = mention
      limit 1;

      if mention_uid is not null and mention_uid <> new.author_id then
        if not exists (
          select 1 from public.notifications
          where profile_id = mention_uid
            and actor_id   = new.author_id
            and type       = 'mention'
            and read       = false
        ) then
          insert into public.notifications (profile_id, actor_id, type, read)
          values (mention_uid, new.author_id, 'mention', false);
        end if;
      end if;
    end loop;
  end if;

  return new;
end;
$$;

create trigger post_comments_notification
  after insert on public.post_comments
  for each row execute function public.notify_on_post_comment();


-- =====================================================================
-- 3. FOLLOW  →  notify the followed user. Deduped on unread.
-- =====================================================================
create or replace function public.notify_on_follow()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.follower_id = new.following_id then
    return new;
  end if;

  if not exists (
    select 1 from public.notifications
    where profile_id = new.following_id
      and actor_id   = new.follower_id
      and type       = 'follow'
      and read       = false
  ) then
    insert into public.notifications (profile_id, actor_id, type, read)
    values (new.following_id, new.follower_id, 'follow', false);
  end if;

  return new;
end;
$$;

create trigger follows_notification
  after insert on public.follows
  for each row execute function public.notify_on_follow();


-- =====================================================================
-- 4. POST TAG (person)  →  notify the tagged/mentioned user as 'mention'.
--    Covers both explicit people tags and caption @-mentions (both are
--    persisted as post_tags rows by the composer). Vendor tags are ignored.
--    Actor = the post's author. Deduped on unread.
-- =====================================================================
create or replace function public.notify_on_post_tag()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  author uuid;
begin
  if new.tagged_type <> 'profile' or new.profile_id is null then
    return new;
  end if;

  select profile_id into author from public.posts where id = new.post_id;
  if author is null or author = new.profile_id then
    return new;
  end if;

  if not exists (
    select 1 from public.notifications
    where profile_id = new.profile_id
      and actor_id   = author
      and type       = 'mention'
      and read       = false
  ) then
    insert into public.notifications (profile_id, actor_id, type, read)
    values (new.profile_id, author, 'mention', false);
  end if;

  return new;
end;
$$;

create trigger post_tags_notification
  after insert on public.post_tags
  for each row execute function public.notify_on_post_tag();


-- =====================================================================
-- VERIFY (run after applying)
-- =====================================================================
-- 1) Confirm the 4 triggers are attached to the right tables:
--
--   select event_object_table as table, trigger_name, action_timing, event_manipulation
--   from information_schema.triggers
--   where trigger_name in ('post_likes_notification','post_comments_notification',
--                          'follows_notification','post_tags_notification')
--   order by 1;
--
-- 2) End-to-end smoke test inside a transaction that ROLLS BACK (writes nothing
--    permanent). Replace the two ids with a real post id and a DIFFERENT liker
--    profile id, then run as a block:
--
--   begin;
--     insert into public.post_likes (post_id, user_id)
--     values ('<post-id>', '<liker-profile-id>');
--     select profile_id, actor_id, type, read, created_at
--     from public.notifications
--     order by created_at desc limit 3;   -- expect a fresh 'like' row
--   rollback;
-- =====================================================================
