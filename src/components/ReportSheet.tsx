import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { T } from '../constants/theme';
import { Icon } from '../ui/Icon';
import { PressableScale } from '../ui/PressableScale';
import { SheetBase } from './SheetBase';
import { REPORT_REASONS, useModeration } from '../hooks/useModeration';

type Props = {
  visible: boolean;
  onClose: () => void;
  /** The post being acted on. */
  postId: string | null;
  authorId?: string;
  authorUsername?: string;
  /** Called after a successful block so the list can hide that author. */
  onBlocked?: (authorId: string) => void;
};

/**
 * Bottom-sheet "…" menu for a post: Report (with reason) or Block the author.
 * Required for App Store UGC compliance (guideline 1.2).
 */
export function ReportSheet({ visible, onClose, postId, authorId, authorUsername, onBlocked }: Props) {
  const { report, blockUser, restrictUser } = useModeration();
  const [mode, setMode] = useState<'menu' | 'reasons'>('menu');

  const close = () => {
    setMode('menu');
    onClose();
  };

  const doReport = async (reason: string) => {
    if (!postId) return;
    try {
      await report('post', postId, reason);
      close();
      Alert.alert('Thanks for reporting', 'Our team will review this within 24 hours.');
    } catch (e: any) {
      Alert.alert('Could not report', e?.message ?? 'Try again later.');
    }
  };

  const doRestrict = () => {
    if (!authorId) return;
    Alert.alert(
      `Restrict @${authorUsername ?? 'user'}?`,
      "Their comments on your posts will only be visible to them, and they won't know you restricted them.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restrict',
          onPress: async () => {
            try {
              await restrictUser(authorId);
              close();
              Alert.alert('Restricted', `@${authorUsername ?? 'user'} has been restricted.`);
            } catch (e: any) {
              Alert.alert('Could not restrict', e?.message ?? 'Try again later.');
            }
          },
        },
      ],
    );
  };

  const doBlock = () => {
    if (!authorId) return;
    Alert.alert(`Block @${authorUsername ?? 'user'}?`, "You won't see their posts anymore.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Block',
        style: 'destructive',
        onPress: async () => {
          try {
            await blockUser(authorId);
            onBlocked?.(authorId);
            close();
          } catch (e: any) {
            Alert.alert('Could not block', e?.message ?? 'Try again later.');
          }
        },
      },
    ]);
  };

  const Row = ({ icon, label, danger, onPress }: { icon: string; label: string; danger?: boolean; onPress: () => void }) => (
    <PressableScale
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16 }}
    >
      <Icon name={icon} size="sm" color={danger ? T.danger : T.tx} />
      <Text style={{ color: danger ? T.danger : T.tx, fontSize: 15, fontWeight: '600' }}>{label}</Text>
    </PressableScale>
  );

  return (
    <SheetBase visible={visible} onClose={close}>
      {mode === 'menu' ? (
        <>
          <Row icon="flag" label="Report post" onPress={() => setMode('reasons')} />
          {authorId ? <Row icon="eye-off" label={`Restrict @${authorUsername ?? 'user'}`} onPress={doRestrict} /> : null}
          {authorId ? <Row icon="ban" label={`Block @${authorUsername ?? 'user'}`} danger onPress={doBlock} /> : null}
          <Row icon="close" label="Cancel" onPress={close} />
        </>
      ) : (
        <>
          <Text style={{ color: T.mu, fontSize: 12, fontWeight: '700', letterSpacing: 0.6, paddingHorizontal: 16, paddingVertical: 8 }}>
            WHY ARE YOU REPORTING THIS?
          </Text>
          {REPORT_REASONS.map((r) => (
            <Row key={r} icon="chevron-forward" label={r} onPress={() => doReport(r)} />
          ))}
        </>
      )}
    </SheetBase>
  );
}
