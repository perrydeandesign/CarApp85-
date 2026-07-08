import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { T, IC } from '../../constants/theme';
import { Avatar } from '../../components/Avatar';
import { SearchBar } from '../../components/SearchBar';

// NEW DATA LAYER IMPORTS
import { sb, getSuggestedProfiles } from '../../lib/data';
import { TABLES } from '../../data/tables';

export function NewConversationScreen({ navigation }: any) {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  // ------------------------------------------------------------
  // LOAD SUGGESTED PROFILES
  // ------------------------------------------------------------
  const load = useCallback(async () => {
    const session = await sb.auth.getSession();
    const uid = session?.data?.session?.user?.id;
    if (!uid) return;

    const list = await getSuggestedProfiles(uid);
    setProfiles(list);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ------------------------------------------------------------
  // START A NEW CONVERSATION
  // ------------------------------------------------------------
  const startConversation = async (profile: any) => {
    const session = await sb.auth.getSession();
    const uid = session?.data?.session?.user?.id;
    if (!uid) return;

    // 1. Check if conversation already exists
    const { data: existing } = await sb
      .from(TABLES.conversationMembers)
      .select('conversation_id')
      .eq('profile_id', uid);

    if (existing && existing.length > 0) {
      const convoIds = existing.map((e: { conversation_id: string }) => e.conversation_id);

      const { data: shared } = await sb
        .from(TABLES.conversationMembers)
        .select('conversation_id')
        .eq('profile_id', profile.id)
        .in('conversation_id', convoIds);

      if (shared && shared.length > 0) {
        const existingId = shared[0].conversation_id;
        navigation.replace('Chat', { conversationId: existingId });
        return;
      }
    }

    // 2. Create new conversation
    const { data: convo, error: convoErr } = await sb
      .from('conversations')
      .insert({ title: null })
      .select()
      .single();

    if (convoErr) {
      console.error('create conversation error', convoErr.message);
      return;
    }

    // 3. Add participants
    await sb.from(TABLES.conversationMembers).insert([
      { conversation_id: convo.id, profile_id: uid },
      { conversation_id: convo.id, profile_id: profile.id },
    ]);

    // 4. Navigate to chat
    navigation.replace('Chat', { conversationId: convo.id });
  };

  // ------------------------------------------------------------
  // FILTER PROFILES
  // ------------------------------------------------------------
  const filtered = profiles.filter((p) =>
    p.username.toLowerCase().includes(search.toLowerCase())
  );

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      {/* HEADER */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 14,
          borderBottomWidth: 1,
          borderBottomColor: T.bd,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginRight: 12 }}
        >
          <Ionicons name="chevron-back" size={IC.back} color={T.ac} />
        </TouchableOpacity>

        <Text style={{ color: T.tx, fontSize: 20, fontWeight: '700' }}>
          New Message
        </Text>
      </View>

      {/* SEARCH */}
      <View style={{ paddingHorizontal: 14, paddingVertical: 8 }}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search people..."
        />
      </View>

      {/* LIST */}
      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => startConversation(item)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 14,
              borderBottomWidth: 1,
              borderBottomColor: T.bd,
            }}
          >
            <Avatar
              initials={item.username?.[0]?.toUpperCase()}
              size={44}
              img={item.avatar_url}
            />

            <View style={{ marginLeft: 12 }}>
              <Text
                style={{
                  color: T.tx,
                  fontWeight: '600',
                  fontSize: 15,
                }}
              >
                {item.username}
              </Text>

              <Text style={{ color: T.mu, fontSize: 12 }}>
                {item.location || 'Online'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
