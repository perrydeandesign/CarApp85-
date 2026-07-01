import React, { useEffect, useState, useCallback } from 'react';
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
import { getNotifications } from '../lib/data';
import { sb } from '../lib/data';

type Props = {
  onBack: () => void;
  onProfilePress?: (conn: any) => void;
  onPostPress?: (postId: string) => void;
  onMentionPress?: (username: string) => void;
  onHashtagPress?: (tag: string) => void;
};

function actionText(n: any): string {
  switch (n.type) {
    case 'like':
      return 'liked your post';
    case 'comment':
      return 'commented on your post';
    case 'follow':
      return 'started following you';
    case 'tag':
      return 'tagged you in a post';
    case 'mention':
      return 'mentioned you';
    default:
      return 'did something';
  }
}

function iconFor(n: any): { name: string; color: string } {
  switch (n.type) {
    case 'like':
      return { name: 'heart', color: '#FF4D6D' };
    case 'comment':
      return { name: 'chatbubble', color: '#3897F0' };
    case 'follow':
      return { name: 'person-add', color: '#00C9A7' };
    case 'tag':
      return { name: 'pricetag', color: '#FF9F1C' };
    case 'mention':
      return { name: 'at', color: '#A855F7' };
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
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const profile = await sb.auth.getUser();
    const uid = profile?.data?.user?.id;
    if (!uid) return;

    const data = await getNotifications(uid);
    setNotifications(data);
    setLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  const markAsRead = async (id: string) => {
    await sb.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    );
  };

  const markAllAsRead = async () => {
    await sb.from('notifications').update({ read_at: new Date().toISOString() });
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
    );
  };

  const remove = async (id: string) => {
    await sb.from('notifications').delete().eq('id', id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleTap = (n: any) => {
    if (!n.read_at) void markAsRead(n.id);

    const conn = {
      userId: n.actor_id,
      user: n.actor_username,
      img: n.actor_avatar_url || '',
    };

    if (n.type === 'follow') {
      onProfilePress?.(conn);
    } else if (n.post_id) {
      onPostPress?.(n.post_id);
    } else {
      onProfilePress?.(conn);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read_at).length;

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
              onLongPress={() => remove(item.id)}
              style={[styles.row, !item.read_at && styles.rowUnread]}
            >
              {/* Avatar */}
              {item.actor_avatar_url ? (
                <Image
                  source={{ uri: item.actor_avatar_url }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.avatarInitials}>
                    {item.actor_username?.slice(0, 2)?.toUpperCase()}
                  </Text>
                </View>
              )}

              {/* Text */}
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.line} numberOfLines={2}>
                  <Text style={styles.actor}>{item.actor_username}</Text>{' '}
                  <Text style={styles.action}>{actionText(item)}</Text>
                </Text>

                <Text style={styles.timestamp}>
                  {timeAgo(item.created_at)}
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
