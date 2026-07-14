import { Dimensions } from 'react-native';

export const { width: SCREEN_W } = Dimensions.get('window');

export const T = {
  bg: '#0D1117', card: '#161B22', card2: '#21262D', bd: '#30363D',
  // `mu` lifted from #8B949E for accessibility — muted text now clears WCAG AA
  // on the dark backgrounds while staying a touch below pure white for hierarchy.
  mu: '#C9D1D9', tx: '#F0F6FC', tx2: '#C9D1D9', wh: '#FFFFFF',
  accent: '#00C9A7', accentDim: 'rgba(0,201,167,0.12)',
  // Text/icons placed ON the bright teal accent — dark for WCAG contrast
  // (white-on-teal fails). Use for primary-CTA labels.
  onAccent: '#04110E',
  danger: '#F87171', me: '#00C9A7', them: '#161B2E',
  ac: '#00C9A7', cd: '#161B22', cd2: '#21262D',
};

export const IC = {
  nav: 24, tab: 26, back: 22, action: 24, actionSm: 20,
  inline: 16, status: 10, badge: 14, drawer: 22, hero: 28,
};

// Spacing scale — use these instead of arbitrary numbers so padding/gaps are
// consistent across screens. xs=4 sm=8 md=12 lg=16 xl=20 xxl=24.
export const SP = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24,
} as const;

// Canonical radii. sm=8 md=12 lg=16 xl=18(sheets) pill=999.
export const RADIUS = {
  sm: 8, md: 12, lg: 16, xl: 18, pill: 999,
} as const;

// Typography scale — snap text to these so titles/body/meta stay consistent.
// display=page hero, h1=screen title, h2=modal/section, title=row/card title,
// body=primary, label=secondary action, caption=muted meta, small=badges.
export const TYPO = {
  display: { fontSize: 28, fontWeight: '800' as const },
  h1: { fontSize: 22, fontWeight: '800' as const },
  h2: { fontSize: 17, fontWeight: '700' as const },
  title: { fontSize: 15, fontWeight: '700' as const },
  body: { fontSize: 15, fontWeight: '500' as const },
  label: { fontSize: 14, fontWeight: '600' as const },
  caption: { fontSize: 12, fontWeight: '600' as const },
  small: { fontSize: 11, fontWeight: '600' as const },
} as const;

// Canonical avatar sizes so every screen renders avatars at a consistent scale.
// xs=comment/row, sm=list, md=story author, lg=story hero, hero=profile header.
export const AVATAR = {
  xs: 32, sm: 40, md: 58, lg: 72, hero: 112,
} as const;

// Standard screen gutter (horizontal page padding).
export const GUTTER = 16;

export const CAT: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  notification: { bg: '#0D2B27', border: '#00C9A7', text: '#4FD1B8', dot: '#00C9A7' },
  track: { bg: '#0D1B30', border: '#4D8EE8', text: '#7EB3F5', dot: '#4D8EE8' },
  modification: { bg: '#2B2000', border: '#E5A300', text: '#FBBF24', dot: '#E5A300' },
  event: { bg: '#1E0A2E', border: '#A855F7', text: '#C084FC', dot: '#A855F7' },
};

export const TL_LABELS: Record<string, string> = { notification: 'Notification', track: 'Track Day', modification: 'Modification', event: 'Event' };
export const ML: Record<string, string> = { engine: 'Engine', wheels: 'Wheels', interior: 'Interior', exterior: 'Exterior' };
export const MOD_ICONS: Record<string, { name: string; family: 'ionicon' | 'mci' }> = { engine: { name: 'engine-outline', family: 'mci' }, wheels: { name: 'tire', family: 'mci' }, interior: { name: 'car-seat', family: 'mci' }, exterior: { name: 'car-side', family: 'mci' } };
export const TL_ICONS: Record<string, string> = { modification: 'build-outline', track: 'flag-outline', notification: 'notifications-outline', event: 'calendar-outline' };

export const VENDOR_CATEGORIES = ['Engine', 'Wheels & Suspension', 'Interior', 'Exterior'];
export const CAT_TITLE: Record<string, string> = { Engine: 'Power & Engine', 'Wheels & Suspension': 'Wheels & Handling', Interior: 'Cabin & Interior', Exterior: 'Body & Aero' };
export const CAT_SUBTITLE: Record<string, string> = { Engine: 'ECU tuning, intakes, exhausts & intercoolers', 'Wheels & Suspension': 'Forged wheels, coilovers & sway bars', Interior: 'Bucket seats, gauges & steering wheels', Exterior: 'Widebody kits, splitters & carbon fibre' };
export const CAT_BG: Record<string, string> = { Engine: '#1A1410', 'Wheels & Suspension': '#10161A', Interior: '#1A1018', Exterior: '#101A14' };
export const CAT_ACCENT: Record<string, string> = { Engine: '#FF6B35', 'Wheels & Suspension': '#60A5FA', Interior: '#A78BFA', Exterior: '#34D399' };

export const EMOJI_OPTIONS = ['\uD83D\uDD25', '\uD83D\uDE4C', '\uD83D\uDE02', '\u2764\uFE0F', '\uD83D\uDE2E', '\uD83D\uDC40'];

export const GRAD_TOP = 'rgb(10,15,18)';
export const GRAD_MID = 'rgb(13,18,23)';
export const GRAD_TEAL = 'rgba(13,51,56,0.35)';
export const MODIFIED_TAGLINE = 'Where the car community connects.';
