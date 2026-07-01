import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { T, IC } from '../../constants/theme';
import { Avatar } from '../../components/Avatar';
import { TypingIndicator } from '../../components/TypingIndicator';
import { ReactionPicker } from '../../components/ReactionPicker';

// NEW DATA LAYER IMPORTS
import { sb, getMessages, sendMessage, subscribeToMessages } from '../../lib/data';

export function ChatScreen({ route, navigation }: any) {
  const conversationId = route?.params?.conversationId;

  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<any | null>(null);
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [otherTyping, setOtherTyping] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  // ------------------------------------------------------------
  // LOAD MESSAGES
  // ------------------------------------------------------------
  const load = useCallback(async () => {
    const msgs = await getMessages(conversationId);
    setMessages(msgs);
  }, [conversationId]);

  useEffect(() => {
    load();
  }, [load]);

  // ------------------------------------------------------------
  // REAL-TIME SUBSCRIPTION
  // ------------------------------------------------------------
  useEffect(() => {
    const unsub = subscribeToMessages(conversationId, (newMsg: any) => {
      setMessages((prev) => [...prev, newMsg]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
    });

    return () => unsub();
  }, [conversationId]);

  // ------------------------------------------------------------
  // SEND MESSAGE
  // ------------------------------------------------------------
  const handleSend = async () => {
    if (!text.trim()) return;

    await sendMessage(conversationId, text.trim(), replyTo);

    setText('');
    setReplyTo(null);

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
  };

  // ------------------------------------------------------------
  // REACTIONS (local only for now)
  // ------------------------------------------------------------
  const toggleReaction = (msgId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? {
              ...m,
              reactions: m.reactions?.includes(emoji)
                ? m.reactions.filter((e: string) => e !== emoji)
                : [...(m.reactions || []), emoji],
            }
          : m
      )
    );
    setShowReactions(null);
  };

  // ------------------------------------------------------------
  // RENDER MESSAGE
  // ------------------------------------------------------------
  const renderMessage = ({ item }: any) => {
    const mine = item.sender_id === sb.auth.getUser()?.data?.user?.id;

    const grouped: Record<string, number> = {};
    (item.reactions || []).forEach((emoji: string) => {
      grouped[emoji] = (grouped[emoji] || 0) + 1;
    });

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onLongPress={() => setShowReactions(item.id)}
        style={{
          alignItems: mine ? 'flex-end' : 'flex-start',
          marginVertical: 3,
          paddingHorizontal: 14,
        }}
      >
        {item.reply_to && (
          <View
            style={{
              backgroundColor: T.cd2,
              borderRadius: 8,
              padding: 6,
              marginBottom: 2,
              maxWidth: '70%',
              borderLeftWidth: 3,
              borderLeftColor: T.ac,
            }}
          >
            <Text style={{ color: T.ac, fontSize: 11, fontWeight: '600' }}>
              {item.reply_to.sender_name}
            </Text>
            <Text style={{ color: T.mu, fontSize: 12 }} numberOfLines={1}>
              {item.reply_to.text}
            </Text>
          </View>
        )}

        <View
          style={{
            backgroundColor: mine ? T.ac : T.cd,
            borderRadius: 16,
            paddingHorizontal: 14,
            paddingVertical: 9,
            maxWidth: '78%',
          }}
        >
          <Text style={{ color: mine ? '#fff' : T.tx, fontSize: 15 }}>
            {item.body}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              marginTop: 3,
            }}
          >
            <Text
              style={{
                color: mine ? 'rgba(255,255,255,0.6)' : T.mu,
                fontSize: 10,
              }}
            >
              {new Date(item.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>

        {Object.keys(grouped).length > 0 && (
          <View style={{ flexDirection: 'row', marginTop: 2 }}>
            {Object.entries(grouped).map(([emoji, count]) => (
              <TouchableOpacity
                key={emoji}
                onPress={() => toggleReaction(item.id, emoji)}
                style={{
                  flexDirection: 'row',
                  backgroundColor: T.cd2,
                  borderRadius: 10,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  marginRight: 4,
                }}
              >
                <Text style={{ fontSize: 13 }}>{emoji}</Text>
                {count > 1 && (
                  <Text style={{ color: T.mu, fontSize: 11, marginLeft: 2 }}>
                    {count}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {showReactions === item.id && (
          <ReactionPicker
            onSelect={(emoji) => toggleReaction(item.id, emoji)}
            onClose={() => setShowReactions(null)}
          />
        )}
      </TouchableOpacity>
    );
  };

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
      {/* HEADER */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 14,
          borderBottomWidth: 1,
          borderBottomColor: T.bd,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginRight: 12 }}
        >
          <Ionicons name="chevron-back" size={IC.back} color={T.ac} />
        </TouchableOpacity>

        <Text style={{ color: T.tx, fontWeight: '700', fontSize: 16 }}>
          Chat
        </Text>
      </View>

      {/* MESSAGES */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderMessage}
        contentContainerStyle={{ paddingVertical: 10 }}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
      />

      {otherTyping && (
        <View style={{ paddingHorizontal: 14, paddingBottom: 4 }}>
          <TypingIndicator name="Someone" />
        </View>
      )}

      {/* REPLY BAR */}
      {replyTo && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: T.cd,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderTopWidth: 1,
            borderTopColor: T.bd,
          }}
        >
          <View
            style={{
              flex: 1,
              borderLeftWidth: 3,
              borderLeftColor: T.ac,
              paddingLeft: 8,
            }}
          >
            <Text
              style={{ color: T.ac, fontSize: 12, fontWeight: '600' }}
            >
              Replying
            </Text>
            <Text style={{ color: T.mu, fontSize: 13 }} numberOfLines={1}>
              {replyTo.body}
            </Text>
          </View>

          <TouchableOpacity onPress={() => setReplyTo(null)}>
            <Ionicons name="close" size={IC.actionSm} color={T.mu} />
          </TouchableOpacity>
        </View>
      )}

      {/* INPUT BAR */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 10,
            borderTopWidth: 1,
            borderTopColor: T.bd,
            backgroundColor: T.bg,
          }}
        >
          <TextInput
            style={{
              flex: 1,
              backgroundColor: T.cd,
              color: T.tx,
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 10,
              fontSize: 15,
            }}
            placeholder="Message..."
            placeholderTextColor={T.mu}
            value={text}
            onChangeText={setText}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />

          <TouchableOpacity
            onPress={handleSend}
            style={{
              marginLeft: 10,
              backgroundColor: T.ac,
              borderRadius: 20,
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="send" size={IC.actionSm} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
