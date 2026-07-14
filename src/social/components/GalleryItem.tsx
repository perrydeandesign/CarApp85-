import React from 'react';
import { TouchableOpacity, Image, View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { GridMedia } from '../../ui/GridMedia';

type GalleryItemProps = {
  imageUrl: string;
  likeCount: number;
  commentCount: number;
  onPress: () => void;
  /** When true the tile is a video — renders a paused poster + play badge. */
  isVideo?: boolean;
};

export const GalleryItem = ({ imageUrl, likeCount, commentCount, onPress, isVideo }: GalleryItemProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      {isVideo ? (
        <GridMedia uri={imageUrl} isVideo containerStyle={styles.image} />
      ) : (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      )}

      <View style={styles.overlay}>
        <View style={styles.row}>
          <Ionicons name="heart-outline" size={16} color="#fff" />
          <Text style={styles.count}>{likeCount}</Text>

          <Ionicons name="chatbubble-outline" size={16} color="#fff" style={styles.iconSpacing} />
          <Text style={styles.count}>{commentCount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '33.333%',
    aspectRatio: 1,
    padding: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  count: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  iconSpacing: {
    marginLeft: 12,
  },
});
