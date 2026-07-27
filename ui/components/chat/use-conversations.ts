"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchConversations } from "@/lib/chat";
import { useChatStore } from "@/stores/chat-store";

/**
 * Loads the signed-in user's conversations into the chat store and keeps the
 * request state local so several surfaces (list page, header switcher) can
 * share one cached copy.
 */
export function useConversations({ auto = true }: { auto?: boolean } = {}) {
  const conversations = useChatStore((state) => state.conversations);
  const loaded = useChatStore((state) => state.conversationsLoaded);
  const setConversations = useChatStore((state) => state.setConversations);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setConversations(await fetchConversations());
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to load conversations.",
      );
    } finally {
      setLoading(false);
    }
  }, [setConversations]);

  useEffect(() => {
    if (auto) {
      void reload();
    }
  }, [auto, reload]);

  return { conversations, loaded, loading, error, reload };
}
