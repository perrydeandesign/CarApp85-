-- =====================================================================
-- MODIFIED — Phase 2: engagement layer.
-- =====================================================================
-- Adds the social-graph + engagement tables that the frontend already
-- shapes UI around:
--    follows, likes, comments, saved_posts, collections, collection_posts
-- Plus denormalized counter columns on posts and profiles (maintained by
-- triggers) so feed queries don't pay for COUNT(*) subselects.
--
-- Idempotent: safe to re-run.
-- Depends on: 20260617000001_init_profiles_and_posts.sql
--
-- RLS summary in plain English:
--   * follows: public read; only the follower can insert/delete the edge.
--   * likes: public read (used to render "Liked by X and N others"); only
--            the liking user can insert/delete.
--   * comments: public read on visible posts; only the comment author can
--               update/delete their own comment; post author can ALSO
--               delete any comment on their post (moderation).
--   * saved_posts: STRICTLY PRIVATE — only the owner can read/write.
--   * collections: owner can always read/write; non-owners can read only
--                  when is_private = false.
--   * collection_posts: visibility piggybacks on the parent collection.
-- =====================================================================


-- 1. DENORMALIZED COUNTERS -------------------------------------------
alter table public.posts    add column if not exists like_count    int not null default 0;
alter table public.posts    add column if not exists comment_count int not null default 0;
alter table public.profiles add column if not exists follower_count  int not null default 0;
alter table public.profiles add column if not exists following_count int not null default 0;


-- 2. FOLLOWS ---------------------------------------------------------
create table if not exists public.follows (
  follower_id  uuid not null references public.profiles(id) on delete cascade,
  followee_id  uuid not null references public.profiles(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, followee_id),
  constraint no_self_follow check (follower_id <> followee_id)
);
create index if not exists follows_followee_idx on public.follows (followee_id, created_at desc);
create index if not exists follows_follower_idx on public.follows (follower_id, created_at desc);

-- Counter maintenance for follows.
create or replace function public.handle_follow_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (TG_OP = 'INSERT') then
    update public.profiles set follower_count  = follower_count + 1  where id = new.followee_id;
    update public.profiles set following_count = following_count + 1 where id = new.follower_id;
    return new;
  elsif (TG_OP = 'DELETE') then
    update public.profiles set follower_count  = greatest(follower_count - 1, 0)  where id = old.followee_id;
    update public.profiles set following_count = greatest(following_count - 1, 0) where id = old.follower_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists follows_counter on public.follows;
create trigger follows_counter
  after insert or delete on public.follows
  for each row execute function public.handle_follow_change();


-- 3. LIKES -----------------------------------------------------------
create table if not exists public.likes (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  post_id     uuid not null references public.posts(id)    on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, post_id)
);
create index if not exists likes_post_idx on public.likes (post_id, created_at desc);
create index if not exists likes_user_idx on public.likes (user_id, created_at desc);

create or replace function public.handle_like_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (TG_OP = 'INSERT') then
    update public.posts set like_count = like_count + 1 where id = new.post_id;
    return new;
  elsif (TG_OP = 'DELETE') then
    update public.posts set like_count = greatest(like_count - 1, 0) where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists likes_counter on public.likes;
create trigger likes_counter
  after insert or delete on public.likes
  for each row execute function public.handle_like_change();


-- 4. COMMENTS --------------------------------------------------------
create table if not exists public.comments (
  id                 uuid primary key default gen_random_uuid(),
  post_id            uuid not null references public.posts(id)    on delete cascade,
  author_id          uuid not null references public.profiles(id) on delete cascade,
  parent_comment_id  uuid references public.comments(id)          on delete cascade,
  body               text not null,
  is_edited          boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint body_length check (char_length(body) between 1 and 2200)
);
create index if not exists comments_post_idx          on public.comments (post_id, created_at desc);
create index if not exists comments_author_idx        on public.comments (author_id);
create index if not exists comments_parent_idx        on public.comments (parent_comment_id) where parent_comment_id is not null;

-- Counter + updated_at maintenance for comments.
create or replace function public.handle_comment_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.posts set comment_count = comment_count + 1 where id = new.post_id;
  return new;
end;
$$;

create or replace function public.handle_comment_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.posts set comment_count = greatest(comment_count - 1, 0) where id = old.post_id;
  return old;
end;
$$;

create or replace function public.handle_comment_update()
returns trigger
language plpgsql
as $$
begin
  if new.body is distinct from old.body then
    new.is_edited := true;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists comments_after_insert on public.comments;
create trigger comments_after_insert
  after insert on public.comments
  for each row execute function public.handle_comment_insert();

drop trigger if exists comments_after_delete on public.comments;
create trigger comments_after_delete
  after delete on public.comments
  for each row execute function public.handle_comment_delete();

drop trigger if exists comments_before_update on public.comments;
create trigger comments_before_update
  before update on public.comments
  for each row execute function public.handle_comment_update();


-- 5. SAVED POSTS (the "Saved" tray) ----------------------------------
create table if not exists public.saved_posts (
  user_id   uuid not null references public.profiles(id) on delete cascade,
  post_id   uuid not null references public.posts(id)    on delete cascade,
  saved_at  timestamptz not null default now(),
  primary key (user_id, post_id)
);
create index if not exists saved_posts_user_idx on public.saved_posts (user_id, saved_at desc);


