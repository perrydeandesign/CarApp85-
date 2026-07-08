// MODIFIED — vendors seed. Idempotent (upsert on handle).
// Run: npm run seed:vendors
// Mirrors the mock VENDORS list into the vendors table so @vendor tags resolve
// to real, linkable records.

import { createClient } from '@supabase/supabase-js';

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
const sb = createClient(URL, KEY, { auth: { persistSession: false } });

// Keep in sync with src/data/vendors.ts (name/handle are what matters for tags).
const VENDORS = [
  { legacy_id: 1, name: 'PERRIN Performance', category: 'Engine', rating: 4.7, review_count: 89, website: 'https://www.perrin.com', color: '#1a2535' },
  { legacy_id: 3, name: 'COBB Tuning', category: 'Engine', rating: 4.8, review_count: 124, website: 'https://www.cobbtuning.com', color: '#1a2520' },
  { legacy_id: 2, name: 'Enkei Wheels', category: 'Wheels & Suspension', rating: 4.9, review_count: 210, website: 'https://www.enkei.com', color: '#25201a' },
  { legacy_id: 6, name: 'Cusco', category: 'Wheels & Suspension', rating: 4.7, review_count: 103, website: 'https://www.cusco.co.jp/en/', color: '#1a2030' },
  { legacy_id: 4, name: 'Recaro Automotive', category: 'Interior', rating: 4.8, review_count: 156, website: 'https://www.recaro-automotive.com', color: '#20152a' },
  { legacy_id: 5, name: 'Varis Japan', category: 'Exterior', rating: 4.6, review_count: 77, website: 'https://varisna.com', color: '#251a20' },
  { legacy_id: 7, name: 'HKS', category: 'Engine', rating: 4.7, review_count: 145, website: 'https://www.hks-power.co.jp/en/', color: '#1a2028' },
  { legacy_id: 8, name: 'Whiteline', category: 'Wheels & Suspension', rating: 4.6, review_count: 98, website: 'https://www.whiteline.com.au', color: '#1a2520' },
  { legacy_id: 9, name: 'Mishimoto', category: 'Engine', rating: 4.5, review_count: 187, website: 'https://www.mishimoto.com', color: '#201a25' },
  { legacy_id: 10, name: 'AEM', category: 'Engine', rating: 4.5, review_count: 112, website: 'https://www.aemintakes.com', color: '#25201a' },
  { legacy_id: 11, name: 'Greddy', category: 'Engine', rating: 4.6, review_count: 93, website: 'https://www.greddy.com', color: '#201a1a' },
  { legacy_id: 12, name: 'Tomei', category: 'Engine', rating: 4.8, review_count: 134, website: 'https://www.tomeiusa.com', color: '#1a2025' },
  { legacy_id: 13, name: 'GrimmSpeed', category: 'Engine', rating: 4.7, review_count: 118, website: 'https://www.grimmspeed.com', color: '#2a1f1a' },
  { legacy_id: 14, name: 'Invidia', category: 'Engine', rating: 4.7, review_count: 162, website: 'https://www.invidiaexhausts.com', color: '#1a2228' },
  { legacy_id: 15, name: 'Turbosmart', category: 'Engine', rating: 4.8, review_count: 176, website: 'https://www.turbosmart.com', color: '#2a1a1f' },
  { legacy_id: 16, name: 'DeatschWerks', category: 'Engine', rating: 4.6, review_count: 104, website: 'https://www.deatschwerks.com', color: '#1a2a20' },
];

// Slug for @handle: lowercase, non-alphanumeric → underscore.
const handleFor = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

async function main() {
  const rows = VENDORS.map((v) => ({ ...v, handle: handleFor(v.name) }));
  const { error } = await sb.from('vendors').upsert(rows, { onConflict: 'handle', ignoreDuplicates: false });
  if (error) {
    console.error('vendors upsert failed:', error.message);
    process.exit(1);
  }
  const { count } = await sb.from('vendors').select('*', { count: 'exact', head: true });
  console.log(`vendors seed complete: ${rows.length} upserted, ${count} total`);
  console.log('handles:', rows.map((r) => '@' + r.handle).join(' '));
}

main();
