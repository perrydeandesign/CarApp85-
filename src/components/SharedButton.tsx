import React, { useEffect } from 'react';
import { View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { PressableScale } from '../ui/PressableScale';
import { haptic } from '../lib/haptics';
import { T, IC } from '../constants/theme';

const TAB_ITEMS: { key: string; icon: string; label: string }[] = [
  { key: 'home', icon: 'home-outline', label: 'Home' },
  { key: 'search', icon: 'search-outline', label: 'Search' },
  { key: 'camera', icon: 'add', label: 'Create' },
  { key: 'groups', icon: 'people-outline', label: 'Groups' },
  { key: 'vendor', icon: 'storefront-outline', label: 'Vendors' },
  { key: 'profile', icon: 'person-outline', label: 'Profile' },
];

function TabIcon({
  item,
  active,
  onPress,
}: {
  item: { key: string; icon: string };
  active: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  // Pop the icon whenever it becomes active.
  useEffect(() => {
    if (active) {
      scale.value = withSequence(
        withSpring(1.18, { damping: 6, stiffness: 240 }),
        withSpring(1, { damping: 9, stiffness: 200 }),
      );
    }
  }, [active, scale]);

  // Center "create" action — an emphasized + in a filled teal square. It opens
  // the create hub (post / build / competition / event), so it reads as the
  // primary CTA rather than a literal camera.
  if (item.key === 'camera') {
    return (
      <PressableScale onPress={onPress} style={{ flex: 1, alignItems: 'center' }} activeScale={0.9}>
        <View
          style={{
            width: 48,
            height: 38,
            borderRadius: 13,
            backgroundColor: T.accent,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ translateY: -6 }],
            shadowColor: T.accent,
            shadowOpacity: 0.4,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <Ionicons name="add" size={26} color={T.onAccent} />
        </View>
      </PressableScale>
    );
  }

  return (
    <PressableScale onPress={onPress} style={{ flex: 1, alignItems: 'center' }} activeScale={0.9}>
      <Animated.View style={style}>
        <Ionicons
          name={active ? (item.icon.replace('-outline', '') as any) : item.icon}
          size={IC.tab}
          color={active ? T.accent : T.wh}
        />
      </Animated.View>
    </PressableScale>
  );
}

export function BottomTabBar({ active, onTab }: { active: string; onTab: (k: string) => void }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: T.bd,
        backgroundColor: T.bg,
        paddingBottom: 20,
        paddingTop: 10,
      }}
    >
      {TAB_ITEMS.map((t) => (
        <TabIcon
          key={t.key}
          item={t}
          active={active === t.key}
          onPress={() => {
            haptic('selection');
            onTab(t.key);
          }}
        />
      ))}
    </View>
  );
}
