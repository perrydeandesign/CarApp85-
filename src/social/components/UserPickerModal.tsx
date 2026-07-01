import React, { useMemo, useState } from 'react';
import {
  Modal,
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export type PickableUser = {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  initials?: string;
};

type Props = {
  visible: boolean;
  title?: string;
  users: PickableUser[];
  selectedUsernames: string[];
  onClose: () => void;
  onConfirm: (usernames: string[]) => void;
};

export const UserPickerModal: React.FC<Props> = ({
  visible,
  title = 'Tag people',
  users,
  selectedUsernames,
  onClose,
  onConfirm,
}) => {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>(selectedUsernames);

  // Reset selection state every time the modal re-opens.
  React.useEffect(() => {
    if (visible) setSelected(selectedUsernames);
  }, [visible, selectedUsernames]);

  const q = query.toLowerCase().trim();
  const filtered = useMemo(() => {
    if (!q) return users;
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        (u.displayName && u.displayName.toLowerCase().includes(q)),
    );
  }, [users, q]);

  const toggle = (username: string) => {
    setSelected((prev) =>
      prev.includes(username) ? prev.filter((u) => u !== username) : [...prev, username],
    );
  };

  const handleDone = () => {
    onConfirm(selected);
    setQuery('');
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="close" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={handleDone}>
            <Text style={styles.done}>Done</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#C9D1D9" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search"
            placeholderTextColor="#666"
            style={styles.searchInput}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>

        {selected.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {selected.map((u) => (
              <TouchableOpacity key={u} onPress={() => toggle(u)} style={styles.chip}>
                <Text style={styles.chipText}>@{u}</Text>
                <Ionicons name="close" size={14} color="#fff" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : null}

        <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
          {filtered.map((u) => {
            const isSelected = selected.includes(u.username);
            return (
              <TouchableOpacity
                key={u.id}
                style={styles.row}
                onPress={() => toggle(u.username)}
              >
                {u.avatarUrl ? (
                  <Image source={{ uri: u.avatarUrl }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.avatarFallback]}>
                    <Text style={styles.avatarInitials}>{u.initials ?? u.username.slice(0, 2).toUpperCase()}</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.username}>{u.username}</Text>
                  {u.displayName ? <Text style={styles.displayName}>{u.displayName}</Text> : null}
                </View>
                <Ionicons
                  name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  color={isSelected ? '#00C9A7' : '#555'}
                />
              </TouchableOpacity>
            );
          })}
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No users found</Text>
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#05070B' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1A1F2A',
  },
  title: { color: '#fff', fontWeight: '700', fontSize: 16 },
  done: { color: '#3897F0', fontWeight: '700', fontSize: 15 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#11141C',
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
    padding: 0,
  },
  chipsRow: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0E5C4F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  chipText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1F2A',
  },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { color: '#C9D1D9', fontWeight: '700', fontSize: 13 },
  username: { color: '#fff', fontSize: 14, fontWeight: '600' },
  displayName: { color: '#C9D1D9', fontSize: 12, marginTop: 2 },
  empty: { padding: 24, alignItems: 'center' },
  emptyText: { color: '#C9D1D9' },
});
