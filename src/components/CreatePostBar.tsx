import React, { useState } from 'react';
import { Alert, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { T } from '../constants/theme';
import { checkText } from '../lib/moderation';

type Props = {
  onPost: (text: string, imageUri?: string) => void;
};

export function CreatePostBar({ onPost }: Props) {
  const [text, setText] = useState('');

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const check = checkText(trimmed);
    if (!check.ok) {
      Alert.alert('Please rephrase', check.reason);
      return;
    }
    onPost(trimmed);
    setText('');
  };

  return (
    <View style={{ flexDirection: 'row', padding: 12, alignItems: 'center', gap: 8 }}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Share an update..."
        placeholderTextColor={T.mu}
        style={{
          flex: 1,
          color: T.wh,
          paddingHorizontal: 10,
          paddingVertical: 8,
          backgroundColor: T.card,
          borderRadius: 18,
        }}
        returnKeyType="send"
        onSubmitEditing={submit}
      />
      <TouchableOpacity onPress={submit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="paper-plane" size={20} color={T.accent} />
      </TouchableOpacity>
    </View>
  );
}
