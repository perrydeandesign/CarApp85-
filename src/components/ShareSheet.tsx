import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SheetBase } from './SheetBase';
import { T, TYPO } from '../constants/theme';
import { haptic } from '../lib/haptics';
import { shareTo, ShareContent, ShareTarget } from '../lib/share';

type Row = {
  target: ShareTarget;
  label: string;
  icon: string;
  fam: 'ion' | 'mci';
  color: string;
};

// Order matches the product spec (TikTok intentionally omitted — no public
// link/text share API).
const ROWS: Row[] = [
  { target: 'email', label: 'Email', icon: 'mail-outline', fam: 'ion', color: T.accent },
  { target: 'messenger', label: 'Messenger', icon: 'facebook-messenger', fam: 'mci', color: '#0084FF' },
  { target: 'text', label: 'Text', icon: 'chatbubble-outline', fam: 'ion', color: '#34C759' },
  { target: 'whatsapp', label: 'WhatsApp', icon: 'whatsapp', fam: 'mci', color: '#25D366' },
  { target: 'x', label: 'X', icon: 'logo-twitter', fam: 'ion', color: T.wh },
  { target: 'threads', label: 'Threads', icon: 'at', fam: 'mci', color: T.wh },
  { target: 'download', label: 'Download', icon: 'download-outline', fam: 'ion', color: T.accent },
  { target: 'copy', label: 'Copy Link', icon: 'link-outline', fam: 'ion', color: T.accent },
];

function Glyph({ row }: { row: Row }) {
  // Modern X mark — Ionicons only ships the old Twitter bird (logo-twitter).
  if (row.target === 'x') return <Text style={{ fontSize: 22, fontWeight: '900', color: row.color }}>𝕏</Text>;
  if (row.fam === 'mci') return <MaterialCommunityIcons name={row.icon} size={24} color={row.color} />;
  return <Ionicons name={row.icon} size={24} color={row.color} />;
}

type Props = {
  visible: boolean;
  onClose: () => void;
  content: ShareContent;
};

/**
 * Comprehensive branded share sheet. Each row deep-links to its app with a
 * graceful fallback (see lib/share). Copy Link confirms inline before closing.
 */
export function ShareSheet({ visible, onClose, content }: Props) {
  const [copied, setCopied] = useState(false);

  const handle = async (t: ShareTarget) => {
    if (t === 'copy') {
      await shareTo('copy', content);
      haptic('success');
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 900);
      return;
    }
    await shareTo(t, content);
    onClose();
  };

  return (
    <SheetBase visible={visible} onClose={onClose}>
      <View style={{ paddingHorizontal: 16, paddingTop: 6 }}>
        <Text style={{ color: T.tx, ...TYPO.h2, marginBottom: 16 }}>Share</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 18 }}>
          {ROWS.map((r) => (
            <TouchableOpacity
              key={r.target}
              activeOpacity={0.75}
              onPress={() => handle(r.target)}
              style={{ width: '25%', alignItems: 'center' }}
            >
              <View
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 27,
                  backgroundColor: T.card2,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 6,
                }}
              >
                <Glyph row={r} />
              </View>
              <Text style={{ color: T.mu, fontSize: 11 }} numberOfLines={1}>
                {r.target === 'copy' && copied ? 'Copied!' : r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SheetBase>
  );
}
