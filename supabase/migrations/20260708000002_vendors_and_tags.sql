-- Vendors backend + post tagging (@people and @vendors in captions).
-- Applied via `supabase db query --linked -f ...` (db push stays unsafe).

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  legacy_id int,
  name text not null,
  handle text unique not null,
  category text,
  description text,
  rating numeric,
  review_count int default 0,
  hero_img text,
  website text,
  color text,
  created_at timestamptz not null default now()
);

create table if not exists public.post_tags (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  tagged_type text not null check (tagged_type in ('profile','vendor')),
  profile_id uuid references public.profiles(id) on delete cascade,
  vendor_id uuid references public.vendors(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint post_tags_target_ck check (
    (tagged_type = 'profile' and profile_id is not null and vendor_id is null) or
    (tagged_type = 'vendor'  and vendor_id  is not null and profile_id is null)
  )
);

create index if not exists post_tags_post_idx on public.post_tags (post_id);
create index if not exists post_tags_profile_idx on public.post_tags (profile_id);
create index if not exists post_tags_vendor_idx on public.post_tags (vendor_id);

alter table public.vendors enable row level security;
alter table public.post_tags enable row level security;

do $$ begin
  create policy vendors_read on public.vendors for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy post_tags_read on public.post_tags for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy post_tags_insert on public.post_tags for insert to authenticated
    with check (exists (select 1 from public.posts p where p.id = post_id and p.profile_id = auth.uid()));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy post_tags_delete on public.post_tags for delete to authenticated
    using (exists (select 1 from public.posts p where p.id = post_id and p.profile_id = auth.uid()));
exception when duplicate_object then null; end $$;
