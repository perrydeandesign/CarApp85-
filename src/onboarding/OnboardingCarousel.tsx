import React, { useRef, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { T, SCREEN_W } from '../constants/theme';
import { ModifiedGradientBg } from './components/gradients';
import { ModifiedPrimaryButton } from './components/ModifiedPrimaryButton';

export function OnboardingCarousel({ onComplete }: { onComplete: () => void }) {
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const pages = [
    { title: 'Share your build', sub: 'Inspire others with your journey.' },
    { title: 'Connect with the community', sub: 'Join enthusiasts worldwide.' },
    { title: 'Discover vendors', sub: 'Find trusted brands for your build.' },
    { title: 'Tell your story', sub: 'Photos, videos, mods — all in one place.' },
  ];
  const goTo = (i: number) => { setIndex(i); scrollRef.current?.scrollTo({ x: i * SCREEN_W, animated: true }); };
  return (
    <ModifiedGradientBg>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingTop: 60 }}>
          <ScrollView
            ref={scrollRef}
            horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={e => setIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_W))}
          >
            {pages.map((p, i) => (
              <View key={i} style={{ width: SCREEN_W, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
                <Text style={{ fontSize: 26, fontWeight: '800', color: 'white', textAlign: 'center', marginBottom: 12 }}>{p.title}</Text>
                <Text style={{ fontSize: 14, color: '#C9D1D9', textAlign: 'center' }}>{p.sub}</Text>
              </View>
            ))}
          </ScrollView>
          {/* Page dots */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 20 }}>
            {pages.map((_, i) => (
              <View key={i} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: i === index ? T.accent : 'rgba(255,255,255,0.2)' }} />
            ))}
          </View>
          <View style={{ paddingHorizontal: 24, paddingBottom: 20 }}>
            <ModifiedPrimaryButton
              title={index === pages.length - 1 ? 'Get Started' : 'Next'}
              onPress={() => { if (index < pages.length - 1) goTo(index + 1); else onComplete(); }}
            />
          </View>
        </View>
      </SafeAreaView>
    </ModifiedGradientBg>
  );
}
