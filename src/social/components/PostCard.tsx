import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { IGActionsRow } from '../../ui/IGActionsRow';
import { RichCaption } from './RichCaption';
import { TaggablePhoto } from './TaggablePhoto';
import { Avatar } from '../../components/Avatar';
import { VideoView } from '../../ui/VideoView';

type CardPost = {
  id: string;
  imageUrl: string;
  /** 'video' renders a player instead of a photo. */
  mediaType?: 'image' | 'video';
  caption: string;
  username: string;
  avatarUrl?: string;
  /** A recent liker's username, for the "Liked by @x and N others" line. */
  proofUsername?: string;
  likeCount: number;
  commentCount: number;
  isLikedByCurrentUser: boolean;
  isSavedByCurrentUser?: boolean;
  /** Phase 2.6: needed for the in-header Follow chip. */
  authorId?: string;
  /** Phase 2.6: hide the Follow chip when this is true. */
  isAuthorFollowedByCurrentUser?: boolean;
  photoTags?: { username: string; x: number; y: number }[];
};

type Props = {
  post: CardPost;
  onPress?: () => void;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onSave?: () => void;
  onMentionPress?: (username: string) => void;
  onHashtagPress?: (tag: string) => void;
  /** Phase 2.6: pressing the Follow chip. */
  onFollowAuthor?: (authorId: string) => void;
  /** Tap the avatar/username → open that user's profile. */
  onProfilePress?: () => void;
  /** "…" menu → report / block (UGC moderation). */
  onMore?: () => void;
};

export const PostCard: React.FC<Props> = ({
  post,
  onPress,
  onLike,
  onComment,
  onShare,
  onSave,
  onMentionPress,
  onHashtagPress,
  onFollowAuthor,
  onProfilePress,
  onMore,
}) => {
  const showFollow =
    !!post.authorId &&
    post.isAuthorFollowedByCurrentUser === false &&
    !!onFollowAuthor;

  return (
    <View style={stylesCard.container}>

      <View style={stylesCard.headerRow}>
        <TouchableOpacity
          onPress={onProfilePress}
          disabled={!onProfilePress}
          style={stylesCard.headerIdentity}
          activeOpacity={0.7}
        >
          <Avatar
            img={post.avatarUrl || undefined}
            initials={post.username?.[0]?.toUpperCase()}
            size={32}
          />
          <Text style={[stylesCard.username, { marginLeft: 8 }]}>{post.username}</Text>
        </TouchableOpacity>
        {showFollow ? (
          <>
            <Text style={stylesCard.headerSeparator}>·</Text>
            <TouchableOpacity
              onPress={() => {
                if (post.authorId && onFollowAuthor) onFollowAuthor(post.authorId);
              }}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Text style={stylesCard.followLink}>Follow</Text>
            </TouchableOpacity>
          </>
        ) : null}
        <View style={{ flex: 1 }} />
        {onMore ? (
          <TouchableOpacity onPress={onMore} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={{ color: '#C9D1D9', fontSize: 20, fontWeight: '700', marginTop: -6 }}>⋯</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Video posts play inline; photo posts show the image; text posts show the caption. */}
      {post.imageUrl && post.mediaType === 'video' ? (
        <TouchableOpacity activeOpacity={0.95} onPress={onPress}>
          <VideoView uri={post.imageUrl} style={stylesCard.image} controls muted repeat />
        </TouchableOpacity>
      ) : post.imageUrl ? (
        <TouchableOpacity activeOpacity={0.95} onPress={onPress}>
          <TaggablePhoto
            uri={post.imageUrl}
            tags={post.photoTags ?? []}
            imageStyle={stylesCard.image}
            onTagPress={onMentionPress}
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity activeOpacity={0.95} onPress={onPress} style={stylesCard.textBody}>
          <RichCaption
            text={post.caption}
            style={stylesCard.textBodyCaption}
            onMentionPress={onMentionPress}
            onHashtagPress={onHashtagPress}
          />
        </TouchableOpacity>
      )}

      <IGActionsRow
        isLiked={post.isLikedByCurrentUser}
        isSaved={post.isSavedByCurrentUser}
        likeCount={post.likeCount}
        commentCount={post.commentCount}
        onLike={onLike ?? (() => {})}
        onComment={onComment}
        onShare={onShare}
        onSave={onSave}
        size="medium"
      />

      {post.proofUsername && post.likeCount > 0 ? (
        <TouchableOpacity
          onPress={onProfilePress}
          disabled={!onProfilePress}
          activeOpacity={0.7}
          style={stylesCard.proofRow}
        >
          <Text style={stylesCard.proofText}>
            Liked by <Text style={stylesCard.proofName}>@{post.proofUsername}</Text>
            {post.likeCount > 1 ? (
              <Text>
                {' '}and <Text style={stylesCard.proofName}>{post.likeCount - 1} others</Text>
              </Text>
            ) : null}
          </Text>
        </TouchableOpacity>
      ) : null}

      {/* Text posts already render the caption as the body — don't repeat it. */}
      {post.imageUrl ? (
        <View style={stylesCard.captionRow}>
          <Text style={stylesCard.username}>{post.username} </Text>
          <RichCaption
            text={post.caption}
            style={stylesCard.captionText}
            onMentionPress={onMentionPress}
            onHashtagPress={onHashtagPress}
            numberOfLines={3}
          />
        </View>
      ) : null}

    </View>
  );
};

const stylesCard = StyleSheet.create({
  container: { backgroundColor: '#0D1117', marginBottom: 16 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  headerIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  headerSeparator: { color: '#C9D1D9', marginHorizontal: 6, fontSize: 14 },
  followLink: { color: '#3897F0', fontWeight: '700', fontSize: 13 },
  image: { width: '100%', aspectRatio: 4 / 5, backgroundColor: '#11141C' },
  textBody: { paddingHorizontal: 14, paddingTop: 2, paddingBottom: 10 },
  textBodyCaption: { color: '#FFFFFF', fontSize: 16, lineHeight: 23 },
  proofRow: {
    paddingHorizontal: 12,
    paddingBottom: 6,
  },
  proofText: { color: '#AEB6C2', fontSize: 13 },
  proofName: { color: '#FFFFFF', fontWeight: '700' },
  captionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  captionText: {
    color: '#FFFFFF',
    fontSize: 13,
    flexShrink: 1,
  },
});
