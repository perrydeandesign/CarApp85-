import { createContext, useContext, useMemo, useState, type ReactNode, createElement } from 'react';

export type Conversation = any; // tighten later when the messaging schema lands

type ConversationsContextValue = {
  conversations: Conversation[];
  setConversations: (next: Conversation[]) => void;
};

const ConversationsContext = createContext<ConversationsContextValue>({
  conversations: [],
  setConversations: () => {},
});

export function ConversationsProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const value = useMemo(() => ({ conversations, setConversations }), [conversations]);
  return createElement(ConversationsContext.Provider, { value }, children);
}

export function useConversations() {
  return useContext(ConversationsContext);
}
