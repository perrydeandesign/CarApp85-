import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { T, IC } from '../../constants/theme';
import { Avatar } from '../../components/Avatar';
import { ErrorState } from '../../components/ErrorState';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SearchBar } from '../../components/SearchBar';
import { useGoHome } from '../../context/GoHomeContext';

// NEW DATA LAYER IMPORTS
import { sb, getConversations, getMessages } from '../../lib/data';
import { getLastReadMap } from '../../lib/readState';

export function ConversationListScreen({ navigation }: any) {
  const goHome = useGoHome();

  const [conversations, setConversations] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'groups'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ------------------------------------------------------------
  // LOAD CONVERSATIONS FROM SUPABASE
  // ------------------------------------------------------------
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const session = await sb.auth.getSession();
      const uid = session?.data?.session?.user?.id;
      if (!uid) {
        setLoading(false);
        return;
      }

      const convos = await getConversations(uid);
      // Local read-state (no server-side read tracking exists).
      const lastRead = await getLastReadMap();

      // Attach last message + unread count
      const enriched = await Promise.all(
        convos.map(async (c) => {
          const msgs = await getMessages(c.id);
          const last = msgs[msgs.length - 1] || null;
          // Unread = messages from someone else newer than my last open of this chat.
          const seenAt = lastRead[c.id];
          const unread = msgs.filter(
            (m) => m.sender_id !== uid && (!seenAt || m.created_at > seenAt),
          ).length;

          return {
            ...c,
            lastMessage: last,
            unreadCount: unread,
          };
        })
      );

      setConversations(enriched);
    } catch (e: any) {
      setError(e?.message ?? 'Could not load conversations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ------------------------------------------------------------
  // DELETE CONVERSATION
  // ------------------------------------------------------------
  const deleteConversation = (id: string) => {
    Alert.alert('Delete conversation?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await sb.from('conversations').delete().eq('id', id);
          setConversations((p) => p.filter((c) => c.id !== id));
        },
      },
    ]);
  };

  // ------------------------------------------------------------
  // FILTER + SEARCH
  // ------------------------------------------------------------
  const filtered = conversations.filter((c) => {
    const last = c.lastMessage;
    const matchSearch =
      !search ||
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      (last && last.body.toLowerCase().includes(search.toLowerCase()));

    if (filter === 'unread') return matchSearch && c.unreadCount > 0;
    if (filter === 'groups') return matchSearch && c.participants?.length > 2;

    return matchSearch;
  });

  // ------------------------------------------------------------
  // RENDER ROW
  // ------------------------------------------------------------
  const renderItem = ({ item }: any) => {
    const last = item.lastMessage;
    const unread = item.unreadCount;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('Chat', { conversationId: item.id })}
        onLongPress={() => deleteConversation(item.id)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 14,
          borderBottomWidth: 1,
          borderBottomColor: T.bd,
        }}
      >
        <Avatar
          initials={(item.title || 'C').slice(0, 1).toUpperCase()}
          size={48}
          img={item.avatar_url || undefined}
        />

        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text
              style={{ color: T.tx, fontWeight: '600', fontSize: 15 }}
              numberOfLines={1}
            >
              {item.title || 'Conversation'}
            </Text>

            {last && (
              <Text style={{ color: T.mu, fontSize: 11 }}>
                {new Date(last.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            )}
          </View>

          {last && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <Text
                style={{ color: T.mu, fontSize: 13, flex: 1 }}
                numberOfLines={1}
              >
                {last.body}
              </Text>

              {unread > 0 && (
                <View
                  style={{
                    backgroundColor: T.ac,
                    borderRadius: 10,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    marginLeft: 8,
                  }}
                >
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: '700',
                    }}
                  >
                    {unread}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------
  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'groups', label: 'Groups' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      {/* HEADER */}
      <ScreenHeader
        title="Messages"
        onBack={goHome}
        right={
          <TouchableOpacity onPress={() => navigation.navigate('NewConversation')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="create-outline" size={IC.nav} color={T.accent} />
          </TouchableOpacity>
        }
      />

      {/* SEARCH */}
      <View style={{ paddingHorizontal: 14, paddingVertical: 8 }}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search messages..."
        />
      </View>

      {/* FILTER TABS */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 14, marginBottom: 4 }}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setFilter(t.key as any)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 16,
              marginRight: 8,
              backgroundColor: filter === t.key ? T.ac : T.cd2,
            }}
          >
            <Text
              style={{
                color: filter === t.key ? '#fff' : T.mu,
                fontSize: 13,
                fontWeight: '600',
              }}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ERROR / LOADING / LIST */}
      {error ? (
        <ErrorState title="Couldn't load messages" message={error} onRetry={load} />
      ) : loading ? (
        <ActivityIndicator color={T.accent} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={{ color: T.mu, textAlign: 'center', marginTop: 40 }}>
              No conversations
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}
