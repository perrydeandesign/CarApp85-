-- Groups feature backend.
-- Applied to the live DB via `supabase db query --linked` (NOT db push — the
-- remote migration history is out of sync with this repo). Additive & idempotent.

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  banner_url text,
  icon_url text,
  privacy text not null default 'public' check (privacy in ('public','private')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('member','admin')),
  joined_at timestamptz not null default now(),
  primary key (group_id, profile_id)
);

create table if not exists public.group_posts (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  caption text,
  photos text[] not null default '{}',
  like_count int not null default 0,
  comment_count int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.group_events (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  title text not null,
  location text,
  banner_url text,
  starts_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.group_gallery (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  url text not null,
  created_at timestamptz not null default now()
);

create index if not exists group_members_profile_idx on public.group_members (profile_id);
create index if not exists group_posts_group_idx on public.group_posts (group_id, created_at desc);
create index if not exists group_events_group_idx on public.group_events (group_id, starts_at);
create index if not exists group_gallery_group_idx on public.group_gallery (group_id);

-- RLS: public read (matches the other content tables); writes gated to the user.
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_posts enable row level security;
alter table public.group_events enable row level security;
alter table public.group_gallery enable row level security;

do $$ begin
  create policy groups_read on public.groups for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy group_members_read on public.group_members for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy group_posts_read on public.group_posts for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy group_events_read on public.group_events for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy group_gallery_read on public.group_gallery for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy groups_insert on public.groups for insert to authenticated with check (auth.uid() = created_by);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy group_members_insert on public.group_members for insert to authenticated with check (auth.uid() = profile_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy group_members_delete on public.group_members for delete to authenticated using (auth.uid() = profile_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy group_posts_insert on public.group_posts for insert to authenticated with check (auth.uid() = profile_id);
exception when duplicate_object then null; end $$;
