import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from './Icon';
import { iconColors } from './IconStyles';

type IGCommentInputBarProps = {
  onSubmit: (text: string) => void;
};

export const IGCommentInputBar: React.FC<IGCommentInputBarProps> = ({ onSubmit }) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText('');
  };

  return (
    <View style={stylesComment.container}>
      <TextInput
        style={stylesComment.input}
        placeholder="Add a comment..."
        placeholderTextColor="#666"
        value={text}
        onChangeText={setText}
      />

      <TouchableOpacity onPress={handleSend} style={stylesComment.sendButton}>
        <Icon name="send" size={22} color={iconColors.primary} />
      </TouchableOpacity>
    </View>
  );
};

const stylesComment = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#1A1F2A',
    backgroundColor: '#05070B',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    paddingRight: 12,
  },
  sendButton: {
    padding: 6,
  },
});
