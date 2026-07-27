import type {
  ConversationDetail,
  ConversationSummary,
  ConversationTurn,
} from "@template/contracts";
import type { LocalChatMessage } from "@/stores/chat-store";

/** Legacy shape returned by the previous `/chat/get-conversation` endpoint. */
interface LegacyConversationDetail {
  thread_id?: string;
  conversation?: Array<{
    id?: string | number;
    role?: string;
    content?: string;
  }>;
  created_at?: string;
}

export async function readApiError(response: Response) {
  const data = (await response.json().catch(() => null)) as {
    detail?: string;
    message?: string;
  } | null;
  return data?.detail ?? data?.message ?? "Request failed.";
}

function toLocalMessage(
  turn: ConversationTurn,
  index: number,
  fallbackDate: string,
): LocalChatMessage {
  return {
    id: String(turn.id ?? `message-${index}`),
    role: turn.role === "assistant" ? "assistant" : "user",
    content: turn.content ?? "",
    createdAt: turn.created_at ?? fallbackDate,
  };
}

/**
 * Normalises a conversation payload into the message list rendered by the chat
 * UI. Supports both the current `messages` shape and the legacy
 * `conversation` shape so the UI keeps working across backend versions.
 */
export function toChatMessages(
  payload: ConversationDetail | LegacyConversationDetail,
): LocalChatMessage[] {
  const fallbackDate = new Date().toISOString();
  const detail = payload as ConversationDetail;

  if (Array.isArray(detail.messages)) {
    return detail.messages
      .filter((turn) => turn.role === "user" || turn.role === "assistant")
      .map((turn, index) => toLocalMessage(turn, index, fallbackDate));
  }

  const legacy = payload as LegacyConversationDetail;
  if (Array.isArray(legacy.conversation)) {
    return legacy.conversation
      .filter((turn) => turn.role === "user" || turn.role === "assistant")
      .map((turn, index) =>
        toLocalMessage(
          {
            id: String(turn.id ?? index),
            role: turn.role === "assistant" ? "assistant" : "user",
            content: turn.content ?? "",
            created_at: legacy.created_at ?? fallbackDate,
          },
          index,
          fallbackDate,
        ),
      );
  }

  return [];
}

/** Fetches every conversation of the signed-in user, newest first. */
export async function fetchConversations(): Promise<ConversationSummary[]> {
  const response = await fetch("/api/chat/conversations", {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(await readApiError(response));
  }
  const data = (await response.json()) as
    | ConversationSummary[]
    | { conversations?: ConversationSummary[] };
  const conversations = Array.isArray(data) ? data : (data.conversations ?? []);
  return [...conversations].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

/** Fetches a single conversation by thread id. */
export async function fetchConversation(
  threadId: string,
): Promise<ConversationDetail> {
  const response = await fetch(
    `/api/chat/conversation?thread_id=${encodeURIComponent(threadId)}`,
    { cache: "no-store" },
  );
  if (!response.ok) {
    throw new Error(await readApiError(response));
  }
  return (await response.json()) as ConversationDetail;
}
