import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';

type RichCaptionProps = {
  text: string;
  style?: TextStyle;
  linkStyle?: TextStyle;
  onMentionPress?: (username: string) => void;
  onHashtagPress?: (tag: string) => void;
  numberOfLines?: number;
};

const TOKEN_RE = /(@[\w._]+|#[\w]+)/g;

export const RichCaption: React.FC<RichCaptionProps> = ({
  text,
  style,
  linkStyle,
  onMentionPress,
  onHashtagPress,
  numberOfLines,
}) => {
  const parts = text.split(TOKEN_RE);

  return (
    <Text style={[styles.base, style]} numberOfLines={numberOfLines}>
      {parts.map((part, i) => {
        if (!part) return null;
        if (part.startsWith('@')) {
          const username = part.slice(1);
          return (
            <Text
              key={i}
              style={[styles.link, linkStyle]}
              onPress={onMentionPress ? () => onMentionPress(username) : undefined}
              suppressHighlighting
            >
              {part}
            </Text>
          );
        }
        if (part.startsWith('#')) {
          const tag = part.slice(1);
          return (
            <Text
              key={i}
              style={[styles.link, linkStyle]}
              onPress={onHashtagPress ? () => onHashtagPress(tag) : undefined}
              suppressHighlighting
            >
              {part}
            </Text>
          );
        }
        return <Text key={i}>{part}</Text>;
      })}
    </Text>
  );
};

export function extractHashtags(text: string): string[] {
  const out: string[] = [];
  const re = /#([\w]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) out.push(m[1]);
  return out;
}

export function extractMentions(text: string): string[] {
  const out: string[] = [];
  const re = /@([\w._]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) out.push(m[1]);
  return out;
}

const styles = StyleSheet.create({
  base: { color: '#FFFFFF', fontSize: 13 },
  link: { color: '#7DB6FF', fontWeight: '500' },
});
