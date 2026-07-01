import type { BadgeType } from '../constants/types';

/** Visual metadata for the verification badge system. */
export const BADGE_META: Record<BadgeType, { icon: string; color: string; label: string }> = {
  verified: { icon: 'checkmark-circle', color: '#3B82F6', label: 'Verified Builder' },
  mechanic: { icon: 'construct', color: '#F59E0B', label: 'Certified Mechanic' },
  vendor: { icon: 'storefront', color: '#A855F7', label: 'Official Vendor' },
  og: { icon: 'shield-checkmark', color: '#00C9A7', label: 'OG Member' },
};

/** Demo assignments — keyed by username string. */
export const USER_BADGES: Record<string, BadgeType[]> = {
  SkylineKing: ['verified', 'og'],
  TurboMike: ['verified'],
  DriftKing_AU: ['verified', 'mechanic'],
  EvoFanatic: ['og'],
  amy_detailz: ['verified'],
  sarah_speed: ['verified', 'mechanic'],
  v8_vince: ['vendor'],
  gt_gary: ['verified', 'og'],
  Jake_STI: ['verified'],
};
