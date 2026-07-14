import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { T, IC } from '../../constants/theme';
import { Button } from '../../ui/Button';
import type { GroupPrivacy } from '../../constants/types';

type Props = {
  onBack: () => void;
  onCreate: (name: string, description: string, privacy: GroupPrivacy) => Promise<string | null>;
};

export function CreateGroupScreen({ onBack, onCreate }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<GroupPrivacy>('public');
  const [creating, setCreating] = useState(false);

  const canCreate = name.trim().length >= 3;

  const handleCreate = async () => {
    if (!canCreate || creating) return;
    setCreating(true);
    const id = await onCreate(name.trim(), description.trim() || 'A new car community group.', privacy);
    setCreating(false);
    if (id) onBack(); // new group now appears live in the list
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: T.bd }}>
        <TouchableOpacity onPress={onBack} style={{ marginRight: 12 }}>
          <Ionicons name="chevron-back" size={IC.back} color={T.ac} />
        </TouchableOpacity>
        <Text style={{ color: T.tx, fontSize: 18, fontWeight: '700', flex: 1 }}>Create Group</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Banner Preview */}
        <View style={{ height: 120, backgroundColor: T.card, borderRadius: 12, overflow: 'hidden', marginBottom: 20, alignItems: 'center', justifyContent: 'center' }}>
          <Image source={{ uri: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=400&fit=crop' }} style={{ ...StyleSheet.absoluteFill }} resizeMode="cover" />
          <View style={{ ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.4)' }} />
          <Ionicons name="camera-outline" size={28} color="rgba(255,255,255,0.7)" />
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 4 }}>Tap to change banner</Text>
        </View>

        {/* Group Name */}
        <Text style={{ color: T.tx2, fontSize: 13, fontWeight: '600', marginBottom: 6 }}>Group Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. JDM Legends Melbourne"
          placeholderTextColor={T.mu}
          style={{ backgroundColor: T.card, color: T.tx, fontSize: 15, padding: 12, borderRadius: 10, marginBottom: 16 }}
          maxLength={50}
        />

        {/* Description */}
        <Text style={{ color: T.tx2, fontSize: 13, fontWeight: '600', marginBottom: 6 }}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="What's this group about?"
          placeholderTextColor={T.mu}
          multiline
          numberOfLines={3}
          style={{ backgroundColor: T.card, color: T.tx, fontSize: 14, padding: 12, borderRadius: 10, marginBottom: 16, minHeight: 80, textAlignVertical: 'top' }}
          maxLength={200}
        />

        {/* Privacy */}
        <Text style={{ color: T.tx2, fontSize: 13, fontWeight: '600', marginBottom: 10 }}>Privacy</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
          {(['public', 'private'] as GroupPrivacy[]).map(p => {
            const active = privacy === p;
            return (
              <TouchableOpacity
                key={p}
                onPress={() => setPrivacy(p)}
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 10, backgroundColor: active ? T.accentDim : T.card, borderWidth: 1, borderColor: active ? T.ac : T.bd }}
              >
                <Ionicons name={p === 'public' ? 'globe-outline' : 'lock-closed-outline'} size={18} color={active ? T.ac : T.mu} />
                <View>
                  <Text style={{ color: active ? T.ac : T.tx, fontSize: 13, fontWeight: '600' }}>{p === 'public' ? 'Public' : 'Private'}</Text>
                  <Text style={{ color: T.mu, fontSize: 10 }}>{p === 'public' ? 'Anyone can join' : 'Invite only'}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Create Button */}
        <Button
          label="Create Group"
          variant="primary"
          size="lg"
          fullWidth
          loading={creating}
          disabled={!canCreate}
          onPress={handleCreate}
        />
      </ScrollView>
    </View>
  );
}
