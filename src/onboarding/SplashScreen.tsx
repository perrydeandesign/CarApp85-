import React, { useEffect, useRef } from 'react';
import { Text, Animated } from 'react-native';
import { ModifiedGradientBg, MODIFIED_TAGLINE } from './components/gradients';
import { ModifiedLogo } from './components/ModifiedLogo';

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, []);
  return (
    <ModifiedGradientBg>
      <Animated.View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', opacity: fadeAnim }}>
        <ModifiedLogo />
        <Text style={{ fontSize: 14, color: '#C9D1D9', marginTop: 12 }}>{MODIFIED_TAGLINE}</Text>
      </Animated.View>
    </ModifiedGradientBg>
  );
}
