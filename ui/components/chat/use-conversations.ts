"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchConversations } from "@/lib/chat";
import { useChatStore } from "@/stores/chat-store";

/** Minimum interval (ms) between automatic reloads to prevent duplicate calls. */
const RELOAD_THROTTLE_MS = 30_000;

/**
 * Loads the signed-in user's conversations into the chat store and keeps the
 * request state local so several surfaces (list page, header switcher) can
 * share one cached copy.
 *
 * Reloads are throttled so that opening the switcher shortly after the list
 * page already fetched does not trigger a duplicate network request.
 */
export function useConversations({ auto = true }: { auto?: boolean } = {}) {
  const conversations = useChatStore((state) => state.conversations);
  const loaded = useChatStore((state) => state.conversationsLoaded);
  const setConversations = useChatStore((state) => state.setConversations);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastFetchRef = useRef<number>(0);

  const reload = useCallback(async (force = false) => {
    // Throttle: skip if we fetched recently and the caller didn't force it.
    const now = Date.now();
    if (!force && now - lastFetchRef.current < RELOAD_THROTTLE_MS && loaded) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setConversations(await fetchConversations());
      lastFetchRef.current = Date.now();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to load conversations.",
      );
    } finally {
      setLoading(false);
    }
  }, [setConversations, loaded]);

  useEffect(() => {
    if (auto) {
      void reload();
    }
  }, [auto, reload]);

  return { conversations, loaded, loading, error, reload };
}
