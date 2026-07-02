import React, { useCallback, useContext, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { T } from '../constants/theme';
import { FeedCardSkeleton } from '../components/Skeleton';

import { ME } from '../data/users';
import { ViewProfileContext } from '../context/ViewProfileContext';
import { useMeProfile } from '../hooks/useMeProfile';
import { useCreatePost } from '../hooks/useCreatePost';
import { useModeration } from '../hooks/useModeration';
import { useMutedKeywords } from '../hooks/useMutedKeywords';
import { Avatar } from '../components/Avatar';
import { ReportSheet } from '../components/ReportSheet';

import { CreatePostBar } from '../components/CreatePostBar';
import { Stories } from '../components/Stories';
import { DiscoverSection } from '../components/DiscoverSection';
import { ChallengesSection } from '../components/ChallengesSection';

import {
  MOCK_POSTS_V2,
  type UserPreview,
  type Post as SocialPost,
} from '../social/data/posts';

import { useFeed } from '../hooks/useFeed';
import { usePostInteractions } from '../social/hooks/usePostInteractions';
import { useCollections } from '../social/hooks/useCollections';
import { useSocialProof } from '../hooks/useSocialProof';

import { PostCard as SocialPostCard } from '../social/components/PostCard';
import { PostDetailScreen } from './PostDetailScreen';
import { SaveToSheet } from './Saved/SaveToSheet';

import { supabase } from '../lib/supabase';
import { SearchPrefillContext } from '../navigation/SearchPrefillContext';

export function HomeTab() {

  // ⭐ QUICK TEST — CONFIRM THIS SCREEN IS ACTUALLY RENDERING
  console.log("HOME TAB RENDERED");

  const { openProfile } = useContext(ViewProfileContext);

  const searchCtx = useContext(SearchPrefillContext);
  const goToSearch = searchCtx?.goToSearch ?? (() => {});

  const currentUser: UserPreview = useMemo(
    () => ({
      id: 'me',
      username: ME.user,
      avatarUrl: ME.img || '',
    }),
    [],
  );

  const feed = useFeed();

  const seedPosts = useMemo<SocialPost[]>(() => {
    const safePosts = Array.isArray(feed.posts) ? feed.posts : [];
    return [...safePosts, ...MOCK_POSTS_V2];
  }, [feed.posts]);

  const social = usePostInteractions(seedPosts ?? [], currentUser);

  const collections = useCollections();

  const [openPostId, setOpenPostId] = useState<string | null>(null);
  const [savePostId, setSavePostId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { data: me } = useMeProfile();
  const { createTextPost } = useCreatePost();

  // Optimistic compose — typed updates appear instantly above the feed, then
  // persist to Supabase. On success we refresh the feed (which pulls the real
  // post) and drop the local placeholder so there's no duplicate.
  const [composed, setComposed] = useState<
    { id: string; text: string; status: 'posting' | 'posted' | 'failed' }[]
  >([]);

  const handleCompose = async (text: string) => {
    const id = `local-${Date.now()}`;
    setComposed((prev) => [{ id, text, status: 'posting' }, ...prev]);
    try {
      await createTextPost(text);
      setComposed((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: 'posted' } : c)),
      );
      // Pull the real row into the feed, then remove the placeholder.
      await feed.refresh();
      setComposed((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setComposed((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: 'failed' } : c)),
      );
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await feed.refresh();
    } finally {
      setRefreshing(false);
    }
  };

  // UGC moderation — blocked & restricted authors and muted-keyword posts are
  // filtered from the feed.
  const moderation = useModeration();
  const muted = useMutedKeywords();
  const [reportPost, setReportPost] = useState<{ id: string; authorId?: string; username?: string } | null>(null);
  const visiblePosts = useMemo(
    () =>
      social.posts.filter(
        (p) =>
          !moderation.isBlocked(p.author.id) &&
          !moderation.isRestricted(p.author.id) &&
          !muted.matchesMuted(p.caption),
      ),
    [social.posts, moderation, muted],
  );

  const openPost = social.posts.find((p) => p.id === openPostId);

  // Social proof — one recent liker per post for the "Liked by @x and N others" line.
  const proofIds = useMemo(
    () => social.posts.map((p) => p.id).filter((id) => /^[0-9a-f-]{36}$/i.test(id)),
    [social.posts],
  );
  const socialProof = useSocialProof(proofIds);

  const handleFollowAuthor = async (authorId: string) => {
    feed.setAuthorFollowed(authorId, true);

    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData.session?.user.id;

    if (!uid || uid === authorId) {
      feed.setAuthorFollowed(authorId, false);
      return;
    }

    const { error } = await supabase
      .from('follows')
      .insert({ follower_id: uid, following_id: authorId });

    if (error && !/duplicate key/i.test(error.message)) {
      feed.setAuthorFollowed(authorId, false);
      console.warn('follow author failed', error);
    }
  };

  // ── FlatList header: everything above the feed posts ──
  const ListHeader = (
    <View>
      {feed.error ? (
        <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
          <Text style={{ color: '#FF6B6B', fontSize: 12 }}>Feed error: {feed.error}</Text>
          <TouchableOpacity onPress={feed.refresh}>
            <Text style={{ color: T.accent, fontSize: 12, marginTop: 4 }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <CreatePostBar onPost={handleCompose} />

      {composed.map((c) => (
        <TouchableOpacity
          key={c.id}
          activeOpacity={c.status === 'failed' ? 0.7 : 1}
          disabled={c.status !== 'failed'}
          onPress={() => {
            if (c.status === 'failed') {
              setComposed((prev) => prev.filter((x) => x.id !== c.id));
              void handleCompose(c.text);
            }
          }}
          style={{ flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, gap: 10, alignItems: 'flex-start' }}
        >
          <Avatar img={me?.avatar_url || undefined} initials={(me?.username || ME.user)?.[0]?.toUpperCase()} size={36} />
          <View style={{ flex: 1, backgroundColor: T.card, borderRadius: 12, padding: 10 }}>
            <Text style={{ color: T.wh, fontWeight: '700', fontSize: 13 }}>{me?.username || ME.user}</Text>
            <Text style={{ color: T.wh, fontSize: 13, marginTop: 2 }}>{c.text}</Text>
            <Text
              style={{
                color: c.status === 'failed' ? '#FF6B6B' : c.status === 'posting' ? T.mu : T.accent,
                fontSize: 11,
                fontWeight: '600',
                marginTop: 6,
              }}
            >
              {c.status === 'posting' ? 'Posting…' : c.status === 'failed' ? "Couldn't post — tap to retry" : 'Posted just now'}
            </Text>
          </View>
        </TouchableOpacity>
      ))}

      <Stories onGoProfile={() => {}} onProfile={(conn) => openProfile?.(conn)} />
      <ChallengesSection />

      {feed.loading && social.posts.length === 0 ? (
        <>
          <FeedCardSkeleton />
          <FeedCardSkeleton />
          <FeedCardSkeleton />
        </>
      ) : null}
    </View>
  );

  const renderPost = useCallback(
    ({ item: sp, index }: { item: (typeof social.posts)[number]; index: number }) => (
      <>
        <SocialPostCard
          post={{
            id: sp.id,
            imageUrl: sp.mediaUrl,
            caption: sp.caption,
            username: sp.author.username,
            avatarUrl: sp.author.avatarUrl,
            proofUsername: socialProof[sp.id],
            authorId: sp.author.id,
            isAuthorFollowedByCurrentUser: sp.isAuthorFollowedByCurrentUser,
            likeCount: sp.likeCount,
            commentCount: sp.commentCount,
            isLikedByCurrentUser: sp.isLikedByCurrentUser,
            isSavedByCurrentUser: collections.isSaved(sp.id),
            photoTags: sp.photoTags,
          }}
          onPress={() => setOpenPostId(sp.id)}
          onLike={() => social.likePost(sp.id)}
          onComment={() => setOpenPostId(sp.id)}
          onShare={() => social.sharePost(sp.id)}
          onSave={() => setSavePostId(sp.id)}
          onFollowAuthor={(authorId) => handleFollowAuthor(authorId)}
          onMentionPress={(username) => goToSearch({ query: username, tab: 'users' })}
          onHashtagPress={(tag) => goToSearch({ query: '#' + tag, tab: 'foryou' })}
          onProfilePress={() =>
            openProfile({
              userId: sp.author.id,
              id: sp.author.id,
              user: sp.author.username,
              username: sp.author.username,
              img: sp.author.avatarUrl,
            })
          }
          onMore={() => setReportPost({ id: sp.id, authorId: sp.author.id, username: sp.author.username })}
        />
        {index === 0 ? <DiscoverSection onProfile={(conn) => openProfile?.(conn)} /> : null}
      </>
    ),
    [socialProof, collections, social, goToSearch, openProfile],
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        style={{ flex: 1 }}
        data={visiblePosts}
        keyExtractor={(sp) => `v2-${sp.id}`}
        renderItem={renderPost}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={
          feed.loadingMore ? (
            <View style={{ paddingVertical: 20 }}>
              <ActivityIndicator size="small" color={T.accent} />
            </View>
          ) : (
            <View style={{ height: 20 }} />
          )
        }
        onEndReached={() => feed.loadMore?.()}
        onEndReachedThreshold={0.6}
        removeClippedSubviews
        windowSize={11}
        maxToRenderPerBatch={6}
        initialNumToRender={6}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={T.accent}
            colors={[T.accent]}
          />
        }
      />

      {/* POST DETAIL MODAL */}
      <Modal
        visible={openPost != null}
        animationType="slide"
        onRequestClose={() => setOpenPostId(null)}
      >
        {openPost && (
          <PostDetailScreen
            post={{
              ...openPost,
              isSavedByCurrentUser: collections.isSaved(openPost.id),
            }}
            comments={social.comments}
            onClose={() => setOpenPostId(null)}
            onLike={() => social.likePost(openPost.id)}
            onReact={(r) => social.addReaction(openPost.id, r)}
            onShare={() => social.sharePost(openPost.id)}
            onSave={() => setSavePostId(openPost.id)}
            onAddComment={social.addComment}
            onMentionPress={(username) => {
              setOpenPostId(null);
              goToSearch({ query: username, tab: 'users' });
            }}
            onHashtagPress={(tag) => {
              setOpenPostId(null);
              goToSearch({ query: '#' + tag, tab: 'foryou' });
            }}
            onProfilePress={(conn) => {
              setOpenPostId(null);
              openProfile(conn);
            }}
          />
        )}
      </Modal>

      {/* SAVE TO SHEET */}
      <SaveToSheet
        visible={savePostId != null}
        collections={collections.collections}
        isSaved={savePostId ? collections.isSaved(savePostId) : false}
        onClose={() => setSavePostId(null)}
        onToggleQuickSave={() => {
          if (savePostId) collections.toggleSave(savePostId);
          setSavePostId(null);
        }}
        onAddToCollection={(collectionId) => {
          if (savePostId) collections.addToCollection(savePostId, collectionId);
          setSavePostId(null);
        }}
        onCreateCollection={collections.createCollection}
        isInCollection={(collectionId) =>
          savePostId ? collections.isInCollection(savePostId, collectionId) : false
        }
      />

      {/* UGC moderation — report / block */}
      <ReportSheet
        visible={reportPost != null}
        postId={reportPost?.id ?? null}
        authorId={reportPost?.authorId}
        authorUsername={reportPost?.username}
        onClose={() => setReportPost(null)}
        onBlocked={() => moderation.refreshBlocks()}
      />
    </View>
  );
}
