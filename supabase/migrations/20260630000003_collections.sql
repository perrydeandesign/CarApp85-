-- Save / Collections feature tables. The app already references these
-- (useCollections, useFeed, SaveToSheet) but they didn't exist — so Save ran
-- in a guarded local-only mode. This migration "un-phantoms" them.
--
-- Apply via the Supabase SQL editor or `supabase db push`.

-- A user's quick-saved posts (the default "Saved" bucket).
create table if not exists public.saved_posts (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  post_id    uuid not null references public.posts(id) on delete cascade,
  saved_at   timestamptz not null default now(),
  primary key (user_id, post_id)
);
create index if not exists saved_posts_user_idx on public.saved_posts(user_id);

-- Named collections owned by a user.
create table if not exists public.collections (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  is_private  boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists collections_owner_idx on public.collections(owner_id);

-- Posts inside a collection.
create table if not exists public.collection_posts (
  collection_id uuid not null references public.collections(id) on delete cascade,
  post_id       uuid not null references public.posts(id) on delete cascade,
  added_at      timestamptz not null default now(),
  primary key (collection_id, post_id)
);

-- RLS — owners manage their own saves/collections.
alter table public.saved_posts      enable row level security;
alter table public.collections      enable row level security;
alter table public.collection_posts enable row level security;

create policy "own saves"        on public.saved_posts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own collections"  on public.collections
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "own collection_posts" on public.collection_posts
  for all using (
    exists (select 1 from public.collections c
            where c.id = collection_id and c.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.collections c
            where c.id = collection_id and c.owner_id = auth.uid())
  );
