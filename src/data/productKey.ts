import type { VProduct } from '../constants/types';

/** Stable identity for a catalog product (bridges the mock catalog and a future
 *  products table). vendorId + slug of the name. */
export function productKey(p: VProduct): string {
  return `${p.vendorId}-${p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`;
}

/** A product is "on sale" if it has a struck-through was price or a sale badge. */
export function isOnSale(p: VProduct): boolean {
  return p.was != null || p.badge === 'sale';
}
