-- =====================================================================
-- Owner-write RLS for `modifications` — enables the per-car build editor.
-- 2026-07-13.  Paste into the Supabase SQL editor (db push unsafe — live DB
-- was built manually). Idempotent.
-- =====================================================================
-- A modification belongs to a car (modifications.car_id → cars.id), and a car
-- belongs to a profile (cars.profile_id → profiles.id = auth.uid()). So a user
-- may write a mod iff they own its car. Public read stays open.
-- =====================================================================

alter table public.modifications enable row level security;

drop policy if exists modifications_select on public.modifications;
create policy modifications_select on public.modifications
  for select using (true);

drop policy if exists modifications_insert on public.modifications;
create policy modifications_insert on public.modifications
  for insert to authenticated
  with check (exists (
    select 1 from public.cars c
    where c.id = modifications.car_id and c.profile_id = auth.uid()
  ));

drop policy if exists modifications_update on public.modifications;
create policy modifications_update on public.modifications
  for update to authenticated
  using (exists (
    select 1 from public.cars c
    where c.id = modifications.car_id and c.profile_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.cars c
    where c.id = modifications.car_id and c.profile_id = auth.uid()
  ));

drop policy if exists modifications_delete on public.modifications;
create policy modifications_delete on public.modifications
  for delete to authenticated
  using (exists (
    select 1 from public.cars c
    where c.id = modifications.car_id and c.profile_id = auth.uid()
  ));

-- VERIFY: 4 policies (select/insert/update/delete) on modifications
--   select policyname, cmd from pg_policies where tablename = 'modifications' order by cmd;
