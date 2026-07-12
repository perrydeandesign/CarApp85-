import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FadeInImage } from './FadeInImage';
import { VideoView } from './VideoView';

type Props = {
  uri: string;
  isVideo?: boolean;
  containerStyle?: ViewStyle;
};

/**
 * Media thumbnail for grids (explore / profile). Photos use FadeInImage; videos
 * render a paused first frame (poster) with a small play badge, so a video tile
 * looks intentional instead of blank. Fill your tile and pass isVideo.
 */
export function GridMedia({ uri, isVideo, containerStyle }: Props) {
  if (isVideo) {
    return (
      <View style={[styles.fill, containerStyle]}>
        <VideoView uri={uri} style={styles.fill} paused muted resizeMode="cover" />
        <View style={styles.badge}>
          <Ionicons name="play" size={12} color="#fff" />
        </View>
      </View>
    );
  }
  return <FadeInImage source={{ uri }} containerStyle={containerStyle ?? styles.fill} />;
}

const styles = StyleSheet.create({
  fill: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
