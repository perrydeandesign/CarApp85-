import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { T } from '../../constants/theme';
import { Button } from '../../ui/Button';
import { VideoView } from '../../ui/VideoView';
import { useUploadStory } from '../../hooks/useUploadStory';
import type { MediaPick } from '../../lib/imagePicker';

/**
 * Preview + caption + publish for a picked photo/video story. Mirrors the post
 * composer (PostPreview) but stripped to what a 24h ephemeral story needs.
 */
export function StoryComposer({
  media,
  onClose,
  onPublished,
}: {
  media: MediaPick;
  onClose: () => void;
  onPublished: () => void;
}) {
  const [caption, setCaption] = useState('');
  const { state, upload } = useUploadStory();
  const publishing = state.status === 'uploading';

  const publish = async () => {
    try {
      await upload({ imageUri: media.uri, mediaType: media.type, caption });
      onPublished();
      onClose();
    } catch (e: any) {
      Alert.alert('Could not publish story', e?.message ?? String(e));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 10,
        }}
      >
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={28} color={T.wh} />
        </TouchableOpacity>
        <Text style={{ color: T.wh, fontSize: 16, fontWeight: '800' }}>New story</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Media preview */}
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        {media.type === 'video' ? (
          <VideoView uri={media.uri} style={{ flex: 1 }} controls muted={false} resizeMode="contain" />
        ) : (
          <Image source={{ uri: media.uri }} style={{ flex: 1 }} resizeMode="contain" />
        )}
      </View>

      {/* Caption + publish */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16, gap: 12 }}>
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="Add a caption…"
            placeholderTextColor={T.mu}
            maxLength={200}
            style={{
              color: T.tx,
              backgroundColor: T.card,
              borderWidth: 1,
              borderColor: T.bd,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 12,
              fontSize: 15,
            }}
          />
          <Button
            label={publishing ? 'Publishing…' : 'Share to story'}
            variant="primary"
            size="lg"
            fullWidth
            loading={publishing}
            onPress={publish}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
