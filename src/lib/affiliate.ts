import { VPRODS } from '../data/vendors';
import { productKey } from '../data/productKey';
import type { VProduct } from '../constants/types';

// Outbound-link attribution + affiliate wrapper. Every "Buy / Visit / Share"
// tap routes through here so we can attribute (and later monetise) outbound
// clicks.
//
// Two layers:
//   1. Default UTM tagging — applied to EVERY web link now, so outbound clicks
//      are trackable in analytics even before any affiliate program exists.
//   2. Per-vendor affiliate program — once you have an account (AvantLink /
//      Impact / Amazon / Skimlinks …), add the vendor's numeric id to AFFILIATE
//      with a function that decorates/wraps the URL with that program's tracking
//      params. When a program is present it fully owns the URL (it carries its
//      own attribution), so the default UTM is skipped for that vendor.
const AFFILIATE: Record<number, (url: string) => string> = {
  // Example — COBB Tuning (vendorId 3) via an Impact-style tracking param:
  // 3: (url) => appendParams(url, { irclickid: 'modified', utm_source: 'modified' }),
};

/** Our attribution token, stamped on every un-programmed outbound link. */
const UTM_SOURCE = 'modified';

function utm(medium: string): Record<string, string> {
  return { utm_source: UTM_SOURCE, utm_medium: medium, utm_campaign: 'vendor' };
}

/**
 * Append query params to a URL without clobbering an existing query string or
 * URL #fragment, and without duplicating keys the URL already carries. Tracking
 * params are inserted before any fragment (where servers expect them).
 */
function appendParams(url: string, params: Record<string, string>): string {
  const hashIdx = url.indexOf('#');
  const base = hashIdx === -1 ? url : url.slice(0, hashIdx);
  const hash = hashIdx === -1 ? '' : url.slice(hashIdx);

  const qIdx = base.indexOf('?');
  const existingKeys = new Set(
    qIdx === -1 ? [] : base.slice(qIdx + 1).split('&').map((p) => p.split('=')[0]),
  );

  const entries = Object.entries(params).filter(([k, v]) => v && !existingKeys.has(k));
  if (!entries.length) return url;

  const qs = entries
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  const sep = qIdx === -1 ? '?' : '&';
  return `${base}${sep}${qs}${hash}`;
}

/**
 * Decorate any outbound URL for a vendor: the vendor's affiliate program when
 * configured, otherwise default UTM attribution. Non-web links (mailto:, tel:,
 * app deep links) and empty values are returned untouched. `medium` tags where
 * the click came from (e.g. 'buy', 'visit', 'share').
 */
export function decorateUrl(
  rawUrl: string | null | undefined,
  vendorId?: number,
  medium = 'app',
): string | null {
  if (!rawUrl) return null;
  if (!/^https?:\/\//i.test(rawUrl)) return rawUrl;
  const program = vendorId != null ? AFFILIATE[vendorId] : undefined;
  if (program) return program(rawUrl);
  return appendParams(rawUrl, utm(medium));
}

/** Resolve a stable product_key back to its catalog product. */
export function findProductByKey(key: string): VProduct | null {
  return VPRODS.find((p) => productKey(p) === key) ?? null;
}

/**
 * True when `url` points at a specific product/model page (a real destination),
 * rather than a homepage, collection, or category landing. We only trust a
 * stored productURL for "Buy" when it's specific; otherwise we fall back to a
 * live search so the tap NEVER dead-ends on a homepage.
 */
export function isSpecificProductUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const path = new URL(url).pathname.replace(/\/+$/, '');
    if (!path) return false; // bare homepage
    return (
      /\/products\/.+/.test(path) ||           // Shopify / BigCommerce PDP
      /\.html$/.test(path) ||                   // retailer PDP (e.g. smyperformance)
      /\/dynamic\/recaro-.+/.test(path) ||      // Recaro model page
      /\/varis-.+/.test(path) ||                // Varis product page
      /\/shop\/wheels\/[^/]+\/[^/]+/.test(path) // Enkei model page
    );
    // Collections / category / homepage all fall through as non-specific.
  } catch {
    return false;
  }
}

// Vendors whose parts are stocked by SubiSpeed (Subaru-focused megastore, and
// the source of most catalog imagery). Un-linked products for these route to a
// SubiSpeed product search; everything else falls back to a web search. Both
// always resolve to a live, relevant page.
const SUBISPEED_VENDORS = new Set([1, 3, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);

function fallbackSearchUrl(product: VProduct): string {
  const q = encodeURIComponent(product.name); // product names already include the brand
  return SUBISPEED_VENDORS.has(product.vendorId)
    ? `https://www.subispeed.com/search?q=${q}&type=product`
    : `https://www.google.com/search?q=${q}`;
}

/**
 * The URL to open for a product's "View / Buy". Uses the stored productURL when
 * it's a specific product page, otherwise a live product search for the exact
 * item — so every product resolves to a working, relevant destination. Always
 * decorated with affiliate/UTM params. `medium` tags the click source.
 */
export function resolveBuyUrl(product: VProduct, medium = 'buy'): string {
  const base = isSpecificProductUrl(product.productURL)
    ? (product.productURL as string)
    : fallbackSearchUrl(product);
  return decorateUrl(base, product.vendorId, medium) as string;
}

/**
 * @deprecated Prefer {@link resolveBuyUrl}, which never returns null and never
 * dead-ends on a homepage. Kept for callers that only want a decorated raw link.
 */
export function affiliateUrl(product: VProduct, medium = 'buy'): string | null {
  return decorateUrl(product.productURL, product.vendorId, medium);
}
