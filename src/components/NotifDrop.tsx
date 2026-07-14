import React from 'react';
import {
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { T } from '../constants/theme';
import { useNotifications, type Notification } from '../hooks/useNotifications';
import { useConversations } from '../hooks/useMessages';
import { useMeProfile } from '../hooks/useMeProfile';
import { track } from '../lib/observability';

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Optional handlers — the recipient screen wires real navigation here. */
  onProfilePress?: (userId: string) => void;
  onPostPress?: (postId: string) => void;
  /** Opens the full Notifications screen. */
  onViewAll?: () => void;
  /** Opens the Messages inbox (Instagram-style: messages live under notifications). */
  onOpenMessages?: () => void;
};

function actionText(n: Notification): string {
  switch (n.type) {
    case 'like':        return 'liked your post';
    case 'comment':     return 'commented on your post';
    case 'follow':      return 'started following you';
    case 'mention':     return 'mentioned you';
    case 'competition': return 'entered your competition';
    case 'message':     return 'sent you a message';
    default:            return n.body ?? '';
  }
}

function iconFor(n: Notification): { name: string; color: string } {
  switch (n.type) {
    case 'like':        return { name: 'heart',       color: '#FF4D6D' };
    case 'comment':     return { name: 'chatbubble',  color: '#3897F0' };
    case 'follow':      return { name: 'person-add',  color: '#00C9A7' };
    case 'mention':     return { name: 'at',          color: '#A855F7' };
    case 'competition': return { name: 'trophy',      color: '#FBBF24' };
    case 'message':     return { name: 'paper-plane', color: '#00C9A7' };
    default:            return { name: 'notifications', color: T.tx2 };
  }
}

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

const PREVIEW_LIMIT = 6;

const MSG_PREVIEW_LIMIT = 3;

export function NotifDrop({ visible, onClose, onProfilePress, onPostPress, onViewAll, onOpenMessages }: Props) {
  const { data: me } = useMeProfile();
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead } = useNotifications(me?.id ?? null);
  const { data: conversations } = useConversations(me?.id ?? null);
  const recentConversations = conversations.filter((c) => c.other).slice(0, MSG_PREVIEW_LIMIT);

  const handleTap = (n: Notification) => {
    track('notification_open', { type: n.type });
    if (!n.readAt) void markAsRead(n.id);
    if (n.type === 'follow') {
      onProfilePress?.(n.actor.id);
    } else if (n.postId) {
      onPostPress?.(n.postId);
    } else {
      onProfilePress?.(n.actor.id);
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <TouchableOpacity activeOpacity={1} onPress={onClose} style={styles.backdrop}>
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()} style={styles.card}>
          <SafeAreaView>
            <View style={styles.header}>
              <Text style={styles.title}>
                Notifications{unreadCount > 0 ? `  (${unreadCount})` : ''}
              </Text>
              <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
                {unreadCount > 0 ? (
                  <TouchableOpacity onPress={() => void markAllAsRead()}>
                    <Text style={styles.markAll}>Mark all read</Text>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={20} color={T.wh} />
                </TouchableOpacity>
              </View>
            </View>

            {loading && notifications.length === 0 ? (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <ActivityIndicator color={T.accent} />
              </View>
            ) : null}

            {!loading && notifications.length === 0 ? (
              <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                <Ionicons name="notifications-off-outline" size={28} color={T.mu} />
                <Text style={{ color: T.mu, fontSize: 13, marginTop: 8 }}>
                  You're all caught up.
                </Text>
              </View>
            ) : null}

            <ScrollView style={{ maxHeight: 420 }}>
              {/* Messages section — Instagram-style: DMs live under notifications. */}
              {onOpenMessages && recentConversations.length > 0 ? (
                <View>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionLabel}>Messages</Text>
                    <TouchableOpacity
                      onPress={() => {
                        onClose();
                        onOpenMessages();
                      }}
                    >
                      <Text style={styles.markAll}>See all</Text>
                    </TouchableOpacity>
                  </View>
                  {recentConversations.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={styles.row}
                      onPress={() => {
                        onClose();
                        onOpenMessages();
                      }}
                    >
                      {c.other?.avatarUrl ? (
                        <Image source={{ uri: c.other.avatarUrl }} style={styles.avatar} />
                      ) : (
                        <View style={[styles.avatar, styles.avatarFallback]}>
                          <Text style={styles.avatarInitials}>
                            {c.other?.username.slice(0, 2).toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.line} numberOfLines={1}>
                          <Text style={styles.actor}>{c.other?.username}</Text>
                        </Text>
                        <Text style={styles.action} numberOfLines={1}>
                          {c.lastMessage ?? 'Say hi 👋'}
                        </Text>
                      </View>
                      <Ionicons name="paper-plane" size={16} color={T.accent} />
                    </TouchableOpacity>
                  ))}
                  {notifications.length > 0 ? <Text style={styles.sectionTitle}>Activity</Text> : null}
                </View>
              ) : null}

              {notifications.slice(0, PREVIEW_LIMIT).map((n) => {
                const icon = iconFor(n);
                return (
                  <TouchableOpacity
                    key={n.id}
                    style={[styles.row, !n.readAt && styles.rowUnread]}
                    onPress={() => handleTap(n)}
                  >
                    {n.actor.avatarUrl ? (
                      <Image source={{ uri: n.actor.avatarUrl }} style={styles.avatar} />
                    ) : (
                      <View style={[styles.avatar, styles.avatarFallback]}>
                        <Text style={styles.avatarInitials}>
                          {n.actor.username.slice(0, 2).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.line} numberOfLines={2}>
                        <Text style={styles.actor}>{n.actor.username}</Text>{' '}
                        <Text style={styles.action}>{actionText(n)}</Text>
                      </Text>
                      <Text style={styles.timestamp}>{timeAgo(n.createdAt)}</Text>
                    </View>
                    <Ionicons name={icon.name as any} size={16} color={icon.color} />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {onViewAll && notifications.length > 0 ? (
              <TouchableOpacity
                onPress={() => {
                  onClose();
                  onViewAll();
                }}
              >
                <Text style={styles.footer}>
                  {notifications.length > PREVIEW_LIMIT
                    ? `+${notifications.length - PREVIEW_LIMIT} more — View all`
                    : 'View all notifications'}
                </Text>
              </TouchableOpacity>
            ) : null}
          </SafeAreaView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: T.card,
    borderRadius: 14,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: T.bd,
  },
  title: { color: T.wh, fontWeight: '700', fontSize: 15 },
  markAll: { color: T.accent, fontWeight: '600', fontSize: 12 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 4,
  },
  sectionLabel: {
    color: T.mu,
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    color: T.mu,
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: T.bd,
  },
  rowUnread: { backgroundColor: 'rgba(0,201,167,0.06)' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: T.card2 },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { color: T.mu, fontWeight: '700', fontSize: 12 },
  line: { color: T.wh, fontSize: 13, lineHeight: 18 },
  actor: { fontWeight: '700' },
  action: { color: T.tx2 },
  timestamp: { color: T.mu, fontSize: 11, marginTop: 2 },
  footer: {
    color: T.mu,
    fontSize: 11,
    textAlign: 'center',
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: T.bd,
  },
});
