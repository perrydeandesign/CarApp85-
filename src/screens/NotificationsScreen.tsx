import React, { useState, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { T } from '../constants/theme';
import { useMeProfile } from '../hooks/useMeProfile';
import { useNotifications, type Notification } from '../hooks/useNotifications';

type Props = {
  onBack: () => void;
  onProfilePress?: (conn: any) => void;
  onPostPress?: (postId: string) => void;
  onMentionPress?: (username: string) => void;
  onHashtagPress?: (tag: string) => void;
};

function actionText(n: Notification): string {
  switch (n.type) {
    case 'like':
      return 'liked your post';
    case 'comment':
      return 'commented on your post';
    case 'follow':
      return 'started following you';
    case 'mention':
      return 'mentioned you';
    case 'competition':
      return 'entered your competition';
    default:
      return n.body ?? 'did something';
  }
}

function iconFor(n: Notification): { name: string; color: string } {
  switch (n.type) {
    case 'like':
      return { name: 'heart', color: '#FF4D6D' };
    case 'comment':
      return { name: 'chatbubble', color: '#3897F0' };
    case 'follow':
      return { name: 'person-add', color: '#00C9A7' };
    case 'mention':
      return { name: 'at', color: '#A855F7' };
    case 'competition':
      return { name: 'trophy', color: '#FBBF24' };
    default:
      return { name: 'notifications', color: T.tx2 };
  }
}

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function NotificationsScreen({
  onBack,
  onProfilePress,
  onPostPress,
}: Props) {
  const { data: me } = useMeProfile();
  const {
    notifications,
    loading,
    unreadCount,
    refresh: refreshNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications(me?.id ?? null);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  }, [refreshNotifications]);

  const handleTap = (n: Notification) => {
    if (!n.read) void markAsRead(n.id);

    const conn = {
      userId: n.actor.id,
      user: n.actor.username,
      img: n.actor.avatarUrl || '',
    };

    if (n.type === 'follow') {
      onProfilePress?.(conn);
    } else if (n.postId) {
      onPostPress?.(n.postId);
    } else {
      onProfilePress?.(conn);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={26} color={T.wh} />
        </TouchableOpacity>

        <Text style={styles.title}>Notifications</Text>

        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markAll}>Mark all read</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 26 }} />
        )}
      </View>

      {/* LIST */}
      <FlatList
        data={notifications}
        keyExtractor={(n) => n.id}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={T.accent}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons
                name="notifications-off-outline"
                size={36}
                color={T.mu}
              />
              <Text style={styles.emptyText}>No notifications yet</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading && notifications.length > 0 ? (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <ActivityIndicator color={T.accent} />
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const icon = iconFor(item);

          return (
            <TouchableOpacity
              onPress={() => handleTap(item)}
              style={[styles.row, !item.read && styles.rowUnread]}
            >
              {/* Avatar */}
              {item.actor.avatarUrl ? (
                <Image
                  source={{ uri: item.actor.avatarUrl }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.avatarInitials}>
                    {item.actor.username?.slice(0, 2)?.toUpperCase()}
                  </Text>
                </View>
              )}

              {/* Text */}
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.line} numberOfLines={2}>
                  <Text style={styles.actor}>{item.actor.username}</Text>{' '}
                  <Text style={styles.action}>{actionText(item)}</Text>
                </Text>

                <Text style={styles.timestamp}>
                  {timeAgo(item.createdAt)}
                </Text>
              </View>

              {/* Icon */}
              <Ionicons
                name={icon.name as any}
                size={18}
                color={icon.color}
              />
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: T.bd,
  },
  title: { color: T.wh, fontSize: 17, fontWeight: '700' },
  markAll: { color: T.accent, fontWeight: '700', fontSize: 13 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: T.bd,
  },
  rowUnread: { backgroundColor: 'rgba(0,201,167,0.06)' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: T.card2,
  },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { color: T.mu, fontWeight: '700', fontSize: 13 },
  line: { color: T.wh, fontSize: 14, lineHeight: 19 },
  actor: { fontWeight: '700' },
  action: { color: T.tx2 },
  timestamp: { color: T.mu, fontSize: 11, marginTop: 4 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: { color: T.mu, fontSize: 14, marginTop: 10 },
});
