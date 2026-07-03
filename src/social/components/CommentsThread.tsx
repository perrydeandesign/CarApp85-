import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Comment } from '../data/posts';

export const CommentsThread = ({ comments }: { comments: Comment[] }) => {
  return (
    <View style={stylesThread.container}>
      {comments.map((c) => (
        <View key={c.id} style={stylesThread.commentRow}>
          <Text style={stylesThread.username}>{c.author.username}</Text>
          <Text style={stylesThread.text}>{c.text}</Text>
        </View>
      ))}
    </View>
  );
};

// Removed the old inputRow entirely.

const stylesThread = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  commentRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  username: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: 6,
  },
  text: {
    color: '#FFFFFF',
  },
});
