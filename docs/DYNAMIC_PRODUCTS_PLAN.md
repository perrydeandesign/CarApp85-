# Dynamic Products — Migration Plan

Status: **planned, not started.** Vendors + ~103 products currently live in
`src/data/vendors.ts` (`VENDORS`, `VPRODS`). This plan moves the product catalog
to Supabase while keeping the static data as a fallback, so the app never
regresses if the table is empty or a read fails.

## Why the bridge already exists
`src/data/productKey.ts` derives a stable `productKey(p) = "${vendorId}-${slug}"`.
`saved_products.product_key` and the sale-alert logic key off this. As long as
the migration preserves that exact key, saved items and alerts keep working
across the static→dynamic switch. **This is the invariant to protect.**

## Constraint (from project memory)
The live Supabase DB was built manually and diverges from repo migrations.
**Do NOT `supabase db push`.** Apply the table via a SQL-editor snippet, exactly
like `supabase/snippets/events_2026-07-02.sql`.

## Steps

### 1. Schema — `supabase/snippets/vendor_products_YYYY-MM-DD.sql`
Mirror the `VProduct` shape. Include a `product_key` column that equals
`productKey()` output so it joins to `saved_products`.

```sql
create table if not exists public.vendor_products (
  id           uuid primary key default gen_random_uuid(),
  product_key  text unique not null,           -- "${vendorId}-${slug}" — MUST match productKey()
  vendor_id    integer not null,               -- matches VENDORS[].id (legacy numeric id)
  name         text not null,
  brand        text,
  cat          text not null,
  price        numeric not null,
  was          numeric,                         -- struck price → drives isOnSale()
  badge        text,                            -- 'sale' | 'new' | 'pop' | null
  color        text not null,
  img          text,
  desc         text,
  compat       text,
  fitment      text,
  product_url  text,
  created_at   timestamptz not null default now()
);
create index if not exists vendor_products_vendor_idx on public.vendor_products(vendor_id);

alter table public.vendor_products enable row level security;
drop policy if exists vendor_products_select on public.vendor_products;
create policy vendor_products_select on public.vendor_products for select using (true);
-- No insert/update/delete policy → writes only via service_role (seed script).
```

Note: `fitsSelectedCar` is **not** stored — it's computed per-user at runtime
(`productFitsGarage`), so it stays client-side.

### 2. Seed — `supabase/seed_products.mjs`
Import `VPRODS` from `src/data/vendors.ts`, compute `product_key` with the same
`productKey()` helper, and upsert on `product_key` (idempotent re-runs). Use the
service_role key (same pattern as `seed_vendors.mjs`). Add an `npm run
seed:products` script.

### 3. Read hook — `src/hooks/useVendorProducts.ts`
```ts
// Reads vendor_products; maps rows → VProduct; falls back to static VPRODS
// on error or empty result so the catalog never goes blank.
export function useVendorProducts(): { products: VProduct[]; loading: boolean };
```
Map DB columns → `VProduct` (`product_url`→`productURL`, `desc`, etc.). On error
or `data.length === 0`, return `VPRODS`. Keep `fitsSelectedCar` unset so the
existing runtime `productFitsGarage` path fills it in.

### 4. Wire the UI off the static import
Replace direct `import { VPRODS }` reads in the render path with the hook:
- `src/screens/Vendors/VendorMain.tsx` (featured/trending/results, sale-alert)
- `src/screens/Vendors/VendorDetail.tsx` (`VStore` product rows via `VPRODS`)
- `src/lib/affiliate.ts` `findProductByKey` — this resolves a saved key back to a
  product. Keep it reading the **static** `VPRODS` as the fallback source, or
  pass the hook's list in, so a saved product still resolves if it predates the
  table.

`VENDORS` can stay static for now (already has a `vendors` table used for
tagging); a follow-up can do the same treatment for vendors.

### 5. Verify
- `product_key` values in the table exactly match `productKey()` for every row
  (spot-check a few; a mismatch silently breaks saved items + sale alerts).
- Empty-table and read-error paths fall back to static (temporarily rename the
  table or kill network to confirm).
- Saved products + sale-alert pill still light up after the switch.

## Rough size
Schema snippet + seed + hook + 3 wiring edits. The seed is the bulk (~103 rows,
generated from existing data — no manual entry). Low logic risk; the main hazard
is the `product_key` invariant, which the verify step guards.
