-- Per-user saved products (for sale alerts). Keyed by a stable product_key
-- (vendorId + slug) so it bridges the current mock catalog and a future
-- products table. Applied via `supabase db query --linked -f ...`.

create table if not exists public.saved_products (
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_key text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, product_key)
);

alter table public.saved_products enable row level security;

-- Private to the owner.
do $$ begin
  create policy saved_products_select on public.saved_products for select
    using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy saved_products_insert on public.saved_products for insert to authenticated
    with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy saved_products_delete on public.saved_products for delete to authenticated
    using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
