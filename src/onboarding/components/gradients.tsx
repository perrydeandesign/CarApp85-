import React from 'react';
import { View } from 'react-native';
import { GRAD_TOP, GRAD_MID, GRAD_TEAL } from '../../constants/theme';

export { GRAD_TOP, GRAD_MID, GRAD_TEAL, MODIFIED_TAGLINE } from '../../constants/theme';

export function ModifiedGradientBg({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flex: 1, backgroundColor: GRAD_TOP }}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <View style={{ flex: 1, backgroundColor: GRAD_MID }} />
        <View style={{ flex: 1, backgroundColor: GRAD_TEAL }} />
      </View>
      {children}
    </View>
  );
}
