-- Push device tokens — run in the Supabase SQL editor. RLS owner-only.
-- Stores APNs/FCM tokens per device so a send-notification path can target a user.

create table if not exists public.device_tokens (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  token      text not null,
  platform   text not null check (platform in ('ios','android')),
  updated_at timestamptz not null default now(),
  primary key (user_id, token)
);
create index if not exists device_tokens_user_idx on public.device_tokens(user_id);

alter table public.device_tokens enable row level security;
drop policy if exists device_tokens_manage_own on public.device_tokens;
create policy device_tokens_manage_own on public.device_tokens
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
