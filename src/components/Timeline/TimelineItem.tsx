import React, { useState } from 'react';
import { Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CAT, T, TL_ICONS } from '../../constants/theme';
import { TimelineCategoryPill } from './TimelineCategoryPill';
import { TimelineImage } from './TimelineImage';
import type { TimelineEntry } from '../../hooks/useTimeline';
import { useLikePost } from '../../hooks/useLikePost';
import { useMeProfile } from '../../hooks/useMeProfile';
import { supabase } from '../../lib/supabase';
import { CommentComposerSheet } from '../CommentComposerSheet';
import { LikeButton } from '../../ui/LikeButton';

// Timeline entry ids are real `posts` UUIDs when sourced from Supabase.
const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(s);

type Props = {
  entry: TimelineEntry;
  isFirst?: boolean;
  isLast?: boolean;
  canDelete?: boolean;
  onLongPress?: () => void;
};

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)} days ago`;
  if (s < 86400 * 30) return `${Math.floor(s / (86400 * 7))} week${s < 86400 * 14 ? '' : 's'} ago`;
  if (s < 86400 * 365) return `${Math.floor(s / (86400 * 30))} month${s < 86400 * 60 ? '' : 's'} ago`;
  return `${Math.floor(s / (86400 * 365))} year${s < 86400 * 730 ? '' : 's'} ago`;
}

export function TimelineItem({ entry, isFirst, isLast, canDelete, onLongPress }: Props) {
  const cc = CAT[entry.category];
  const iconName = TL_ICONS[entry.category] || 'ellipse-outline';

  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(entry.likeCount);
  const [commentCount, setCommentCount] = useState(entry.commentCount);
  const [composerOpen, setComposerOpen] = useState(false);

  const { toggleLike: persistLike } = useLikePost();
  const { data: me } = useMeProfile();
  const persists = isUuid(entry.id);

  const toggleLike = () => {
    const willLike = !liked;
    // Optimistic UI first.
    setLiked(willLike);
    setLikeCount((c) => c + (willLike ? 1 : -1));
    // Persist to post_likes when this is a real server post; revert on failure.
    if (persists) {
      void persistLike(entry.id, !willLike).catch(() => {
        setLiked(!willLike);
        setLikeCount((c) => c + (willLike ? -1 : 1));
      });
    }
  };

  const submitComment = async (text?: string) => {
    const body = (text ?? '').trim();
    if (!body) return;
    setCommentCount((c) => c + 1); // optimistic
    if (persists && me?.id) {
      const { error } = await supabase
        .from('post_comments')
        .insert({ post_id: entry.id, author_id: me.id, body });
      if (error) setCommentCount((c) => c - 1); // revert on failure
    }
  };

  const onComment = () => setComposerOpen(true);

  const onShare = async () => {
    try {
      await Share.share({
        message: `${entry.title}${entry.description ? ` — ${entry.description}` : ''}`,
        url: entry.imageUrl ?? undefined,
      });
    } catch (_) {}
  };

  const hasImage = !!entry.imageUrl;

  return (
    <View style={styles.row}>
      {/* Left rail: connector line + colored dot */}
      <View style={styles.rail}>
        <View
          style={[
            styles.line,
            styles.topLine,
            { backgroundColor: isFirst ? 'transparent' : T.bd },
          ]}
        />
        <View
          style={[
            styles.dot,
            {
              borderColor: cc.border,
              backgroundColor: cc.bg,
            },
          ]}
        >
          <Ionicons name={iconName as any} size={14} color={cc.text} />
        </View>
        <View
          style={[
            styles.line,
            styles.bottomLine,
            { backgroundColor: isLast ? 'transparent' : T.bd },
          ]}
        />
      </View>

      {/* Right column: pill + card */}
      <View style={styles.content}>
        <View style={styles.headRow}>
          <TimelineCategoryPill category={entry.category} />
          <Text style={styles.timeAgo}>{timeAgo(entry.createdAt)}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setExpanded((p) => !p)}
          onLongPress={canDelete ? onLongPress : undefined}
          delayLongPress={400}
          style={styles.card}
        >
          {/* Category-colored top accent */}
          <View style={[styles.cardAccent, { backgroundColor: cc.border }]} />

          <View style={styles.cardBody}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{entry.title}</Text>
              {hasImage ? (
                <Ionicons
                  name={expanded ? 'chevron-up' : 'image-outline'}
                  size={16}
                  color={T.accent}
                />
              ) : null}
            </View>
            {entry.description ? (
              <Text style={styles.description}>{entry.description}</Text>
            ) : null}

            {/* Collapsed by default — tap the card to reveal photos. */}
            {expanded && hasImage ? <TimelineImage uri={entry.imageUrl!} /> : null}

            <View style={styles.actionsRow}>
              <LikeButton
                liked={liked}
                count={likeCount}
                size={16}
                onPress={toggleLike}
                countStyle={styles.actionCount}
              />

              <TouchableOpacity
                onPress={onComment}
                style={styles.actionGroup}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="chatbubble-outline" size={16} color={T.mu} />
                <Text style={styles.actionCount}>{commentCount}</Text>
              </TouchableOpacity>

              <View style={{ flex: 1 }} />

              <TouchableOpacity
                onPress={onShare}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="share-outline" size={16} color={T.mu} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <CommentComposerSheet
        visible={composerOpen}
        context={entry.title}
        onClose={() => setComposerOpen(false)}
        onSubmit={(text) => void submitComment(text)}
      />
    </View>
  );
}

const RAIL_WIDTH = 40;
const DOT_SIZE = 32;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  rail: {
    width: RAIL_WIDTH,
    alignItems: 'center',
  },
  line: {
    width: 2,
  },
  topLine: {
    height: 14,
  },
  bottomLine: {
    flex: 1,
    minHeight: 8,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 4,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 6,
  },
  timeAgo: {
    color: T.mu,
    fontSize: 12,
  },
  card: {
    backgroundColor: T.card,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: T.bd,
    marginBottom: 18,
  },
  cardAccent: {
    height: 2,
    width: '100%',
  },
  cardBody: {
    padding: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    color: T.wh,
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  description: {
    color: T.mu,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  expandHint: {
    color: T.accent,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: T.bd,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionCount: {
    color: T.mu,
    fontSize: 12,
    fontWeight: '600',
  },
});
