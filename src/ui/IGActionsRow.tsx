import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { iconSizes, iconColors } from './IconStyles';
import { Icon } from './Icon';
import { LikeButton } from './LikeButton';

type IGActionsRowProps = {
  isLiked: boolean;
  isSaved?: boolean;
  likeCount: number;
  commentCount: number;
  onLike: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onSave?: () => void;
  size?: 'small' | 'medium' | 'large';
};

export const IGActionsRow: React.FC<IGActionsRowProps> = ({
  isLiked,
  isSaved,
  likeCount,
  commentCount,
  onLike,
  onComment,
  onShare,
  onSave,
  size = 'medium',
}) => {
  const iconSize = iconSizes[size];
  const shareCount = 0;
  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        <LikeButton
          liked={isLiked}
          count={likeCount}
          size={iconSize}
          onPress={onLike}
          style={styles.iconButton}
          countStyle={styles.count}
        />

        {onComment && (
          <TouchableOpacity onPress={onComment} style={styles.iconButton}>
            <Icon name="chatbubble-outline" size={iconSize} color={iconColors.primary} />
            <Text style={styles.count}>{commentCount}</Text>
          </TouchableOpacity>
        )}

        {onShare && (
          <TouchableOpacity onPress={onShare} style={styles.iconButton}>
            <Icon name="paper-plane-outline" size={iconSize} color={iconColors.primary} />
            <Text style={styles.count}>{shareCount}</Text>
          </TouchableOpacity>
        )}
      </View>

      {onSave && (
        <TouchableOpacity onPress={onSave} style={styles.saveButton}>
          <Icon
            name="bookmark-outline"
            size={iconSize}
            color={isSaved ? iconColors.liked : iconColors.primary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    marginRight: 16,
    gap: 6,
  },
  count: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  saveButton: {
    position: 'absolute',
    right: 12,
    top: 8,
    padding: 6,
  },
});
