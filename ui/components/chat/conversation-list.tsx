"use client";

import type { ConversationSummary } from "@template/contracts";
import { cn } from "@template/ui";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useConversations } from "@/components/chat/use-conversations";
import {
  formatDateTime,
  formatRelativeTime,
  relativeDayGroup,
} from "@/lib/format";

const GROUP_ORDER = [
  "Today",
  "Yesterday",
  "Previous 7 days",
  "Previous 30 days",
  "Earlier",
];

function groupConversations(conversations: ConversationSummary[]) {
  const groups = new Map<string, ConversationSummary[]>();
  for (const conversation of conversations) {
    const key = relativeDayGroup(conversation.created_at);
    const bucket = groups.get(key);
    if (bucket) {
      bucket.push(conversation);
    } else {
      groups.set(key, [conversation]);
    }
  }
  return GROUP_ORDER.filter((key) => groups.has(key)).map((key) => ({
    label: key,
    items: groups.get(key) ?? [],
  }));
}

function ConversationRow({
  conversation,
  onOpen,
}: {
  conversation: ConversationSummary;
  onOpen: (threadId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(conversation.thread_id)}
      className="group flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-slate-300 hover:bg-slate-50"
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-slate-950 group-hover:text-white">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="truncate font-medium text-slate-950 text-sm">
            {conversation.title || "Untitled conversation"}
          </p>
          <span
            className="shrink-0 whitespace-nowrap text-slate-400 text-xs"
            title={formatDateTime(conversation.created_at)}
          >
            {formatRelativeTime(conversation.created_at)}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-slate-500 text-xs leading-relaxed">
          {conversation.bot_message || "No response yet."}
        </p>
      </div>

      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-2 h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-slate-600"
        aria-hidden="true"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  );
}

export function ConversationList() {
  const router = useRouter();
  const { conversations, loading, error, reload } = useConversations();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return conversations;
    return conversations.filter(
      (conversation) =>
        conversation.title?.toLowerCase().includes(term) ||
        conversation.bot_message?.toLowerCase().includes(term),
    );
  }, [conversations, query]);

  const groups = useMemo(() => groupConversations(filtered), [filtered]);

  function openConversation(threadId: string) {
    router.push(`/chat/${encodeURIComponent(threadId)}`);
  }

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col overflow-hidden bg-white lg:h-screen">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h1 className="font-semibold text-slate-950">Chat</h1>
          <p className="text-slate-400 text-xs">
            {conversations.length > 0
              ? `${conversations.length} conversation${conversations.length === 1 ? "" : "s"}`
              : "Your conversation history"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void reload()}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-slate-600 text-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn("h-3.5 w-3.5", loading && "animate-spin")}
              aria-hidden="true"
            >
              <path d="M21 12a9 9 0 1 1-2.64-6.36" />
              <polyline points="21 3 21 9 15 9" />
            </svg>
            Refresh
          </button>
          <button
            type="button"
            onClick={() => router.push("/chat/new")}
            className="flex items-center gap-1.5 rounded-xl bg-slate-950 px-3 py-1.5 text-sm text-white transition-colors hover:bg-slate-800"
          >
            <svg
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-3.5 w-3.5"
              aria-hidden="true"
            >
              <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
            </svg>
            New chat
          </button>
        </div>
      </div>

      {/* Search */}
      {conversations.length > 0 && (
        <div className="shrink-0 border-b border-slate-100 px-6 py-3">
          <div className="relative mx-auto max-w-3xl">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-slate-400"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search conversations..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-slate-950 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-6">
          {error && (
            <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 shrink-0"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {loading && conversations.length === 0 ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-20 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-slate-200 border-dashed py-16 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-slate-400"
                  aria-hidden="true"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p className="font-medium text-slate-700">
                {query ? "No matching conversations" : "No conversations yet"}
              </p>
              <p className="mt-1 text-slate-400 text-xs">
                {query
                  ? "Try a different search term."
                  : "Start a new chat to ask questions about your documents."}
              </p>
              {!query && (
                <button
                  type="button"
                  onClick={() => router.push("/chat/new")}
                  className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-3.5 py-2 text-sm text-white transition-colors hover:bg-slate-800"
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  >
                    <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
                  </svg>
                  New chat
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {groups.map((group) => (
                <div key={group.label} className="space-y-2">
                  <p className="px-1 font-medium text-slate-400 text-xs uppercase tracking-wide">
                    {group.label}
                  </p>
                  <div className="space-y-2">
                    {group.items.map((conversation) => (
                      <ConversationRow
                        key={conversation.id}
                        conversation={conversation}
                        onOpen={openConversation}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
