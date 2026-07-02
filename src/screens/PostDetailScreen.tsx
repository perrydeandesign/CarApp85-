import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import type { Comment, Post, ReactionType } from '../social/data/posts';
import { CommentsThread } from '../social/components/CommentsThread';
import { IGActionsRow } from '../ui/IGActionsRow';
import { IGCommentInputBar } from '../ui/IGCommentInputBar';
import { RichCaption } from '../social/components/RichCaption';
import { TaggablePhoto } from '../social/components/TaggablePhoto';
import { useComments } from '../hooks/useComments';

type Props = {
  post: Post;
  onClose: () => void;
  onLike: () => void;
  onReact: (reaction: ReactionType) => void;
  onShare: () => void;
  onSave?: () => void;
  /**
   * Legacy compatibility: callers used to pass an in-memory comments array
   * and an onAddComment handler. Both are now optional — PostDetailScreen
   * pulls the comments straight from the server via useComments(post.id).
   */
  comments?: Comment[];
  onAddComment?: (postId: string, text: string) => void;
  onMentionPress?: (username: string) => void;
  onHashtagPress?: (tag: string) => void;
};

export const PostDetailScreen: React.FC<Props> = ({
  post,
  onClose,
  onLike,
  onShare,
  onSave,
  onMentionPress,
  onHashtagPress,
}) => {
  const { comments: postComments, addComment } = useComments(post.id);
  const handleSubmitComment = async (text: string) => {
    try {
      await addComment(text);
    } catch (err: any) {
      Alert.alert('Comment failed', err?.message ?? 'Unknown error');
    }
  };
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.close}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{post.author.username}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <TaggablePhoto
          uri={post.mediaUrl}
          tags={post.photoTags ?? []}
          imageStyle={styles.image}
          onTagPress={onMentionPress}
        />

        <IGActionsRow
          isLiked={post.isLikedByCurrentUser}
          isSaved={post.isSavedByCurrentUser}
          likeCount={post.likeCount}
          commentCount={post.commentCount}
          onLike={onLike}
          onShare={onShare}
          onSave={onSave}
          size="large"
        />

        {post.caption ? (
          <View style={styles.captionRow}>
            <Text style={styles.username}>{post.author.username} </Text>
            <RichCaption
              text={post.caption}
              style={styles.captionText}
              onMentionPress={onMentionPress}
              onHashtagPress={onHashtagPress}
            />
          </View>
        ) : null}

        {post.taggedUsers && post.taggedUsers.length > 0 ? (
          <Text style={styles.tagged}>
            Tagged: {post.taggedUsers.map((u) => '@' + u.username).join(', ')}
          </Text>
        ) : null}

        <View style={styles.commentsContainer}>
          <CommentsThread comments={postComments} />
        </View>
      </ScrollView>

      <IGCommentInputBar onSubmit={handleSubmitComment} />
    </SafeAreaView>
  );
};

// Legacy route-based wrapper retained for any Stack.Screen consumer.
export default function PostDetailRoute({ route }: any) {
  const { post } = route.params;
  return (
    <ScrollView style={styles.safe}>
      <Image source={{ uri: post.image_url || post.mediaUrl }} style={styles.image} />
      <View style={{ padding: 16 }}>
        <Text style={styles.username}>{post.caption}</Text>
        <Text style={styles.meta}>{post.make} • {post.model}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0D1117' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  close: { color: '#F0F6FC', fontSize: 20 },
  title: { flex: 1, textAlign: 'center', color: '#F0F6FC', fontWeight: '600' },
  scroll: { flex: 1 },
  image: {
    width: '100%',
    aspectRatio: 4 / 5,
    backgroundColor: '#111',
  },
  captionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  username: { fontWeight: '600', color: '#F0F6FC' },
  captionText: { color: '#F0F6FC', fontSize: 14, flexShrink: 1 },
  tagged: {
    color: '#7DB6FF',
    paddingHorizontal: 12,
    paddingTop: 6,
    fontSize: 12,
  },
  meta: { color: '#C9D1D9', fontSize: 14, marginTop: 4 },
  commentsContainer: {
    marginTop: 12,
  },
});
