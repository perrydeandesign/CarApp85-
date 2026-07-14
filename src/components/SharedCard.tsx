import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { T, IC } from '../constants/theme';
import type { Post } from '../constants/types';
import { Avatar } from './Avatar';
import { RichText } from './RichText';
import { CommentsThread } from './CommentsThread';

export function PostCard({ post, onProfile, onLike }: { post: Post; onProfile?: (p: any) => void; onLike?: () => void }) {
  const [showCom, setShowCom] = useState(false);
  const liked = post.liked || false;
  const like = () => onLike && onLike();
  return (
    <View style={{ backgroundColor: T.card, marginBottom: 1 }}>
      <TouchableOpacity onPress={() => onProfile && onProfile(post)} style={{ padding: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Avatar initials={post.av} size={36} ring img={post.img} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: T.tx }}>{post.user}</Text>
          <Text style={{ fontSize: 12, color: T.mu }}>{post.car}</Text>
        </View>
        <Text style={{ fontSize: 12, color: T.mu }}>{post.time}</Text>
      </TouchableOpacity>
      <View style={{ width: '100%', aspectRatio: 4 / 3, backgroundColor: post.color }}>
        {post.carImg ? (
          <Image source={{ uri: post.carImg }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="car-sport" size={64} color={T.wh} style={{ opacity: 0.2 }} />
          </View>
        )}
      </View>
      <View style={{ padding: 10, paddingHorizontal: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10 }}>
          <TouchableOpacity onPress={like}>
            <Ionicons name={liked ? 'heart' : 'heart-outline'} size={IC.action} color={liked ? T.accent : T.tx2} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowCom(v => !v)}>
            <Ionicons name="chatbubble-outline" size={IC.action} color={showCom ? T.accent : T.tx2} />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <Ionicons name="share-outline" size={IC.action} color={T.tx2} />
        </View>
        <Text style={{ fontSize: 13, fontWeight: '600', color: T.tx, marginBottom: 4 }}>{post.likes + (liked ? 0 : 0)} likes</Text>
        <View style={{ marginBottom: 8 }}>
          <RichText text={post.desc} style={{ fontSize: 14, color: T.tx, lineHeight: 20 }} />
        </View>
        {showCom && <CommentsThread postId={post.id} />}
        <Text style={{ fontSize: 11, color: T.mu }}>{post.time} ago</Text>
      </View>
    </View>
  );
}
