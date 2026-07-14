import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CAT, IC, T, TL_LABELS } from '../../constants/theme';
import { Button } from '../../ui/Button';
import type { NewTimelineEntry } from '../../hooks/useTimeline';
import type { TimelineCategory } from '../../types/database';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (entry: NewTimelineEntry) => Promise<unknown> | unknown;
};

const CATEGORIES: TimelineCategory[] = ['event', 'track', 'modification', 'notification'];

export function TimelineModal({ visible, onClose, onSubmit }: Props) {
  const [category, setCategory] = useState<TimelineCategory>('modification');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);

  const reset = () => {
    setCategory('modification');
    setTitle('');
    setDescription('');
    setImageUrls([]);
    setPosting(false);
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  const handlePost = async () => {
    if (!title.trim() || posting) return;
    setPosting(true);
    try {
      await onSubmit({
        category,
        title,
        description,
        imageUrl: imageUrls[0] ?? null,
      });
      reset();
      onClose();
    } finally {
      setPosting(false);
    }
  };

  const canPost = title.trim().length > 0 && !posting;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleCancel}>
      <Pressable style={styles.backdrop} onPress={handleCancel}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.grabber} />
          <Text style={styles.heading}>New Timeline Entry</Text>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="What happened?"
            placeholderTextColor="#555"
            style={styles.input}
          />
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Add more details (optional)"
            placeholderTextColor="#555"
            multiline
            numberOfLines={3}
            style={[styles.input, styles.multiline]}
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.pillsRow}>
            {CATEGORIES.map((c) => {
              const cc = CAT[c];
              const active = category === c;
              return (
                <TouchableOpacity
                  key={c}
                  onPress={() => setCategory(c)}
                  style={[
                    styles.catPill,
                    {
                      borderColor: active ? cc.border : '#2A2A2A',
                      backgroundColor: active ? cc.bg : 'transparent',
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: active ? cc.text : T.mu,
                    }}
                  >
                    {TL_LABELS[c]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            onPress={() => setImageUrls((prev) => [...prev, `placeholder_${Date.now()}`])}
            style={styles.addImage}
          >
            <Ionicons name="image-outline" size={IC.inline} color={T.accent} />
            <Text style={styles.addImageText}>Add Image</Text>
          </TouchableOpacity>

          {imageUrls.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 12 }}
              contentContainerStyle={{ gap: 8 }}
            >
              {imageUrls.map((img, i) => (
                <View key={img + i} style={styles.thumb}>
                  <Ionicons name="image-outline" size={IC.actionSm} color={T.mu} style={{ opacity: 0.4 }} />
                  <TouchableOpacity
                    onPress={() => setImageUrls((prev) => prev.filter((_, idx) => idx !== i))}
                    style={styles.thumbClose}
                  >
                    <Ionicons name="close" size={IC.status} color="#F0F6FC" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          <View style={styles.actions}>
            <Button label="Cancel" variant="secondary" size="md" onPress={handleCancel} style={{ flex: 1 }} />
            <Button
              label="Post"
              variant="primary"
              size="md"
              loading={posting}
              disabled={!canPost}
              onPress={handlePost}
              style={{ flex: 1 }}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  sheet: {
    backgroundColor: '#141414',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#333',
    alignSelf: 'center',
    marginBottom: 20,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F0F6FC',
    marginBottom: 16,
  },
  input: {
    padding: 13,
    paddingHorizontal: 16,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 10,
    color: '#F0F6FC',
    fontSize: 14,
    marginBottom: 10,
  },
  multiline: {
    fontSize: 13,
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: T.mu,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  addImage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    marginBottom: 6,
  },
  addImageText: {
    fontSize: 13,
    fontWeight: '600',
    color: T.accent,
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbClose: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  cancelBtn: {
    flex: 1,
    padding: 13,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C9D1D9',
  },
  postBtn: {
    flex: 2,
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  postText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
