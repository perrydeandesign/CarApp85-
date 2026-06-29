import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type ConversationRow = {
  id: string;
  lastMessage: string | null;
  lastAt: string | null;
  other: { id: string; username: string; avatarUrl: string } | null;
};

export type MessageRow = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
};

/** All conversations the given profile is a member of, with last message + the other participant. */
export function useConversations(meId: string | null) {
  const [data, setData] = useState<ConversationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!meId) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    (async () => {
      // 1. Conversation ids I'm a member of
      const { data: memberships, error: mErr } = await supabase
        .from('conversation_members')
        .select('conversation_id')
        .eq('profile_id', meId);
      if (mErr) { if (!cancelled) { setError(mErr.message); setLoading(false); } return; }
      const convIds = (memberships ?? []).map((m) => m.conversation_id);
      if (convIds.length === 0) { if (!cancelled) { setData([]); setLoading(false); } return; }

      // 2. The OTHER participant in each conversation
      const { data: others } = await supabase
        .from('conversation_members')
        .select('conversation_id, profile:profiles ( id, username, avatar_url )')
        .in('conversation_id', convIds)
        .neq('profile_id', meId);

      // 3. Last message per conversation (one round-trip; client picks max)
      const { data: msgs } = await supabase
        .from('messages')
        .select('conversation_id, body, created_at')
        .in('conversation_id', convIds)
        .order('created_at', { ascending: false })
        .limit(convIds.length * 5);

      const lastByConv = new Map<string, { body: string; createdAt: string }>();
      for (const m of msgs ?? []) {
        if (!lastByConv.has(m.conversation_id)) {
          lastByConv.set(m.conversation_id, { body: m.body, createdAt: m.created_at });
        }
      }

      const rows: ConversationRow[] = convIds.map((cid) => {
        const o = (others ?? []).find((x: any) => x.conversation_id === cid);
        const last = lastByConv.get(cid);
        return {
          id: cid,
          lastMessage: last?.body ?? null,
          lastAt: last?.createdAt ?? null,
          other: o?.profile
            ? {
                id: (o as any).profile.id,
                username: (o as any).profile.username,
                avatarUrl: (o as any).profile.avatar_url ?? '',
              }
            : null,
        };
      }).sort((a, b) => (b.lastAt ?? '').localeCompare(a.lastAt ?? ''));

      if (!cancelled) { setData(rows); setLoading(false); }
    })().catch((e) => { if (!cancelled) { setError(e.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [meId]);

  return { data, loading, error };
}

/** Full message list for a conversation, ordered oldest → newest. */
export function useMessages(conversationId: string | null) {
  const [data, setData] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!conversationId) return;
    let cancelled = false;
    setLoading(true);
    supabase
      .from('messages')
      .select('id, conversation_id, sender_id, body, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .then(({ data: rows }) => {
        if (cancelled) return;
        setData(
          (rows ?? []).map((r) => ({
            id: r.id,
            conversationId: r.conversation_id,
            senderId: r.sender_id,
            body: r.body,
            createdAt: r.created_at,
          })),
        );
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [conversationId]);

  return { data, loading };
}
