import React from 'react';
import { Modal, SafeAreaView, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { T } from '../../constants/theme';
import { PrimaryButton } from '../../components/PrimaryButton';

export type OnboardingDest = 'editProfile' | 'discover';

/**
 * First-run welcome. Three guided actions so a new account isn't dropped into an
 * empty feed with nothing to do. Each card completes onboarding and deep-links
 * to the relevant existing screen; "Start exploring" just dismisses.
 */
export function WelcomeOnboarding({
  visible,
  onGoTo,
  onDone,
}: {
  visible: boolean;
  onGoTo: (dest: OnboardingDest) => void;
  onDone: () => void;
}) {
  const cards: {
    icon: string;
    fam: 'ion' | 'mci';
    title: string;
    subtitle: string;
    cta: string;
    onPress: () => void;
  }[] = [
    {
      icon: 'account-edit-outline',
      fam: 'mci',
      title: 'Complete your profile',
      subtitle: 'Add a photo and a short bio so the community knows who you are.',
      cta: 'Edit profile',
      onPress: () => onGoTo('editProfile'),
    },
    {
      icon: 'account-group-outline',
      fam: 'mci',
      title: 'Follow enthusiasts',
      subtitle: 'Find builders and shops to fill your feed with cars you love.',
      cta: 'Discover people',
      onPress: () => onGoTo('discover'),
    },
    {
      icon: 'camera-plus-outline',
      fam: 'mci',
      title: 'Share your first build',
      subtitle: 'Tap the + in the tab bar to post a photo or clip of your car.',
      cta: 'Got it',
      onPress: onDone,
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onDone}>
      <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
          <View style={{ alignItems: 'center', marginTop: 12, marginBottom: 28 }}>
            <View
              style={{
                width: 68,
                height: 68,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: T.accentDim,
                marginBottom: 16,
              }}
            >
              <MaterialCommunityIcons name="car-sports" size={38} color={T.accent} />
            </View>
            <Text style={{ color: T.wh, fontSize: 24, fontWeight: '800', textAlign: 'center' }}>
              Welcome to MODIFIED
            </Text>
            <Text style={{ color: T.mu, fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
              Three quick things to get your build in front of the community.
            </Text>
          </View>

          {cards.map((c) => (
            <TouchableOpacity
              key={c.title}
              activeOpacity={0.85}
              onPress={c.onPress}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                backgroundColor: T.card,
                borderWidth: 1,
                borderColor: T.bd,
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: T.accentDim,
                }}
              >
                {c.fam === 'mci' ? (
                  <MaterialCommunityIcons name={c.icon} size={24} color={T.accent} />
                ) : (
                  <Ionicons name={c.icon} size={24} color={T.accent} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: T.tx, fontSize: 15, fontWeight: '700' }}>{c.title}</Text>
                <Text style={{ color: T.mu, fontSize: 12.5, marginTop: 2, lineHeight: 17 }}>{c.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={T.mu} />
            </TouchableOpacity>
          ))}

          <PrimaryButton label="Start exploring" onPress={onDone} style={{ marginTop: 16 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
