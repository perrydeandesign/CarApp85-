-- Demo photo competitions ending in 5 and 3 days (blue / purple in the UI).
-- Idempotent by name. Apply: supabase db query --linked -f supabase/seed_competitions.sql
insert into public.competitions (name, description, ends_at)
select v.name, v.description, v.ends_at from (values
  ('Summer Stance Showdown', 'Best fitment wins — show us your stance.', (now() + interval '5 days')::timestamptz),
  ('Track Weapon of the Week', 'Fastest, most focused track builds.', (now() + interval '3 days')::timestamptz)
) as v(name, description, ends_at)
where not exists (select 1 from public.competitions c where c.name = v.name);
