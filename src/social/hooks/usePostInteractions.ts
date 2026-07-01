import { useCallback, useEffect, useState } from 'react';
import { Alert, Share } from 'react-native';
import { useLikePost } from '../../hooks/useLikePost';
import { checkText } from '../../lib/moderation';
import type { Comment, Post, ReactionType, UserPreview } from '../data/posts';

/**
 * Phase 2.5: wraps the new server-backed hooks while preserving the existing
 * return shape so Home.tsx and Profile.tsx don't need to change.
 *
 * - posts: local cache, optimistically updated on like/comment. The server is
 *          source-of-truth for the canonical like/comment counts; refetch the
 *          feed (via the feed hook's `refresh`) when you want them re-synced.
 * - likePost: optimistic toggle, falls back to the server.
 * - addComment: still in-memory here. The PostDetailScreen wires the real
 *               server insert via useComments(); this method is retained for
 *               legacy callers but does NOT persist server-side.
 * - sharePost: native Share API.
 */
export function usePostInteractions(initialPosts: Post[], _currentUser: UserPreview) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [comments, setComments] = useState<Comment[]>([]);
  const { toggleLike } = useLikePost();

  // Re-sync when the upstream source changes (e.g. server feed loads after mount).
  // Preserves in-memory like/comment counts for posts that already existed.
  useEffect(() => {
    setPosts((prev) => {
      const byId = new Map(prev.map((p) => [p.id, p]));
      return initialPosts.map((p) => {
        const existing = byId.get(p.id);
        if (!existing) return p;
        return {
          ...p,
          isLikedByCurrentUser: existing.isLikedByCurrentUser,
          likeCount: existing.likeCount,
          commentCount: existing.commentCount,
        };
      });
    });
  }, [initialPosts]);

  const likePost = useCallback(
    (postId: string) => {
      // Optimistic local toggle first so the UI reacts instantly.
      let wasLiked = false;
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          wasLiked = p.isLikedByCurrentUser;
          return {
            ...p,
            isLikedByCurrentUser: !wasLiked,
            likeCount: p.likeCount + (wasLiked ? -1 : 1),
          };
        }),
      );
      // Persist server-side; revert on failure.
      void toggleLike(postId, wasLiked).catch((err) => {
        console.warn('likePost failed; reverting', err);
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  isLikedByCurrentUser: wasLiked,
                  likeCount: p.likeCount + (wasLiked ? 1 : -1),
                }
              : p,
          ),
        );
      });
    },
    [toggleLike],
  );

  const addComment = useCallback(
    (postId: string, text: string) => {
      const trimmed = String(text || '').trim();
      if (!trimmed) return;
      const check = checkText(trimmed);
      if (!check.ok) {
        Alert.alert('Please rephrase', check.reason);
        return;
      }
      const newComment: Comment = {
        id: Math.random().toString(36).slice(2),
        postId,
        author: { id: 'local', username: 'you', avatarUrl: '' },
        text: trimmed,
        createdAt: new Date().toISOString(),
      };
      setComments((prev) => [newComment, ...prev]);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p,
        ),
      );
    },
    [],
  );

  const addReaction = useCallback(
    (postId: string, _reaction: ReactionType) => {
      likePost(postId);
    },
    [likePost],
  );

  const sharePost = useCallback(
    async (postId: string) => {
      const post = posts.find((p) => p.id === postId);
      if (!post) return;
      try {
        await Share.share({
          message: `${post.author.username} on Modified: ${post.caption}`,
          url: post.mediaUrl,
        });
      } catch {
        // user cancelled or share unavailable — nothing to do
      }
    },
    [posts],
  );

  const setSavedFlag = useCallback((postId: string, isSaved: boolean) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isSavedByCurrentUser: isSaved } : p)),
    );
  }, []);

  return {
    posts,
    comments,
    likePost,
    addComment,
    addReaction,
    sharePost,
    setSavedFlag,
  };
}
