import React from 'react';
import { ActivityIndicator, Text, TextStyle, View, ViewStyle } from 'react-native';
import { PressableScale } from './PressableScale';
import { Icon } from './Icon';
import { haptic } from '../lib/haptics';
import { T } from '../constants/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  /** Optional leading Ionicons (or Feather, auto-mapped) icon name. */
  icon?: string;
  /**
   * Override the fill color while keeping every other pill dimension
   * (height, padding, radius, weight) identical. Use for colored action pills
   * — e.g. amber Contact, blue Website — so they stay visually consistent.
   */
  tint?: string;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
};

const SIZES: Record<Size, { h: number; px: number; font: number; icon: number; radius: number }> = {
  sm: { h: 32, px: 14, font: 12.5, icon: 14, radius: 16 },
  md: { h: 42, px: 18, font: 14, icon: 16, radius: 21 },
  lg: { h: 52, px: 22, font: 15.5, icon: 18, radius: 26 },
};

function palette(variant: Variant): { bg: string; fg: string; border?: string } {
  switch (variant) {
    case 'primary':   return { bg: T.accent, fg: '#04110E' };
    case 'secondary': return { bg: T.card2, fg: T.tx };
    case 'ghost':     return { bg: 'transparent', fg: T.accent, border: T.accent };
    case 'danger':    return { bg: 'transparent', fg: T.danger, border: T.danger };
  }
}

/**
 * The single CTA primitive — consistent height, radius, weight, teal palette,
 * press-scale + haptic across the whole app. Replace bespoke TouchableOpacity
 * buttons with this so every call-to-action gets the same treatment.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  tint,
  loading,
  disabled,
  fullWidth,
  style,
}: Props) {
  const s = SIZES[size];
  const base = palette(variant);
  // A `tint` fills solid variants with the given color (dark fg for contrast)
  // and recolors outline variants' border/label — geometry is untouched.
  const p = tint
    ? base.border
      ? { bg: 'transparent', fg: tint, border: tint }
      : { bg: tint, fg: '#04110E' }
    : base;
  const isDisabled = disabled || loading;

  return (
    <PressableScale
      onPress={() => {
        if (isDisabled) return;
        haptic('selection');
        onPress();
      }}
      style={{
        height: s.h,
        paddingHorizontal: s.px,
        borderRadius: s.radius,
        backgroundColor: p.bg,
        borderWidth: p.border ? 1.5 : 0,
        borderColor: p.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        opacity: isDisabled ? 0.5 : 1,
        alignSelf: fullWidth ? 'stretch' : 'flex-start',
        ...(style as object),
      }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={p.fg} />
      ) : (
        <>
          {icon ? <Icon name={icon} size={s.icon} color={p.fg} /> : null}
          <Text style={{ color: p.fg, fontWeight: '800', fontSize: s.font } as TextStyle}>
            {label}
          </Text>
        </>
      )}
    </PressableScale>
  );
}
