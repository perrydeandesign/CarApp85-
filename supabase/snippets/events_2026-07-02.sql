-- Event calendar (car meets / events) — run in the Supabase SQL editor.
-- Additive; RLS mirrors competitions + post_likes. Do NOT `supabase db push`.

create table if not exists public.events (
  id             uuid primary key default gen_random_uuid(),
  host_id        uuid not null references public.profiles(id) on delete cascade,
  title          text not null check (char_length(title) between 1 and 120),
  description    text,
  cover_url      text,
  location_text  text,
  lat            double precision,
  lng            double precision,
  starts_at      timestamptz not null,
  ends_at        timestamptz,
  visibility     text not null default 'public' check (visibility in ('public','followers')),
  attendee_count integer not null default 0,
  created_at     timestamptz not null default now()
);
create index if not exists events_starts_idx on public.events(starts_at);
create index if not exists events_host_idx on public.events(host_id);

create table if not exists public.event_attendees (
  event_id   uuid not null references public.events(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  status     text not null default 'going' check (status in ('going','interested')),
  created_at timestamptz not null default now(),
  primary key (event_id, profile_id)
);
create index if not exists event_attendees_profile_idx on public.event_attendees(profile_id);

-- attendee_count maintenance
create or replace function public.handle_event_attendee_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (TG_OP = 'INSERT') then
    update public.events set attendee_count = attendee_count + 1 where id = new.event_id;
    return new;
  elsif (TG_OP = 'DELETE') then
    update public.events set attendee_count = greatest(attendee_count - 1, 0) where id = old.event_id;
    return old;
  end if;
  return null;
end; $$;
drop trigger if exists event_attendees_counter on public.event_attendees;
create trigger event_attendees_counter
  after insert or delete on public.event_attendees
  for each row execute function public.handle_event_attendee_change();

-- RLS
alter table public.events enable row level security;
alter table public.event_attendees enable row level security;

drop policy if exists events_select on public.events;
create policy events_select on public.events for select
  using (visibility = 'public' or host_id = auth.uid());

drop policy if exists events_insert on public.events;
create policy events_insert on public.events for insert to authenticated
  with check (host_id = auth.uid());

drop policy if exists events_update on public.events;
create policy events_update on public.events for update to authenticated
  using (host_id = auth.uid()) with check (host_id = auth.uid());

drop policy if exists events_delete on public.events;
create policy events_delete on public.events for delete to authenticated
  using (host_id = auth.uid());

drop policy if exists event_attendees_select on public.event_attendees;
create policy event_attendees_select on public.event_attendees for select using (true);

drop policy if exists event_attendees_insert on public.event_attendees;
create policy event_attendees_insert on public.event_attendees for insert to authenticated
  with check (profile_id = auth.uid());

drop policy if exists event_attendees_update on public.event_attendees;
create policy event_attendees_update on public.event_attendees for update to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

drop policy if exists event_attendees_delete on public.event_attendees;
create policy event_attendees_delete on public.event_attendees for delete to authenticated
  using (profile_id = auth.uid());
