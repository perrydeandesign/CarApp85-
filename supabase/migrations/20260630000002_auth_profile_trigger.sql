-- Auto-create a `profiles` row whenever a new auth user signs up.
-- This is the production pattern (a DB trigger), so a profile always exists for
-- every authenticated user. The client also self-heals a missing row in
-- useMeProfile as a belt-and-suspenders fallback.
--
-- Apply via the Supabase SQL editor or `supabase db push` (DDL can't be run
-- through the REST API).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'username',
      split_part(new.email, '@', 1),
      'user'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
