import React from 'react';
import { Modal, SafeAreaView, ScrollView, View, Text, Image, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { T } from '../constants/theme';
import { TIER_COLOR, type Achievement } from '../data/achievements';

type Props = {
  visible: boolean;
  onClose: () => void;
  username: string;
  achievements: Achievement[];
};

/** Full-screen list of a profile's competition achievements. */
export function AchievementsModal({ visible, onClose, username, achievements }: Props) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: T.bd }}>
          <View>
            <Text style={{ color: T.wh, fontSize: 18, fontWeight: '800' }}>Trophy Cabinet</Text>
            <Text style={{ color: T.mu, fontSize: 12, marginTop: 2 }}>@{username}</Text>
          </View>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="close" size={24} color={T.wh} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {achievements.length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 60, gap: 10 }}>
              <Ionicons name="trophy-outline" size={40} color={T.mu} />
              <Text style={{ color: T.mu, fontSize: 14 }}>No trophies yet — enter a challenge!</Text>
            </View>
          ) : (
            achievements.map(a => {
              const color = TIER_COLOR[a.tier];
              return (
                <View key={a.id} style={{ backgroundColor: T.card, borderRadius: 16, borderWidth: 1, borderColor: a.tier === 'gold' ? '#E5A300' : T.bd, overflow: 'hidden', marginBottom: 14 }}>
                  {a.image ? (
                    <Image source={{ uri: a.image }} style={{ width: '100%', height: 150 }} resizeMode="cover" />
                  ) : null}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
                    {/* Medal */}
                    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="trophy" size={22} color={a.tier === 'teal' ? '#04110E' : '#3A2A00'} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: T.wh, fontSize: 16, fontWeight: '800' }}>{a.competition}</Text>
                      <Text style={{ color, fontSize: 13, fontWeight: '700', marginTop: 2 }}>{a.placement}</Text>
                      <Text style={{ color: T.mu, fontSize: 12, marginTop: 3 }}>{a.date}{a.subtitle ? ` · ${a.subtitle}` : ''}</Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
