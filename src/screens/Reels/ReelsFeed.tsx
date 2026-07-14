import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { T } from '../../constants/theme';
import { VideoView } from '../../ui/VideoView';
import { useReels } from '../../hooks/useReels';
import { usePostInteractions } from '../../social/hooks/usePostInteractions';
import { useMeProfile } from '../../hooks/useMeProfile';
import type { UserPreview } from '../../social/data/posts';
import { PostDetailScreen } from '../PostDetailScreen';

/** Vertical, full-screen autoplay video feed (Reels). */
export function ReelsFeed() {
  const { posts, loading, loadMore } = useReels();
  const { data: me } = useMeProfile();
  const currentUser: UserPreview = useMemo(
    () => ({ id: me?.id ?? '', username: me?.username ?? '', avatarUrl: me?.avatar_url ?? '' }),
    [me?.id, me?.username, me?.avatar_url],
  );
  const social = usePostInteractions(posts, currentUser);

  const [height, setHeight] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [muted, setMuted] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  const openPost = social.posts.find((p) => p.id === openId) ?? null;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 80 }).current;
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ item: { id: string } }> }) => {
      if (viewableItems.length > 0) setActiveId(viewableItems[0].item.id);
    },
  ).current;

  const renderItem = useCallback(
    ({ item }: { item: (typeof social.posts)[number] }) => (
      <View style={{ height, backgroundColor: '#000' }}>
        <TouchableWithoutFeedback onPress={() => setMuted((m) => !m)}>
          <View style={{ flex: 1 }}>
            <VideoView
              uri={item.mediaUrl}
              style={{ flex: 1 }}
              paused={item.id !== activeId}
              muted={muted}
              repeat
              resizeMode="cover"
            />
          </View>
        </TouchableWithoutFeedback>

        {/* Right action rail */}
        <View style={{ position: 'absolute', right: 12, bottom: 90, alignItems: 'center', gap: 20 }}>
          <Action
            icon={item.isLikedByCurrentUser ? 'heart' : 'heart-outline'}
            color={item.isLikedByCurrentUser ? T.accent : '#fff'}
            label={String(item.likeCount)}
            onPress={() => social.likePost(item.id)}
          />
          <Action icon="chatbubble-outline" color="#fff" label={String(item.commentCount)} onPress={() => setOpenId(item.id)} />
          <Action icon="paper-plane-outline" color="#fff" label="Share" onPress={() => social.sharePost(item.id)} />
          <Ionicons name={muted ? 'volume-mute' : 'volume-high'} size={22} color="#fff" />
        </View>

        {/* Bottom author + caption */}
        <View style={{ position: 'absolute', left: 14, right: 70, bottom: 40 }}>
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15, marginBottom: 4 }}>
            @{item.author.username}
          </Text>
          {item.caption ? (
            <Text numberOfLines={2} style={{ color: '#eaeaea', fontSize: 13, lineHeight: 18 }}>
              {item.caption}
            </Text>
          ) : null}
        </View>
      </View>
    ),
    [height, activeId, muted, social],
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }} onLayout={(e) => setHeight(e.nativeEvent.layout.height)}>
      {loading && posts.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={T.accent} />
        </View>
      ) : posts.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Ionicons name="film-outline" size={40} color={T.mu} />
          <Text style={{ color: T.mu, marginTop: 10 }}>No videos yet — post one to start the reel.</Text>
        </View>
      ) : height > 0 ? (
        <FlatList
          data={social.posts}
          keyExtractor={(p) => p.id}
          renderItem={renderItem}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToInterval={height}
          decelerationRate="fast"
          getItemLayout={(_, index) => ({ length: height, offset: height * index, index })}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          onEndReached={() => void loadMore()}
          onEndReachedThreshold={0.6}
          windowSize={3}
          maxToRenderPerBatch={3}
          initialNumToRender={2}
        />
      ) : null}

      <Modal visible={openPost !== null} animationType="slide" onRequestClose={() => setOpenId(null)}>
        {openPost && (
          <PostDetailScreen
            post={openPost}
            onClose={() => setOpenId(null)}
            onLike={() => social.likePost(openPost.id)}
            onReact={(r) => social.addReaction(openPost.id, r)}
            onShare={() => social.sharePost(openPost.id)}
            onAddComment={(_id, text) => social.addComment(openPost.id, text)}
          />
        )}
      </Modal>
    </View>
  );
}

function Action({ icon, color, label, onPress }: { icon: string; color: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ alignItems: 'center' }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      <Ionicons name={icon as any} size={28} color={color} />
      <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700', marginTop: 3 }}>{label}</Text>
    </TouchableOpacity>
  );
}