-- 6. COLLECTIONS + COLLECTION POSTS ----------------------------------
create table if not exists public.collections (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null references public.profiles(id) on delete cascade,
  name            text not null,
  is_private      boolean not null default true,
  cover_post_id   uuid references public.posts(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint name_length check (char_length(name) between 1 and 60)
);
create index if not exists collections_owner_idx on public.collections (owner_id, created_at desc);

create table if not exists public.collection_posts (
  collection_id  uuid not null references public.collections(id) on delete cascade,
  post_id        uuid not null references public.posts(id)       on delete cascade,
  added_at       timestamptz not null default now(),
  primary key (collection_id, post_id)
);
create index if not exists collection_posts_added_idx on public.collection_posts (collection_id, added_at desc);

-- updated_at on collections
drop trigger if exists collections_set_updated_at on public.collections;
create trigger collections_set_updated_at
  before update on public.collections
  for each row execute function public.set_updated_at();


-- 7. ROW-LEVEL SECURITY ----------------------------------------------
alter table public.follows          enable row level security;
alter table public.likes            enable row level security;
alter table public.comments         enable row level security;
alter table public.saved_posts      enable row level security;
alter table public.collections      enable row level security;
alter table public.collection_posts enable row level security;

-- ── follows ────────────────────────────────────────────────────────
drop policy if exists follows_select on public.follows;
create policy follows_select on public.follows for select using (true);

drop policy if exists follows_insert on public.follows;
create policy follows_insert
  on public.follows for insert
  to authenticated
  with check (follower_id = auth.uid());

drop policy if exists follows_delete on public.follows;
create policy follows_delete
  on public.follows for delete
  to authenticated
  using (follower_id = auth.uid());

-- ── likes ──────────────────────────────────────────────────────────
-- Public read on visible posts only (so we don't leak likes on unpublished drafts).
drop policy if exists likes_select on public.likes;
create policy likes_select
  on public.likes for select
  using (
    exists (
      select 1 from public.posts p
      where p.id = likes.post_id and (p.is_published = true or p.author_id = auth.uid())
    )
  );

drop policy if exists likes_insert on public.likes;
create policy likes_insert
  on public.likes for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists likes_delete on public.likes;
create policy likes_delete
  on public.likes for delete
  to authenticated
  using (user_id = auth.uid());

-- ── comments ───────────────────────────────────────────────────────
drop policy if exists comments_select on public.comments;
create policy comments_select
  on public.comments for select
  using (
    exists (
      select 1 from public.posts p
      where p.id = comments.post_id and (p.is_published = true or p.author_id = auth.uid())
    )
  );

drop policy if exists comments_insert on public.comments;
create policy comments_insert
  on public.comments for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.posts p
      where p.id = comments.post_id and (p.is_published = true or p.author_id = auth.uid())
    )
  );

drop policy if exists comments_update_author on public.comments;
create policy comments_update_author
  on public.comments for update
  to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

-- Comment author OR post author can delete (post author = moderation).
drop policy if exists comments_delete on public.comments;
create policy comments_delete
  on public.comments for delete
  to authenticated
  using (
    author_id = auth.uid()
    or exists (
      select 1 from public.posts p
      where p.id = comments.post_id and p.author_id = auth.uid()
    )
  );

-- ── saved_posts (PRIVATE) ───────────────────────────────────────────
drop policy if exists saved_posts_select on public.saved_posts;
create policy saved_posts_select
  on public.saved_posts for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists saved_posts_insert on public.saved_posts;
create policy saved_posts_insert
  on public.saved_posts for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists saved_posts_delete on public.saved_posts;
create policy saved_posts_delete
  on public.saved_posts for delete
  to authenticated
  using (user_id = auth.uid());

-- ── collections ────────────────────────────────────────────────────
-- Owner: full access. Non-owner: read only when not private.
drop policy if exists collections_select on public.collections;
create policy collections_select
  on public.collections for select
  using (owner_id = auth.uid() or is_private = false);

drop policy if exists collections_insert on public.collections;
create policy collections_insert
  on public.collections for insert
  to authenticated
  with check (owner_id = auth.uid());

drop policy if exists collections_update on public.collections;
create policy collections_update
  on public.collections for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists collections_delete on public.collections;
create policy collections_delete
  on public.collections for delete
  to authenticated
  using (owner_id = auth.uid());

-- ── collection_posts ───────────────────────────────────────────────
drop policy if exists collection_posts_select on public.collection_posts;
create policy collection_posts_select
  on public.collection_posts for select
  using (
    exists (
      select 1 from public.collections c
      where c.id = collection_posts.collection_id
        and (c.owner_id = auth.uid() or c.is_private = false)
    )
  );

drop policy if exists collection_posts_insert on public.collection_posts;
create policy collection_posts_insert
  on public.collection_posts for insert
  to authenticated
  with check (
    exists (
      select 1 from public.collections c
      where c.id = collection_posts.collection_id and c.owner_id = auth.uid()
    )
  );

drop policy if exists collection_posts_delete on public.collection_posts;
create policy collection_posts_delete
  on public.collection_posts for delete
  to authenticated
  using (
    exists (
      select 1 from public.collections c
      where c.id = collection_posts.collection_id and c.owner_id = auth.uid()
    )
  );


-- 8. BACKFILL COUNTERS -----------------------------------------------
-- Reset denormalized counters to match current state. Idempotent: safe
-- to run after manual data ops or on a fresh DB (all zeros).
update public.posts p set
  like_count    = (select count(*) from public.likes    l where l.post_id = p.id),
  comment_count = (select count(*) from public.comments c where c.post_id = p.id);

update public.profiles pr set
  follower_count  = (select count(*) from public.follows f where f.followee_id = pr.id),
  following_count = (select count(*) from public.follows f where f.follower_id = pr.id);


-- =====================================================================
-- END Phase 2.
-- =====================================================================
