import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { T } from '../constants/theme';
import type { ModsMap } from '../constants/types';

type Props = {
  k: keyof ModsMap | string;
  size?: number;
  color?: string;
};

const ICON_MAP: Record<string, string> = {
  engine: 'cog',
  wheels: 'disc',
  interior: 'car-sport',
  exterior: 'color-palette',
};

export function ModIcon({ k, size = 18, color = T.wh }: Props) {
  return <Ionicons name={(ICON_MAP[k as string] as any) ?? 'build'} size={size} color={color} />;
}
