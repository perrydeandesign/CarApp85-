-- Private dev/session log table — a place to persist engineering session
-- summaries (architecture decisions, fixes, ground-truth findings) so they can
-- be referred back to from Supabase.
--
-- RLS is enabled with NO policies, so the table is inaccessible via the anon or
-- authenticated API keys. Manage it only through the Supabase SQL editor or a
-- service_role connection. Apply with `supabase db push` (or paste into the
-- SQL editor).

create table if not exists public.dev_session_logs (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  summary    text,
  body       text not null,          -- full markdown record
  author     text,
  created_at timestamptz not null default now()
);

alter table public.dev_session_logs enable row level security;
-- No policies on purpose: only service_role (SQL editor / server) can read/write.
