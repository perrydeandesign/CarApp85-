import React, { useContext, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { T, IC, SCREEN_W } from '../../constants/theme';
import { Button } from '../../ui/Button';
import type { Group } from '../../constants/types';
import { ViewProfileContext } from '../../context/ViewProfileContext';

type Props = {
  group: Group;
  onBack: () => void;
  meId?: string | null;
  onJoin?: (groupId: string) => void;
  onLeave?: (groupId: string) => void;
};

export function GroupDetailScreen({ group, onBack, meId, onJoin, onLeave }: Props) {
  const [activeSection, setActiveSection] = useState<'posts' | 'events' | 'gallery' | 'members'>('posts');
  const [joined, setJoined] = useState(!!meId && group.members.some(m => m.id === meId));
  const { openProfile } = useContext(ViewProfileContext);

  const openUserProfile = (username: string) => {
    // Profile resolves the rest live by username.
    openProfile({ user: username, username });
  };

  const toggleJoin = () => {
    const next = !joined;
    setJoined(next);
    if (next) onJoin?.(group.id);
    else onLeave?.(group.id);
  };

  const sections: { key: typeof activeSection; label: string }[] = [
    { key: 'posts', label: 'Posts' },
    { key: 'events', label: 'Events' },
    { key: 'gallery', label: 'Gallery' },
    { key: 'members', label: 'Members' },
  ];

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}d`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <ScrollView style={{ flex: 1 }}>
        {/* Banner */}
        <View style={{ height: 160, backgroundColor: T.card }}>
          <Image source={{ uri: group.bannerUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          <View style={{ ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.3)' }} />
          <TouchableOpacity onPress={onBack} style={{ position: 'absolute', top: 50, left: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="chevron-back" size={IC.back} color={T.wh} />
          </TouchableOpacity>
        </View>

        {/* Group Info */}
        <View style={{ paddingHorizontal: 16, marginTop: -30 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
            <Image source={{ uri: group.iconUrl }} style={{ width: 60, height: 60, borderRadius: 12, borderWidth: 3, borderColor: T.bg }} resizeMode="cover" />
            <View style={{ flex: 1, paddingBottom: 4 }}>
              <Text style={{ color: T.tx, fontSize: 18, fontWeight: '700' }}>{group.name}</Text>
              <Text style={{ color: T.mu, fontSize: 12 }}>{group.members.length} members · {group.privacy === 'private' ? 'Private' : 'Public'}</Text>
            </View>
          </View>
          <Text style={{ color: T.tx2, fontSize: 13, marginTop: 10, lineHeight: 19 }}>{group.description}</Text>
          <Button
            label={joined ? 'Joined' : 'Join Group'}
            variant={joined ? 'secondary' : 'primary'}
            size="md"
            fullWidth
            onPress={toggleJoin}
            style={{ marginTop: 12 }}
          />
        </View>

        {/* Section Tabs */}
        <View style={{ flexDirection: 'row', marginTop: 16, borderBottomWidth: 1, borderBottomColor: T.bd, paddingHorizontal: 16 }}>
          {sections.map(s => {
            const active = activeSection === s.key;
            return (
              <TouchableOpacity key={s.key} onPress={() => setActiveSection(s.key)} style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: active ? T.ac : 'transparent' }}>
                <Text style={{ color: active ? T.ac : T.mu, fontSize: 13, fontWeight: '600' }}>{s.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Posts Section */}
        {activeSection === 'posts' && (
          <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
            {group.posts.length === 0 && <Text style={{ color: T.mu, textAlign: 'center', marginTop: 20 }}>No posts yet.</Text>}
            {group.posts.map(p => (
              <View key={p.id} style={{ backgroundColor: T.card, borderRadius: 12, padding: 14, marginBottom: 12 }}>
                <TouchableOpacity onPress={() => openUserProfile(p.username)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  {p.avatar ? (
                    <Image source={{ uri: p.avatar }} style={{ width: 32, height: 32, borderRadius: 16 }} />
                  ) : (
                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: T.card2, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: T.mu, fontSize: 12, fontWeight: '700' }}>{p.username.slice(0, 2)}</Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: T.tx, fontSize: 13, fontWeight: '600' }}>{p.username}</Text>
                    <Text style={{ color: T.mu, fontSize: 11 }}>{formatTime(p.createdAt)}</Text>
                  </View>
                </TouchableOpacity>
                <Text style={{ color: T.tx2, fontSize: 13, lineHeight: 19, marginBottom: p.photos.length > 0 ? 10 : 0 }}>{p.caption}</Text>
                {p.photos.length > 0 && (
                  <Image source={{ uri: p.photos[0] }} style={{ width: '100%', height: 180, borderRadius: 8 }} resizeMode="cover" />
                )}
                <View style={{ flexDirection: 'row', gap: 16, marginTop: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="heart-outline" size={IC.actionSm} color={T.mu} />
                    <Text style={{ color: T.mu, fontSize: 12 }}>{p.likes}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="chatbubble-outline" size={IC.actionSm} color={T.mu} />
                    <Text style={{ color: T.mu, fontSize: 12 }}>{p.comments}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Events Section */}
        {activeSection === 'events' && (
          <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
            {group.events.length === 0 && <Text style={{ color: T.mu, textAlign: 'center', marginTop: 20 }}>No upcoming events.</Text>}
            {group.events.map(e => (
              <View key={e.id} style={{ backgroundColor: T.card, borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
                <Image source={{ uri: e.bannerUrl }} style={{ width: '100%', height: 120 }} resizeMode="cover" />
                <View style={{ padding: 14 }}>
                  <Text style={{ color: T.tx, fontSize: 15, fontWeight: '700' }}>{e.title}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                    <Ionicons name="calendar-outline" size={IC.badge} color={T.ac} />
                    <Text style={{ color: T.tx2, fontSize: 12 }}>{e.date} · {e.time}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <Ionicons name="location-outline" size={IC.badge} color={T.ac} />
                    <Text style={{ color: T.tx2, fontSize: 12 }}>{e.location}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                    {e.attendees.slice(0, 4).map((a, i) => (
                      <TouchableOpacity key={a.id} onPress={() => openUserProfile(a.username)} style={{ marginLeft: i > 0 ? -8 : 0 }}>
                        {a.avatar ? (
                          <Image source={{ uri: a.avatar }} style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: T.card }} />
                        ) : (
                          <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: T.card2, borderWidth: 2, borderColor: T.card, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ color: T.mu, fontSize: 8 }}>{a.username.slice(0, 2)}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                    <Text style={{ color: T.mu, fontSize: 11, marginLeft: 6 }}>{e.attendees.length} going</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Gallery Section */}
        {activeSection === 'gallery' && (
          <View style={{ paddingTop: 4 }}>
            {group.gallery.length === 0 && <Text style={{ color: T.mu, textAlign: 'center', marginTop: 20 }}>No photos yet.</Text>}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}>
              {group.gallery.map(g => {
                const tileSize = (SCREEN_W - 4) / 3;
                return (
                  <Image key={g.id} source={{ uri: g.url }} style={{ width: tileSize, height: tileSize }} resizeMode="cover" />
                );
              })}
            </View>
          </View>
        )}

        {/* Members Section */}
        {activeSection === 'members' && (
          <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
            {group.members.map(m => (
              <TouchableOpacity key={m.id} onPress={() => openUserProfile(m.username)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: T.bd }}>
                {m.avatar ? (
                  <Image source={{ uri: m.avatar }} style={{ width: 40, height: 40, borderRadius: 20 }} />
                ) : (
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: T.card2, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: T.mu, fontWeight: '700' }}>{m.username.slice(0, 2)}</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={{ color: T.tx, fontSize: 14, fontWeight: '600' }}>{m.username}</Text>
                  <Text style={{ color: T.mu, fontSize: 12 }}>{m.carModel}</Text>
                </View>
                {m.role === 'admin' && (
                  <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, backgroundColor: T.accentDim }}>
                    <Text style={{ color: T.ac, fontSize: 10, fontWeight: '700' }}>ADMIN</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}
