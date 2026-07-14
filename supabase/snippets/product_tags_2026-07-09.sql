-- Shoppable product tags on posts (Feature #2).
-- 2026-07-09. Apply in the Supabase SQL editor (live DB is manual; db push unsafe).
--
-- Extends the existing public.post_tags so a post can tag catalog PRODUCTS
-- (bridged by product_key = vendorId+slug, same key useSavedProducts uses),
-- in addition to the current 'profile' and 'vendor' tags. Idempotent.
--
-- Existing columns: id, post_id, tagged_type('profile'|'vendor'),
--                    profile_id, vendor_id, created_at
-- RLS is unchanged: the existing owner-check INSERT policy (post belongs to
-- auth.uid()) already governs product tags, and the read policy is public.

-- 1. New column for the product identity + optional photo coordinates (0..1)
--    for a future positional "pin" UI. x/y stay null for post-level tags.
alter table public.post_tags add column if not exists product_key text;
alter table public.post_tags add column if not exists x real;
alter table public.post_tags add column if not exists y real;

-- 2. Allow tagged_type='product'. Replace the target check so a product row
--    carries product_key (and no profile_id/vendor_id).
do $$ begin
  alter table public.post_tags drop constraint if exists post_tags_target_ck;
exception when undefined_object then null; end $$;

alter table public.post_tags add constraint post_tags_target_ck check (
  (tagged_type = 'profile' and profile_id is not null and vendor_id is null and product_key is null) or
  (tagged_type = 'vendor'  and vendor_id  is not null and profile_id is null and product_key is null) or
  (tagged_type = 'product' and product_key is not null and profile_id is null and vendor_id is null)
);

create index if not exists post_tags_product_idx on public.post_tags (product_key);

-- Verify:
--   select tagged_type, count(*) from public.post_tags group by 1;
--   insert into public.post_tags (post_id, tagged_type, product_key)
--     values ('<your-post-id>', 'product', '3-cobb-accessport-v3');  -- as the post owner
