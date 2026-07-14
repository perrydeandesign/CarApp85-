import React from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '../ui/Icon';
import { T } from '../constants/theme';
import type { CarRow } from '../hooks/useProfileData';

type Props = {
  visible: boolean;
  cars: CarRow[];
  selectedId: string | null;
  onClose: () => void;
  onSelect: (carId: string) => void;
};

// Text-only popup near the profile header. Tap a car name → switch active car.
export function CarSwitcherSheet({ visible, cars, selectedId, onClose, onSelect }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.55)',
          justifyContent: 'center',
          paddingHorizontal: 32,
        }}
      >
        <Pressable
          onPress={() => {}}
          style={{
            backgroundColor: T.card,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: T.bd,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: T.bd,
            }}
          >
            <Text style={{ flex: 1, fontSize: 14, fontWeight: '700', color: T.tx }}>
              My Garage
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Icon name="x" size={18} color={T.tx2} />
            </TouchableOpacity>
          </View>

          {cars.length === 0 ? (
            <Text style={{ paddingHorizontal: 16, paddingVertical: 18, color: T.mu, fontSize: 13 }}>
              No cars yet.
            </Text>
          ) : (
            cars.map((car) => {
              const active = car.id === selectedId;
              const label =
                (car.year ? `${car.year} ` : '') + `${car.make} ${car.model}`.trim();
              return (
                <TouchableOpacity
                  key={car.id}
                  onPress={() => { onSelect(car.id); onClose(); }}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: active ? 'rgba(0,201,167,0.10)' : 'transparent',
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: active ? '700' : '500',
                        color: active ? T.accent : T.tx,
                      }}
                    >
                      {label}
                    </Text>
                    {car.build_type ? (
                      <Text style={{ fontSize: 10, color: T.mu, marginTop: 2, fontWeight: '600' }}>
                        {car.build_type.toUpperCase()}
                      </Text>
                    ) : null}
                  </View>
                  {active && <Icon name="check" size={16} color={T.accent} />}
                </TouchableOpacity>
              );
            })
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
