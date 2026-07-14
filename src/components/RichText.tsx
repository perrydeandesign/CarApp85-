import React from 'react';
import { Text, type TextStyle } from 'react-native';
import { T } from '../constants/theme';

type Props = {
  text: string;
  style?: TextStyle;
};

/** Plain text wrapper from the legacy App.tsx — the IG-style RichCaption
 *  for hashtags/mentions lives at src/social/components/RichCaption.tsx. */
export function RichText({ text, style }: Props) {
  return <Text style={[{ color: T.wh }, style]}>{text}</Text>;
}
