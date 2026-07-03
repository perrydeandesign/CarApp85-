import React, { useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  LayoutChangeEvent,
  ImageStyle,
  GestureResponderEvent,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { PhotoTag } from '../data/posts';
import { FadeInImage } from '../../ui/FadeInImage';

type Props = {
  uri: string;
  tags: PhotoTag[];
  imageStyle?: ImageStyle;
  /** Compose mode: tap places, tap pin removes. Display mode: tap toggles overlay. */
  mode?: 'display' | 'compose';
  onPlaceTag?: (point: { x: number; y: number }) => void;
  onRemoveTag?: (username: string) => void;
  onTagPress?: (username: string) => void;
  /** When provided in compose mode and >0, prompts to "Tap photo to tag" until first tag is added. */
  emptyHint?: string;
};

export const TaggablePhoto: React.FC<Props> = ({
  uri,
  tags,
  imageStyle,
  mode = 'display',
  onPlaceTag,
  onRemoveTag,
  onTagPress,
  emptyHint,
}) => {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  // In display mode the pin labels start hidden and toggle on tap.
  const [labelsVisible, setLabelsVisible] = useState(false);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ w: width, h: height });
  };

  const handlePress = (e: GestureResponderEvent) => {
    if (mode === 'compose' && onPlaceTag && size) {
      const { locationX, locationY } = e.nativeEvent;
      const x = Math.min(Math.max(locationX / size.w, 0), 1);
      const y = Math.min(Math.max(locationY / size.h, 0), 1);
      onPlaceTag({ x, y });
    } else if (mode === 'display' && tags.length > 0) {
      setLabelsVisible((v) => !v);
    }
  };

  const showLabels = mode === 'compose' || labelsVisible;

  return (
    <TouchableOpacity activeOpacity={1} onPress={handlePress} onLayout={onLayout}>
      <FadeInImage source={{ uri }} containerStyle={[styles.image, imageStyle] as any} />

      {mode === 'compose' && tags.length === 0 && emptyHint ? (
        <View style={styles.hintWrap} pointerEvents="none">
          <View style={styles.hintBubble}>
            <Ionicons name="pricetag" size={14} color="#fff" />
            <Text style={styles.hintText}>{emptyHint}</Text>
          </View>
        </View>
      ) : null}

      {mode === 'display' && tags.length > 0 && !labelsVisible ? (
        <View style={styles.tagBadge} pointerEvents="none">
          <Ionicons name="pricetag" size={12} color="#fff" />
          <Text style={styles.tagBadgeText}>{tags.length}</Text>
        </View>
      ) : null}

      {size && showLabels
        ? tags.map((t) => {
            const left = t.x * size.w;
            const top = t.y * size.h;
            return (
              <View key={`${t.username}-${t.x}-${t.y}`} style={[styles.pinWrap, { left, top }]}>
                <View style={styles.pinDot} />
                <TouchableOpacity
                  onPress={() => {
                    if (mode === 'compose') onRemoveTag?.(t.username);
                    else onTagPress?.(t.username);
                  }}
                  style={styles.pinLabel}
                >
                  <Text style={styles.pinText}>@{t.username}</Text>
                  {mode === 'compose' ? (
                    <Ionicons name="close" size={12} color="#fff" style={{ marginLeft: 4 }} />
                  ) : null}
                </TouchableOpacity>
              </View>
            );
          })
        : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  image: { width: '100%', aspectRatio: 4 / 5, backgroundColor: '#11141C' },
  hintWrap: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 14,
  },
  hintBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  hintText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  tagBadge: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  tagBadgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  pinWrap: {
    position: 'absolute',
    alignItems: 'center',
    // Center the dot on the tap point (12px dot).
    marginLeft: -6,
    marginTop: -6,
  },
  pinDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.4)',
  },
  pinLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  pinText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
