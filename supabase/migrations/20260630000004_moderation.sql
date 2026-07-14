-- UGC moderation: report content + block users (App Store guideline 1.2).
-- Apply via the Supabase SQL editor or `supabase db push`.

-- Reports filed by users against posts / comments / users.
create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('post','comment','user')),
  target_id   uuid not null,
  reason      text not null,
  details     text,
  status      text not null default 'open' check (status in ('open','reviewed','actioned','dismissed')),
  created_at  timestamptz not null default now()
);
create index if not exists reports_status_idx on public.reports(status, created_at desc);
create index if not exists reports_target_idx on public.reports(target_type, target_id);

-- User blocks — a blocker hides a blocked user's content app-wide.
create table if not exists public.blocked_users (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);
create index if not exists blocked_users_blocker_idx on public.blocked_users(blocker_id);

alter table public.reports       enable row level security;
alter table public.blocked_users enable row level security;

-- Anyone signed in can file a report; only the reporter can see their own.
create policy "file reports"  on public.reports
  for insert with check (auth.uid() = reporter_id);
create policy "see own reports" on public.reports
  for select using (auth.uid() = reporter_id);

-- Users fully manage their own block list.
create policy "manage own blocks" on public.blocked_users
  for all using (auth.uid() = blocker_id) with check (auth.uid() = blocker_id);
