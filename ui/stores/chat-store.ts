import { create } from "zustand";

export interface LocalChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface ChatState {
  threadId: string | null;
  messages: LocalChatMessage[];
  setThreadId: (threadId: string | null) => void;
  addMessage: (message: LocalChatMessage) => void;
  setMessages: (messages: LocalChatMessage[]) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  threadId: null,
  messages: [],
  setThreadId: (threadId) => set({ threadId }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setMessages: (messages) => set({ messages }),
  reset: () => set({ threadId: null, messages: [] }),
}));
