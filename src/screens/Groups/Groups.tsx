import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, TextInput } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { T, IC } from '../../constants/theme';
import type { Group } from '../../constants/types';
import { GROUPS } from '../../data/groups';
import { CreateGroupScreen } from './CreateGroup';
import { GroupDetailScreen } from './GroupDetail';

type GroupsSection = 'mygroups' | 'activity';

export function GroupsTab() {
  const [groups, setGroups] = useState<Group[]>(GROUPS);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [section, setSection] = useState<GroupsSection>('mygroups');
  const [pinned, setPinned] = useState<Record<string, boolean>>({});

  // Stack navigation: Create > Detail > List
  if (showCreate) {
    return (
      <CreateGroupScreen
        onBack={() => setShowCreate(false)}
        onCreated={(g) => {
          setGroups(prev => [g, ...prev]);
          setShowCreate(false);
          setSelectedGroup(g);
        }}
      />
    );
  }

  if (selectedGroup) {
    return <GroupDetailScreen group={selectedGroup} onBack={() => setSelectedGroup(null)} />;
  }

  const filtered = search
    ? groups.filter(g => g.name.toLowerCase().includes(search.toLowerCase()))
    : groups;

  const myGroups = filtered.filter(g => g.members.some(m => m.id === 'jake'));
  const discoverGroups = filtered.filter(g => !g.members.some(m => m.id === 'jake'));

  // Sort: pinned first
  const sortedMyGroups = [...myGroups].sort((a, b) => {
    const ap = pinned[a.id] ? 1 : 0;
    const bp = pinned[b.id] ? 1 : 0;
    return bp - ap;
  });

  // Activity feed: recent posts from all my groups
  const activityFeed = myGroups
    .flatMap(g => g.posts.map(p => ({ ...p, groupName: g.name, groupIcon: g.iconUrl, groupId: g.id })))
    .sort((a, b) => b.createdAt - a.createdAt);

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}d`;
  };

  const sectionTabs: { key: GroupsSection; label: string }[] = [
    { key: 'mygroups', label: 'My Groups' },
    { key: 'activity', label: 'Activity' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <ScrollView style={{ flex: 1 }}>
        {/* Search + Create */}
        <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: T.card, borderRadius: 10, paddingHorizontal: 12, height: 38 }}>
            <Ionicons name="search" size={IC.inline} color={T.mu} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search groups..."
              placeholderTextColor={T.mu}
              style={{ flex: 1, color: T.tx, fontSize: 14, marginLeft: 8, padding: 0 }}
            />
          </View>
          <TouchableOpacity onPress={() => setShowCreate(true)} style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: T.ac, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="add" size={22} color={T.bg} />
          </TouchableOpacity>
        </View>

        {/* Section Tabs */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginBottom: 4, borderBottomWidth: 1, borderBottomColor: T.bd }}>
          {sectionTabs.map(s => {
            const active = section === s.key;
            return (
              <TouchableOpacity key={s.key} onPress={() => setSection(s.key)} style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: active ? T.ac : 'transparent' }}>
                <Text style={{ color: active ? T.ac : T.wh, fontSize: 13, fontWeight: '600' }}>{s.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── My Groups ── */}
        {section === 'mygroups' && (
          <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
            {sortedMyGroups.length === 0 && <Text style={{ color: T.wh, fontSize: 13, marginBottom: 12 }}>You haven't joined any groups yet.</Text>}
            {sortedMyGroups.map(g => {
              const isPinned = !!pinned[g.id];
              return (
                <View key={g.id} style={{ flexDirection: 'row', gap: 12, marginBottom: 14, alignItems: 'center' }}>
                  <TouchableOpacity onPress={() => setPinned(prev => ({ ...prev, [g.id]: !prev[g.id] }))} style={{ width: 28, alignItems: 'center' }}>
                    <Ionicons name={isPinned ? 'star' : 'star-outline'} size={18} color={isPinned ? '#FBBF24' : T.wh} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setSelectedGroup(g)} style={{ flex: 1, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                    <Image source={{ uri: g.iconUrl }} style={{ width: 48, height: 48, borderRadius: 10 }} resizeMode="cover" />
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={{ color: T.tx, fontSize: 14, fontWeight: '600' }}>{g.name}</Text>
                        {isPinned && <Ionicons name="pin" size={10} color={T.ac} />}
                      </View>
                      <Text style={{ color: T.tx2, fontSize: 12, marginTop: 2 }}>{g.members.length} members · {g.posts.length} posts</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={IC.inline} color={T.wh} />
                  </TouchableOpacity>
                </View>
              );
            })}

            {/* Discover Groups — wide tiles below My Groups */}
            {discoverGroups.length > 0 && (
              <View style={{ marginTop: 16 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: T.wh, marginBottom: 12 }}>Discover</Text>
                {discoverGroups.map(g => (
                  <TouchableOpacity key={g.id} onPress={() => setSelectedGroup(g)} style={{ backgroundColor: T.card, borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
                    <Image source={{ uri: g.bannerUrl }} style={{ width: '100%', height: 100 }} resizeMode="cover" />
                    <View style={{ padding: 12 }}>
                      <Text style={{ color: T.wh, fontSize: 14, fontWeight: '600' }}>{g.name}</Text>
                      <Text style={{ color: T.tx2, fontSize: 12, marginTop: 2 }}>{g.members.length} members · {g.privacy === 'private' ? 'Private' : 'Public'}</Text>
                      <Text style={{ color: T.wh, fontSize: 12, marginTop: 6 }} numberOfLines={2}>{g.description}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ── Activity ── */}
        {section === 'activity' && (
          <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
            {activityFeed.length === 0 && (
              <View style={{ alignItems: 'center', marginTop: 40 }}>
                <Ionicons name="pulse-outline" size={40} color={T.bd} />
                <Text style={{ color: T.mu, fontSize: 14, marginTop: 10 }}>No recent activity</Text>
              </View>
            )}
            {activityFeed.map(p => (
              <View key={p.id} style={{ backgroundColor: T.card, borderRadius: 12, padding: 14, marginBottom: 12 }}>
                {/* Group tag */}
                <TouchableOpacity onPress={() => { const g = groups.find(gg => gg.id === p.groupId); if (g) setSelectedGroup(g); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Image source={{ uri: p.groupIcon }} style={{ width: 20, height: 20, borderRadius: 4 }} />
                  <Text style={{ color: T.ac, fontSize: 11, fontWeight: '600' }}>{p.groupName}</Text>
                </TouchableOpacity>
                {/* Post author */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  {p.avatar ? (
                    <Image source={{ uri: p.avatar }} style={{ width: 32, height: 32, borderRadius: 16 }} />
                  ) : (
                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: T.card2, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: T.mu, fontSize: 12, fontWeight: '700' }}>{p.username.slice(0, 2)}</Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: T.tx, fontSize: 13, fontWeight: '600' }}>{p.username}</Text>
                    <Text style={{ color: T.tx2, fontSize: 11 }}>{formatTime(p.createdAt)}</Text>
                  </View>
                </View>
                <Text style={{ color: T.wh, fontSize: 13, lineHeight: 19, marginBottom: p.photos.length > 0 ? 10 : 0 }}>{p.caption}</Text>
                {p.photos.length > 0 && (
                  <Image source={{ uri: p.photos[0] }} style={{ width: '100%', height: 180, borderRadius: 8 }} resizeMode="cover" />
                )}
                <View style={{ flexDirection: 'row', gap: 16, marginTop: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="heart-outline" size={IC.actionSm} color={T.wh} />
                    <Text style={{ color: T.wh, fontSize: 12 }}>{p.likes}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="chatbubble-outline" size={IC.actionSm} color={T.wh} />
                    <Text style={{ color: T.wh, fontSize: 12 }}>{p.comments}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}
