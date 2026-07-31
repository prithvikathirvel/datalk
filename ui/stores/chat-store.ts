import type {
  ConversationSummary,
  ConversationUsage,
} from "@template/contracts";
import { create } from "zustand";

export interface LocalChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  sourceDocuments?: string[];
  usage?: ConversationUsage;
}

interface ChatState {
  threadId: string | null;
  messages: LocalChatMessage[];
  usage: ConversationUsage | null;
  conversations: ConversationSummary[];
  conversationsLoaded: boolean;
  setThreadId: (threadId: string | null) => void;
  addMessage: (message: LocalChatMessage) => void;
  setMessages: (messages: LocalChatMessage[]) => void;
  setUsage: (usage: ConversationUsage | null) => void;
  setConversations: (conversations: ConversationSummary[]) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  threadId: null,
  messages: [],
  usage: null,
  conversations: [],
  conversationsLoaded: false,
  setThreadId: (threadId) => set({ threadId }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setMessages: (messages) => set({ messages }),
  setUsage: (usage) => set({ usage }),
  setConversations: (conversations) =>
    set({ conversations, conversationsLoaded: true }),
  reset: () => set({ threadId: null, messages: [], usage: null }),
}));
