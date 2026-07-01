import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { T, IC } from '../../constants/theme';
import { Avatar } from '../../components/Avatar';
import { CONNS } from '../../data/users';
import { ViewProfileContext } from '../../context/ViewProfileContext';

export function FollowerList({ type, username, onClose }: { type: 'followers' | 'following'; username: string; onClose: () => void }) {
  const [search, setSearch] = useState('');
  const [followState, setFollowState] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    CONNS.forEach(c => { init[c.user] = c.following; });
    return init;
  });
  const { openProfile } = useContext(ViewProfileContext);

  // Simulate followers/following lists based on CONNS data
  const list = type === 'following'
    ? CONNS.filter(c => c.following)
    : CONNS; // All connections as "followers" for demo

  const filtered = search.trim()
    ? list.filter(c => c.user.toLowerCase().includes(search.toLowerCase()) || c.car.toLowerCase().includes(search.toLowerCase()))
    : list;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 14, paddingVertical: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: T.card, borderRadius: 12, borderWidth: 1, borderColor: T.bd, paddingHorizontal: 12, paddingVertical: 8, gap: 8 }}>
          <Ionicons name="search-outline" size={IC.inline} color={T.mu} />
          <TextInput
            style={{ flex: 1, color: T.tx, fontSize: 14 }}
            value={search}
            onChangeText={setSearch}
            placeholder="Search..."
            placeholderTextColor={T.mu}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close" size={IC.inline} color={T.mu} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={c => c.userId}
        renderItem={({ item: c }) => {
          const isFollowing = followState[c.user] ?? false;
          return (
            <TouchableOpacity
              onPress={() => { onClose(); setTimeout(() => openProfile(c), 300); }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: T.bd }}
            >
              <Avatar initials={c.av} size={44} ring img={c.img} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: T.tx }}>{c.user}</Text>
                <Text style={{ fontSize: 12, color: T.mu, marginTop: 2 }}>{c.car}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setFollowState(prev => ({ ...prev, [c.user]: !prev[c.user] }))}
                style={{
                  paddingHorizontal: 14, paddingVertical: 6,
                  backgroundColor: isFollowing ? T.card2 : T.accent,
                  borderWidth: 1, borderColor: isFollowing ? T.bd : T.accent,
                  borderRadius: 20,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: isFollowing ? T.tx2 : '#051210' }}>
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 40 }}>
            <Ionicons name="people-outline" size={40} color={T.mu} />
            <Text style={{ fontSize: 14, color: T.mu, marginTop: 10 }}>No users found</Text>
          </View>
        }
      />
    </View>
  );
}
