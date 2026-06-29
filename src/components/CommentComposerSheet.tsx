import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { T } from '../constants/theme';
import { PressableScale } from '../ui/PressableScale';
import { checkText } from '../lib/moderation';

type Props = {
  visible: boolean;
  /** Short context line shown above the input (e.g. the post/entry title). */
  context?: string;
  placeholder?: string;
  onClose: () => void;
  onSubmit: (text: string) => void;
};

/**
 * In-app comment composer styled to match the app (dark sheet, teal Post button)
 * — replaces the jarring native Alert.prompt so commenting feels consistent
 * across the feed and the timeline.
 */
export function CommentComposerSheet({ visible, context, placeholder = 'Add a comment…', onClose, onSubmit }: Props) {
  const [text, setText] = useState('');

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const check = checkText(trimmed);
    if (!check.ok) return; // moderation handled by caller's insert path too
    onSubmit(trimmed);
    setText('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }} onPress={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: T.card,
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
              borderTopWidth: 1,
              borderColor: T.bd,
              paddingHorizontal: 16,
              paddingTop: 14,
              paddingBottom: 28,
            }}
          >
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: T.bd, alignSelf: 'center', marginBottom: 14 }} />

            {context ? (
              <Text style={{ color: T.mu, fontSize: 12, marginBottom: 8 }} numberOfLines={1}>
                Replying to {context}
              </Text>
            ) : null}

            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={placeholder}
              placeholderTextColor={T.mu}
              selectionColor={T.accent}
              style={{
                color: T.tx,
                fontSize: 15,
                backgroundColor: T.bg,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: T.bd,
                paddingHorizontal: 12,
                paddingVertical: 10,
                minHeight: 44,
                maxHeight: 120,
              }}
              multiline
              autoFocus
              returnKeyType="send"
              onSubmitEditing={submit}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
              <PressableScale
                onPress={onClose}
                style={{ paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, backgroundColor: T.card2 }}
              >
                <Text style={{ color: T.tx2, fontWeight: '700', fontSize: 13 }}>Cancel</Text>
              </PressableScale>
              <PressableScale
                onPress={submit}
                style={{
                  paddingHorizontal: 18,
                  paddingVertical: 9,
                  borderRadius: 20,
                  backgroundColor: text.trim() ? T.accent : T.accentDim,
                }}
              >
                <Text style={{ color: text.trim() ? '#04110E' : T.accent, fontWeight: '800', fontSize: 13 }}>Post</Text>
              </PressableScale>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
