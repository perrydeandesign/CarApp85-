import React from 'react';
import { View, Text, Alert } from 'react-native';
import { Icon } from '../ui/Icon';
import { PressableScale } from '../ui/PressableScale';
import { SheetBase } from './SheetBase';
import { T } from '../constants/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Go to the camera/create-post flow. */
  onCreatePost: () => void;
  /** Open the create-event flow. */
  onCreateEvent?: () => void;
};

type Option = {
  icon: string;
  label: string;
  subtitle: string;
  onPress: (p: Props) => void;
  soon?: boolean;
};

const OPTIONS: Option[] = [
  {
    icon: 'camera',
    label: 'New post',
    subtitle: 'Share a photo of your car',
    onPress: (p) => {
      p.onClose();
      p.onCreatePost();
    },
  },
  {
    icon: 'construct',
    label: 'Build update',
    subtitle: 'Log a mod or progress shot',
    onPress: (p) => {
      p.onClose();
      p.onCreatePost();
    },
  },
  {
    icon: 'trophy',
    label: 'Competition entry',
    subtitle: 'Enter an active challenge',
    soon: true,
    onPress: () => Alert.alert('Competition entry', 'Coming soon.'),
  },
  {
    icon: 'calendar',
    label: 'Event',
    subtitle: 'Host a meet or car event',
    onPress: (p) => {
      p.onClose();
      p.onCreateEvent?.();
    },
  },
];

/** IG-style "+" create hub — one entry point for all the things a user can make. */
export function AddSheet(props: Props) {
  const { visible, onClose } = props;
  return (
    <SheetBase visible={visible} onClose={onClose}>
      <Text style={{ color: T.tx, fontSize: 17, fontWeight: '800', paddingHorizontal: 16, marginBottom: 6 }}>
        Create
      </Text>

      {OPTIONS.map((o) => (
            <PressableScale
              key={o.label}
              onPress={() => o.onPress(props)}
              style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: T.accentDim,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 14,
                }}
              >
                <Icon name={o.icon} size="md" color={T.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: T.tx, fontSize: 15, fontWeight: '600' }}>
                  {o.label}
                  {o.soon ? <Text style={{ color: T.mu, fontWeight: '400' }}>  · soon</Text> : null}
                </Text>
                <Text style={{ color: T.mu, fontSize: 12, marginTop: 2 }}>{o.subtitle}</Text>
              </View>
          <Icon name="chevron-forward" size="sm" color={T.mu} />
        </PressableScale>
      ))}
    </SheetBase>
  );
}
