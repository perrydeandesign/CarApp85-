import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { Post } from '../../social/data/posts';

type Props = {
  name: string;
  postIds: string[];
  postsById: Record<string, Post>;
  onBack: () => void;
  onRemovePost: (postId: string) => void;
  onDeleteCollection?: () => void;
};

export const CollectionDetailScreen: React.FC<Props> = ({
  name,
  postIds,
  postsById,
  onBack,
  onRemovePost,
  onDeleteCollection,
}) => {
  const [editing, setEditing] = useState(false);
  const posts = postIds.map((id) => postsById[id]).filter(Boolean) as Post[];

  const confirmDelete = () => {
    if (!onDeleteCollection) return;
    Alert.alert('Delete collection?', `“${name}” will be deleted. Posts stay saved.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDeleteCollection },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="chevron-back" size={26} color="#F0F6FC" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{name}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setEditing((v) => !v)}>
            <Text style={styles.headerAction}>{editing ? 'Done' : 'Edit'}</Text>
          </TouchableOpacity>
          {onDeleteCollection ? (
            <TouchableOpacity onPress={confirmDelete} style={{ marginLeft: 14 }}>
              <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {posts.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="bookmark-outline" size={36} color="#555" />
          <Text style={styles.emptyTitle}>No posts yet</Text>
          <Text style={styles.emptyBody}>Tap the bookmark icon on a post to add it here.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.grid}>
          {posts.map((p) => (
            <View key={p.id} style={styles.gridCell}>
              <Image source={{ uri: p.mediaUrl }} style={styles.gridImage} />
              {editing ? (
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => onRemovePost(p.id)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Ionicons name="close-circle" size={22} color="#F0F6FC" />
                </TouchableOpacity>
              ) : null}
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1A1F2A',
  },
  headerTitle: {
    color: '#F0F6FC',
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  headerAction: { color: '#3897F0', fontWeight: '600' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 1,
  },
  gridCell: {
    width: '33.333%',
    aspectRatio: 1,
    padding: 1,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#11141C',
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 12,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  emptyTitle: { color: '#F0F6FC', fontSize: 16, fontWeight: '700', marginTop: 12 },
  emptyBody: { color: '#C9D1D9', textAlign: 'center', marginTop: 6 },
});
