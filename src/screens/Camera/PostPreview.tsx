import React, { useMemo, useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useUploadPost } from '../../hooks/useUploadPost';
import { RichCaption, extractHashtags, extractMentions } from '../../social/components/RichCaption';
import { UserPickerModal, type PickableUser } from '../../social/components/UserPickerModal';
import { TaggablePhoto } from '../../social/components/TaggablePhoto';
import type { PhotoTag } from '../../social/data/posts';
import { checkText } from '../../lib/moderation';
import { Button } from '../../ui/Button';

// ❌ Removed broken import
// import { CONNS, ME } from '../../../App';

export default function PostPreview({ route, navigation }: any) {
  const { imageUri } = route.params;
  const { state: uploadState, upload } = useUploadPost();

  const [caption, setCaption] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [taggedUsernames, setTaggedUsernames] = useState<string[]>([]);
  const [photoTags, setPhotoTags] = useState<PhotoTag[]>([]);
  const [pendingTagPoint, setPendingTagPoint] = useState<{ x: number; y: number } | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const isUploading = uploadState.status === 'uploading';

  // ✔ Temporary empty list until real data is wired in
  const pickableUsers = useMemo<PickableUser[]>(() => [], []);

  const hashtags = useMemo(() => extractHashtags(caption), [caption]);
  const captionMentions = useMemo(() => extractMentions(caption), [caption]);

  const allTagged = useMemo(
    () =>
      Array.from(
        new Set([
          ...taggedUsernames,
          ...captionMentions,
          ...photoTags.map((p) => p.username),
        ])
      ),
    [taggedUsernames, captionMentions, photoTags],
  );

  const onPublish = async () => {
    if (isUploading) return;
    const check = checkText(caption);
    if (!check.ok) {
      Alert.alert('Please rephrase your caption', check.reason);
      return;
    }
    try {
      await upload({
        imageUri,
        caption,
        taggedUsernames,
        photoTags,
      });
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Could not publish', err?.message ?? 'Unknown error');
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <TaggablePhoto
        uri={imageUri}
        tags={photoTags}
        mode="compose"
        emptyHint="Tap photo to tag people"
        imageStyle={styles.image}
        onPlaceTag={(point) => {
          setPendingTagPoint(point);
          setPickerOpen(true);
        }}
        onRemoveTag={(username) =>
          setPhotoTags((prev) => prev.filter((t) => t.username !== username))
        }
      />

      <View style={styles.form}>
        <Text style={styles.label}>Caption</Text>
        <TextInput
          style={styles.input}
          value={caption}
          onChangeText={setCaption}
          placeholder="Say something. Use #hashtags and @mentions"
          placeholderTextColor="#666"
          multiline
          autoCapitalize="none"
          autoCorrect={false}
        />

        {caption.length > 0 ? (
          <View style={styles.previewBox}>
            <Text style={styles.previewLabel}>Preview</Text>

            {/* ✔ Removed ME.user — replaced with safe fallback */}
            <Text style={styles.previewAuthor}>
              you{' '}
              <RichCaption text={caption} style={styles.previewCaption} />
            </Text>

            {(hashtags.length > 0 || allTagged.length > 0) ? (
              <View style={styles.tokensRow}>
                {hashtags.map((h) => (
                  <View key={`h-${h}`} style={styles.tokenChip}>
                    <Text style={styles.tokenText}>#{h}</Text>
                  </View>
                ))}
                {allTagged.map((u) => (
                  <View key={`m-${u}`} style={[styles.tokenChip, styles.mentionChip]}>
                    <Text style={styles.tokenText}>@{u}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

        <Text style={styles.label}>Tag people</Text>
        <TouchableOpacity onPress={() => setPickerOpen(true)} style={styles.tagBtn}>
          <Ionicons name="pricetag-outline" size={16} color="#F0F6FC" />
          <Text style={styles.tagBtnText}>
            {taggedUsernames.length === 0 ? 'Add people' : `${taggedUsernames.length} tagged`}
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#C9D1D9" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        {taggedUsernames.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.taggedRow}>
            {taggedUsernames.map((u) => (
              <View key={u} style={styles.taggedChip}>
                <Text style={styles.taggedChipText}>@{u}</Text>
                <TouchableOpacity onPress={() => setTaggedUsernames((prev) => prev.filter((x) => x !== u))}>
                  <Ionicons name="close" size={14} color="#F0F6FC" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        ) : null}

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Make</Text>
            <TextInput
              style={styles.input}
              value={make}
              onChangeText={setMake}
              placeholder="Toyota"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.col}>
            <Text style={styles.label}>Model</Text>
            <TextInput
              style={styles.input}
              value={model}
              onChangeText={setModel}
              placeholder="Supra"
              placeholderTextColor="#666"
            />
          </View>
        </View>

        <Button
          label="Publish"
          variant="primary"
          size="lg"
          fullWidth
          loading={isUploading}
          onPress={onPublish}
          style={{ marginTop: 16 }}
        />
      </View>

      <UserPickerModal
        visible={pickerOpen}
        title={pendingTagPoint ? 'Tag who?' : 'Tag people'}
        users={pickableUsers}
        selectedUsernames={pendingTagPoint ? [] : taggedUsernames}
        onClose={() => {
          setPickerOpen(false);
          setPendingTagPoint(null);
        }}
        onConfirm={(usernames) => {
          if (pendingTagPoint && usernames.length > 0) {
            const username = usernames[0];
            setPhotoTags((prev) => {
              const filtered = prev.filter((t) => t.username !== username);
              return [...filtered, { username, x: pendingTagPoint.x, y: pendingTagPoint.y }];
            });
            setPendingTagPoint(null);
          } else {
            setTaggedUsernames(usernames);
          }
          setPickerOpen(false);
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  image: { width: '100%', aspectRatio: 1 },
  form: { padding: 16 },
  label: { color: '#C9D1D9', fontSize: 12, marginBottom: 4, marginTop: 8 },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#F0F6FC',
    marginBottom: 8,
    fontSize: 14,
    minHeight: 44,
    textAlignVertical: 'top',
  },
  previewBox: {
    borderRadius: 10,
    backgroundColor: '#11141C',
    padding: 10,
    marginBottom: 8,
  },
  previewLabel: {
    color: '#C9D1D9',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  previewAuthor: { color: '#F0F6FC', fontWeight: '600', fontSize: 14, lineHeight: 20 },
  previewCaption: { color: '#F0F6FC', fontSize: 14, fontWeight: '400' },
  tokensRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
  },
  tokenChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#1F2A33',
  },
  mentionChip: { backgroundColor: '#0E5C4F' },
  tokenText: { color: '#F0F6FC', fontSize: 12, fontWeight: '600' },
  tagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
  },
  tagBtnText: { color: '#F0F6FC', fontWeight: '600', fontSize: 14 },
  taggedRow: { gap: 6, marginTop: 6, paddingVertical: 4 },
  taggedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0E5C4F',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  taggedChipText: { color: '#F0F6FC', fontWeight: '600', fontSize: 12 },
  row: { flexDirection: 'row', gap: 8, marginTop: 4 },
  col: { flex: 1 },
  button: {
    marginTop: 16,
    backgroundColor: '#e91e63',
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#F0F6FC', fontWeight: '600', fontSize: 15 },
});
