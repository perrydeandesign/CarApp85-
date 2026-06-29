import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { T } from '../constants/theme';

/**
 * Single icon primitive for the whole app. Defaults to Ionicons so stroke
 * weight is consistent everywhere (the app previously mixed Feather's thin
 * line with Ionicons' heavier outline). MaterialCommunityIcons is only for the
 * car-mod glyphs that Ionicons lacks (engine, tyre, seat…).
 *
 * Use the named size tokens (`size="md"`) so sizing stays on one scale.
 */

// Canonical size scale — every icon should snap to one of these.
export const ICON_SIZE = {
  xs: 14, // inline meta / tiny chips
  sm: 18, // secondary actions, list rows
  md: 22, // primary actions, headers
  lg: 26, // tab bar, prominent
  xl: 32, // hero / empty states
} as const;

export type IconSize = keyof typeof ICON_SIZE | number;

// Feather names still scattered in the codebase → Ionicons equivalents, so a
// blanket family switch keeps the same glyph meaning.
const FEATHER_TO_ION: Record<string, string> = {
  heart: 'heart',
  'message-circle': 'chatbubble-outline',
  'message-square': 'chatbubble-outline',
  send: 'paper-plane-outline',
  bookmark: 'bookmark-outline',
  camera: 'camera-outline',
  award: 'trophy-outline',
  x: 'close',
  'chevron-up': 'chevron-up',
  'chevron-down': 'chevron-down',
  'chevron-right': 'chevron-forward',
  'chevron-left': 'chevron-back',
  share: 'share-outline',
  'share-2': 'share-social-outline',
  'more-horizontal': 'ellipsis-horizontal',
  search: 'search',
  user: 'person-outline',
  users: 'people-outline',
  settings: 'settings-outline',
  bell: 'notifications-outline',
  plus: 'add',
  check: 'checkmark',
  trash: 'trash-outline',
  edit: 'create-outline',
  image: 'image-outline',
};

type Props = {
  name: string;
  size?: IconSize;
  color?: string;
  /** Use 'mci' for car-mod glyphs Ionicons doesn't have. */
  family?: 'ion' | 'mci';
  style?: any;
};

export function Icon({ name, size = 'md', color = T.tx, family = 'ion', style }: Props) {
  const px = typeof size === 'number' ? size : ICON_SIZE[size];
  if (family === 'mci') {
    return <MaterialCommunityIcons name={name as any} size={px} color={color} style={style} />;
  }
  const ionName = FEATHER_TO_ION[name] ?? name;
  return <Ionicons name={ionName as any} size={px} color={color} style={style} />;
}
