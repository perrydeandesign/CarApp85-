import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  Modal,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useCollections } from '../../social/hooks/useCollections';
import { SAVED_DEFAULT_COLLECTION_ID } from '../../social/hooks/useCollections';
import { MOCK_POSTS_V2, type Post } from '../../social/data/posts';
import { CollectionDetailScreen } from './CollectionDetailScreen';

type Props = {
  onBack: () => void;
};

export const SavedCollectionsScreen: React.FC<Props> = ({ onBack }) => {
  const {
    collections,
    savedPostIds,
    createCollection,
    deleteCollection,
    removeFromCollection,
    unsavePost,
  } = useCollections();

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [openCollectionId, setOpenCollectionId] = useState<string | null>(null);

  const postsById = useMemo(() => {
    const m: Record<string, Post> = {};
    for (const p of MOCK_POSTS_V2) m[p.id] = p;
    return m;
  }, []);

  const savedPosts = useMemo(
    () => savedPostIds.map((id) => postsById[id]).filter(Boolean) as Post[],
    [savedPostIds, postsById],
  );

  const visibleCollections = collections.filter(
    (c) => c.id !== SAVED_DEFAULT_COLLECTION_ID,
  );

  const handleCreate = () => {
    if (!newName.trim()) return;
    createCollection(newName);
    setNewName('');
    setShowCreate(false);
  };

  const coverFor = (postIds: string[]) =>
    postsById[postIds[0]]?.mediaUrl ?? null;

  if (openCollectionId) {
    const col = collections.find((c) => c.id === openCollectionId);
    if (col) {
      const ids = openCollectionId === SAVED_DEFAULT_COLLECTION_ID
        ? savedPostIds
        : col.postIds;
      return (
        <CollectionDetailScreen
          name={col.name}
          postIds={ids}
          postsById={postsById}
          onBack={() => setOpenCollectionId(null)}
          onRemovePost={(postId) => {
            if (openCollectionId === SAVED_DEFAULT_COLLECTION_ID) unsavePost(postId);
            else removeFromCollection(postId, openCollectionId);
          }}
          onDeleteCollection={
            openCollectionId === SAVED_DEFAULT_COLLECTION_ID
              ? undefined
              : () => {
                  deleteCollection(openCollectionId);
                  setOpenCollectionId(null);
                }
          }
        />
      );
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView>
        <TouchableOpacity
          style={styles.savedRow}
          onPress={() => setOpenCollectionId(SAVED_DEFAULT_COLLECTION_ID)}
        >
          {savedPosts.length > 0 && savedPosts[0].mediaUrl ? (
            <Image source={{ uri: savedPosts[0].mediaUrl }} style={styles.savedCover} />
          ) : (
            <View style={[styles.savedCover, styles.coverPlaceholder]}>
              <Ionicons name="bookmark-outline" size={22} color="#fff" />
            </View>
          )}
          <View style={styles.savedTextBlock}>
            <Text style={styles.savedTitle}>Saved</Text>
            <Text style={styles.savedSubtitle}>Private</Text>
          </View>
          <Ionicons name="bookmark" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Collections</Text>
          <TouchableOpacity onPress={() => setShowCreate(true)}>
            <Text style={styles.newLink}>New collection</Text>
          </TouchableOpacity>
        </View>

        {visibleCollections.map((c) => {
          const cover = coverFor(c.postIds);
          return (
            <TouchableOpacity
              key={c.id}
              style={styles.collectionRow}
              onPress={() => setOpenCollectionId(c.id)}
            >
              {cover ? (
                <Image source={{ uri: cover }} style={styles.collectionCover} />
              ) : (
                <View style={[styles.collectionCover, styles.coverPlaceholder]}>
                  <Ionicons name="folder-outline" size={20} color="#fff" />
                </View>
              )}
              <View style={styles.collectionTextBlock}>
                <Text style={styles.collectionTitle}>{c.name}</Text>
                <Text style={styles.collectionSubtitle}>
                  {c.isPrivate ? 'Private' : 'Public'}
                </Text>
              </View>
              <Ionicons name="add-circle-outline" size={22} color="#fff" />
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 32 }} />
      </ScrollView>

      <Modal
        visible={showCreate}
        animationType="fade"
        transparent
        onRequestClose={() => setShowCreate(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New collection</Text>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="Name"
              placeholderTextColor="#666"
              style={styles.modalInput}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />
            <View style={styles.modalRow}>
              <TouchableOpacity onPress={() => { setShowCreate(false); setNewName(''); }}>
                <Text style={styles.cancelBtn}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreate}>
                <Text style={styles.confirmBtn}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1A1F2A',
  },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#0B0E14',
  },
  savedCover: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#1A1F2A',
    marginRight: 14,
  },
  savedTextBlock: { flex: 1 },
  savedTitle: { color: '#fff', fontWeight: '700', fontSize: 17 },
  savedSubtitle: { color: '#C9D1D9', marginTop: 2, fontSize: 12 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 8,
  },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  newLink: { color: '#3897F0', fontWeight: '600' },
  collectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  collectionCover: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#1A1F2A',
    marginRight: 14,
  },
  coverPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  collectionTextBlock: { flex: 1 },
  collectionTitle: { color: '#fff', fontWeight: '600', fontSize: 15 },
  collectionSubtitle: { color: '#C9D1D9', fontSize: 12, marginTop: 2 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  modalCard: {
    backgroundColor: '#0B0E14',
    borderRadius: 14,
    padding: 18,
  },
  modalTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  modalInput: {
    color: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1F2A',
    paddingVertical: 8,
    fontSize: 15,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  cancelBtn: { color: '#C9D1D9', fontWeight: '600', marginRight: 20 },
  confirmBtn: { color: '#3897F0', fontWeight: '700' },
});
