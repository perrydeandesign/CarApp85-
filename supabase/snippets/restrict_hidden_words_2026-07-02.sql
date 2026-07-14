-- Restrict (soft-block) + muted keywords — run in the Supabase SQL editor.
-- Additive; RLS owner-only. Do NOT `supabase db push` (history is desynced).

-- ── Restricted users (IG "Restrict": their comments/DMs are hidden from you,
--    they aren't told) ──────────────────────────────────────────────────────
create table if not exists public.restricted_users (
  restricter_id uuid not null references public.profiles(id) on delete cascade,
  restricted_id uuid not null references public.profiles(id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (restricter_id, restricted_id),
  constraint no_self_restrict check (restricter_id <> restricted_id)
);
create index if not exists restricted_users_restricter_idx on public.restricted_users(restricter_id);

alter table public.restricted_users enable row level security;
drop policy if exists restricted_manage_own on public.restricted_users;
create policy restricted_manage_own on public.restricted_users
  for all to authenticated
  using (restricter_id = auth.uid())
  with check (restricter_id = auth.uid());

-- ── Muted keywords (hide posts/comments containing these words) ─────────────
create table if not exists public.muted_keywords (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  keyword    text not null check (char_length(keyword) between 1 and 60),
  created_at timestamptz not null default now(),
  primary key (user_id, keyword)
);
create index if not exists muted_keywords_user_idx on public.muted_keywords(user_id);

alter table public.muted_keywords enable row level security;
drop policy if exists muted_manage_own on public.muted_keywords;
create policy muted_manage_own on public.muted_keywords
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
