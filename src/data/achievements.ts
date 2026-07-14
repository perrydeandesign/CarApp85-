// Competition achievements shown on a profile (trophy ring + achievements modal).
// Demo-first: the signed-out "me" profile gets a sample set so the feature is
// visible. Swap getAchievements() for a Supabase query (competition winners)
// when the backend records placements.

export type AchievementTier = 'gold' | 'silver' | 'teal';

export type Achievement = {
  id: string;
  competition: string;      // e.g. "Rolling Shots"
  placement: string;        // e.g. "1st place · Winner"
  tier: AchievementTier;    // gold = win, silver = finalist, teal = entrant
  date: string;             // e.g. "Jun 2026"
  subtitle?: string;        // e.g. "Photo Challenge"
  image?: string;           // the winning shot
};

export const TIER_COLOR: Record<AchievementTier, string> = {
  gold: '#FBBF24',
  silver: '#C9D1D9',
  teal: '#00C9A7',
};

const ME_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-rolling',
    competition: 'Rolling Shots',
    placement: '1st place · Winner',
    tier: 'gold',
    date: 'Jun 2026',
    subtitle: 'Photo Challenge',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop',
  },
  {
    id: 'ach-jdm',
    competition: 'JDM Only',
    placement: 'Finalist · Top 3',
    tier: 'silver',
    date: 'May 2026',
    subtitle: 'Photo Challenge',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop',
  },
  {
    id: 'ach-cc',
    competition: 'Cars & Coffee',
    placement: 'Entrant',
    tier: 'teal',
    date: 'Apr 2026',
    subtitle: 'Community Meet',
    image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop',
  },
];

/** Achievements for a profile. Demo shows the sample set for the "me" profile. */
export function getAchievements(isMe: boolean): Achievement[] {
  return isMe ? ME_ACHIEVEMENTS : [];
}

/** Highest tier held (drives the avatar ring colour). Null if none. */
export function topTier(list: Achievement[]): AchievementTier | null {
  if (list.some(a => a.tier === 'gold')) return 'gold';
  if (list.some(a => a.tier === 'silver')) return 'silver';
  if (list.length > 0) return 'teal';
  return null;
}

/** Count of outright wins (gold) — shown in the pill. */
export function winCount(list: Achievement[]): number {
  return list.filter(a => a.tier === 'gold').length;
}
