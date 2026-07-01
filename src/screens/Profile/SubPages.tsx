import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { T } from '../../constants/theme';
import { POSTS } from '../../data/posts';
import { Avatar } from '../../components/Avatar';
import { CONNS } from '../../data/users';
import { PostCard } from '../../components/SharedCard';

type SubPageProps = {
  onProfile?: (p: any) => void;
  onOpenProfile?: (p: any) => void;
  user?: any;
  onClose?: () => void;
  onOpenPost?: (id: string) => void;
};

export function PostsPage({ onProfile, onOpenProfile }: SubPageProps) {
  const handler = onProfile || onOpenProfile || (() => {});
  return <View style={{ padding: 8 }}>{POSTS.map(p => <PostCard key={p.id} post={p} onProfile={handler} />)}</View>;
}

export function ConnectedPage({ onProfile, onOpenProfile }: SubPageProps) {
  const handler = onProfile || onOpenProfile || (() => {});
  return (
    <View>{CONNS.filter(c => c.following).map(c => (
      <TouchableOpacity key={c.id} onPress={() => handler(c)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: T.bd }}>
        <Avatar initials={c.av} size={44} ring img={c.img} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: T.tx }}>{c.user}</Text>
          <Text style={{ fontSize: 12, color: T.mu, marginTop: 2 }}>{c.car}</Text>
        </View>
      </TouchableOpacity>
    ))}</View>
  );
}

export function ConnectionsPage({ onProfile, onOpenProfile }: SubPageProps) {
  const handler = onProfile || onOpenProfile || (() => {});
  const [list, setList] = useState(CONNS);
  return (
    <View>{list.map(c => (
      <TouchableOpacity key={c.id} onPress={() => handler(c)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: T.bd }}>
        <Avatar initials={c.av} size={44} ring img={c.img} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: T.tx }}>{c.user}</Text>
          <Text style={{ fontSize: 12, color: T.mu, marginTop: 2 }}>{c.followers.toLocaleString()} followers</Text>
        </View>
        <TouchableOpacity onPress={() => setList(l => l.map(x => x.id === c.id ? { ...x, following: !x.following } : x))}
          style={{ paddingHorizontal: 16, paddingVertical: 7, backgroundColor: c.following ? T.card2 : T.accent, borderWidth: 1, borderColor: c.following ? T.bd : T.accent, borderRadius: 20 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: c.following ? T.tx2 : '#051210' }}>{c.following ? 'Following' : 'Follow'}</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    ))}</View>
  );
}
