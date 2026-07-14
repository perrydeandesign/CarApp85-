import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from '../../ui/Icon';
import { T } from '../../constants/theme';
import { SheetBase } from '../SheetBase';
import { SettingsRow } from './SettingsRow';

export type PickerOption = { label: string; value: string };

type Props = {
  icon?: string;
  label: string;
  value: string; // current option value
  options: PickerOption[];
  onSelect: (value: string) => void;
  last?: boolean;
};

/** A settings row that opens a bottom-sheet list of choices. */
export function SettingsPicker({ icon, label, value, options, onSelect, last }: Props) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);

  return (
    <>
      <SettingsRow
        icon={icon}
        label={label}
        value={current?.label ?? value}
        onPress={() => setOpen(true)}
        last={last}
      />

      <SheetBase visible={open} onClose={() => setOpen(false)}>
        <Text style={{ color: T.tx, fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 8 }}>
          {label}
        </Text>
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <TouchableOpacity
              key={o.value}
              activeOpacity={0.6}
              onPress={() => {
                onSelect(o.value);
                setOpen(false);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingVertical: 15,
              }}
            >
              <Text style={{ color: selected ? T.accent : T.tx, fontSize: 15 }}>{o.label}</Text>
              {selected ? <Icon name="checkmark" size="sm" color={T.accent} /> : null}
            </TouchableOpacity>
          );
        })}
      </SheetBase>
    </>
  );
}
