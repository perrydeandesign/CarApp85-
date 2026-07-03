import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { Collection } from '../../social/hooks/useCollections';
import { SAVED_DEFAULT_COLLECTION_ID } from '../../social/hooks/useCollections';

type Props = {
  visible: boolean;
  collections: Collection[];
  isSaved: boolean;
  onClose: () => void;
  onToggleQuickSave: () => void;
  onAddToCollection: (collectionId: string) => void;
  onCreateCollection: (name: string) => Collection;
  isInCollection: (collectionId: string) => boolean;
};

export const SaveToSheet: React.FC<Props> = ({
  visible,
  collections,
  isSaved,
  onClose,
  onToggleQuickSave,
  onAddToCollection,
  onCreateCollection,
  isInCollection,
}) => {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  const reset = () => {
    setShowCreate(false);
    setNewName('');
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    const col = onCreateCollection(newName);
    onAddToCollection(col.id);
    reset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => {
        reset();
        onClose();
      }}
    >
      <TouchableWithoutFeedback onPress={() => { reset(); onClose(); }}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetWrap}
      >
        <View style={styles.sheet}>
          <View style={styles.grabber} />

          <View style={styles.headerRow}>
            <Text style={styles.title}>Save to…</Text>
            <TouchableOpacity onPress={() => { reset(); onClose(); }}>
              <Ionicons name="close" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.row} onPress={onToggleQuickSave}>
            <View style={styles.thumbDefault}>
              <Ionicons name="bookmark" size={20} color="#fff" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Saved</Text>
              <Text style={styles.rowSubtitle}>Private</Text>
            </View>
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={isSaved ? '#00C9A7' : '#F0F6FC'}
            />
          </TouchableOpacity>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Collections</Text>
            <TouchableOpacity onPress={() => setShowCreate((v) => !v)}>
              <Text style={styles.newLink}>New collection</Text>
            </TouchableOpacity>
          </View>

          {showCreate ? (
            <View style={styles.createRow}>
              <TextInput
                value={newName}
                onChangeText={setNewName}
                placeholder="Collection name"
                placeholderTextColor="#666"
                style={styles.input}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleCreate}
              />
              <TouchableOpacity onPress={handleCreate} style={styles.createBtn}>
                <Text style={styles.createBtnText}>Create</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
            {collections
              .filter((c) => c.id !== SAVED_DEFAULT_COLLECTION_ID)
              .map((c) => {
                const inCol = isInCollection(c.id);
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={styles.row}
                    onPress={() => onAddToCollection(c.id)}
                  >
                    <View style={styles.thumb}>
                      <Ionicons name="folder-outline" size={20} color="#fff" />
                    </View>
                    <View style={styles.rowText}>
                      <Text style={styles.rowTitle}>{c.name}</Text>
                      <Text style={styles.rowSubtitle}>
                        {c.isPrivate ? 'Private' : 'Public'}
                      </Text>
                    </View>
                    <Ionicons
                      name={inCol ? 'checkmark-circle' : 'add-circle-outline'}
                      size={22}
                      color={inCol ? '#00C9A7' : '#F0F6FC'}
                    />
                  </TouchableOpacity>
                );
              })}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheetWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#161B22',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingBottom: 24,
    maxHeight: '80%',
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#333',
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  title: { color: '#F0F6FC', fontSize: 17, fontWeight: '700' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#21262D',
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#21262D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  thumbDefault: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#1F2A33',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowText: { flex: 1 },
  rowTitle: { color: '#F0F6FC', fontWeight: '600', fontSize: 15 },
  rowSubtitle: { color: '#C9D1D9', fontSize: 12, marginTop: 2 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  sectionTitle: { color: '#F0F6FC', fontSize: 15, fontWeight: '700' },
  newLink: { color: '#00C9A7', fontSize: 14, fontWeight: '600' },
  createRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  input: {
    flex: 1,
    color: '#F0F6FC',
    borderWidth: 1,
    borderColor: '#21262D',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  createBtn: {
    marginLeft: 8,
    backgroundColor: '#00C9A7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createBtnText: { color: '#F0F6FC', fontWeight: '700' },
  list: { maxHeight: 320 },
});
