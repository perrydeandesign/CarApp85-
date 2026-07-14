import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { SubPage } from '../SubPage';
import { T } from '../../constants/theme';
import { useFontScale } from '../../context/AppPrefsContext';

type Props = {
  title: string;
  lastUpdated: string;
  body: string; // lightweight markdown: "# " / "## " headings, "- " bullets, blank-line paragraphs
  onBack: () => void;
};

/** Renders a legal/policy document (Terms, Privacy, Community Guidelines). */
export function PolicyScreen({ title, lastUpdated, body, onBack }: Props) {
  const lines = body.trim().split('\n');
  const fs = useFontScale();

  return (
    <SubPage title={title} onBack={onBack}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 48 }}>
        <Text style={{ color: T.mu, fontSize: 12, marginBottom: 18 }}>
          Last updated {lastUpdated}
        </Text>

        {lines.map((raw, i) => {
          const line = raw.trimEnd();
          if (line === '') return <View key={i} style={{ height: 10 }} />;
          if (line.startsWith('## ')) {
            return (
              <Text
                key={i}
                style={{ color: T.tx, fontSize: 16 * fs, fontWeight: '700', marginTop: 14, marginBottom: 4 }}
              >
                {line.slice(3)}
              </Text>
            );
          }
          if (line.startsWith('# ')) {
            return (
              <Text
                key={i}
                style={{ color: T.tx, fontSize: 19 * fs, fontWeight: '800', marginTop: 8, marginBottom: 6 }}
              >
                {line.slice(2)}
              </Text>
            );
          }
          if (line.startsWith('- ')) {
            return (
              <View key={i} style={{ flexDirection: 'row', marginBottom: 5, paddingLeft: 4 }}>
                <Text style={{ color: T.mu, fontSize: 14 * fs, marginRight: 8 }}>•</Text>
                <Text style={{ color: T.tx2, fontSize: 14 * fs, lineHeight: 21 * fs, flex: 1 }}>{line.slice(2)}</Text>
              </View>
            );
          }
          return (
            <Text key={i} style={{ color: T.tx2, fontSize: 14 * fs, lineHeight: 21 * fs, marginBottom: 6 }}>
              {line}
            </Text>
          );
        })}
      </ScrollView>
    </SubPage>
  );
}
