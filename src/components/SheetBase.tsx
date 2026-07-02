import React from 'react';
import { Modal, Pressable, View } from 'react-native';
import { T, RADIUS } from '../constants/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

/**
 * Canonical bottom sheet: one backdrop (rgba 0,0,0,0.55), one radius (xl=18),
 * one grab handle. Tapping the backdrop closes; taps inside don't. Wrap sheet
 * content in this so AddSheet / ReportSheet / SettingsPicker / SaveToSheet all
 * look and behave identically.
 */
export function SheetBase({ visible, onClose, children }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }}
        onPress={onClose}
      >
        <Pressable
          onPress={() => {}}
          style={{
            backgroundColor: T.card,
            borderTopLeftRadius: RADIUS.xl,
            borderTopRightRadius: RADIUS.xl,
            paddingTop: 10,
            paddingBottom: 28,
          }}
        >
          <View
            style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: T.bd, alignSelf: 'center', marginBottom: 8 }}
          />
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
