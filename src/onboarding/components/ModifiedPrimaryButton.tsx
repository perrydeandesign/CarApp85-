import React from 'react';
import { Button } from '../../ui/Button';

/** Auth/onboarding primary CTA — delegates to the shared Button so it shares
 *  the app-wide treatment (teal palette, height, radius, press-scale, haptic). */
export function ModifiedPrimaryButton({ title, onPress }: { title: string; onPress: () => void }) {
  return <Button label={title} onPress={onPress} variant="primary" size="lg" fullWidth />;
}
