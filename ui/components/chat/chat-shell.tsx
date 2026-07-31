"use client";

import type { ChatResponse, ConversationUsage } from "@template/contracts";
import { cn, Textarea } from "@template/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { ConversationSwitcher } from "@/components/chat/conversation-switcher";
import { fetchConversation, readApiError, toChatMessages } from "@/lib/chat";
import { type LocalChatMessage, useChatStore } from "@/stores/chat-store";

function createMessage(
  role: LocalChatMessage["role"],
  content: string,
  sourceDocuments?: string[],
  usage?: ConversationUsage,
): LocalChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
    sourceDocuments,
    usage,
  };
}

const SUGGESTED_PROMPTS = [
  "Summarize my uploaded documents",
  "What are the key obligations?",
  "Find the termination terms",
];

export function ChatShell({
  threadId: initialThreadId,
}: {
  threadId?: string;
}) {
  const router = useRouter();
  const {
    threadId,
    messages,
    usage,
    setThreadId,
    addMessage,
    setMessages,
    setUsage,
    reset,
  } = useChatStore();
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(
    Boolean(initialThreadId),
  );
  const [error, setError] = useState<string | null>(null);

  // Sync the store with the thread in the URL: load history for an existing
  // thread, or clear the board for a brand new conversation.
  useEffect(() => {
    let cancelled = false;

    async function loadConversation(nextThreadId: string) {
      const currentState = useChatStore.getState();
      if (currentState.threadId === nextThreadId && currentState.messages.length > 0) {
        setLoadingHistory(false);
        return;
      }

      setLoadingHistory(true);
      setError(null);
      try {
        const data = await fetchConversation(nextThreadId);
        if (cancelled) return;
        setThreadId(nextThreadId);
        setMessages(toChatMessages(data));
        setUsage(data.usage ?? null);
      } catch (caught) {
        if (cancelled) return;
        setMessages([]);
        setUsage(null);
        setError(
          caught instanceof Error
            ? caught.message
            : "Unable to load this conversation.",
        );
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    }

    if (initialThreadId) {
      void loadConversation(initialThreadId);
    } else {
      reset();
      setError(null);
      setLoadingHistory(false);
    }

    return () => {
      cancelled = true;
    };
  }, [initialThreadId, reset, setMessages, setThreadId, setUsage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function submitMessage(messageText: string) {
    const message = messageText.trim();
    if (!message || loading) return;

    if (inputRef.current) inputRef.current.value = "";
    setError(null);
    setLoading(true);
    addMessage(createMessage("user", message));

    const activeThreadId = initialThreadId ?? threadId ?? undefined;
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, thread_id: activeThreadId }),
    });

    setLoading(false);
    if (!response.ok) {
      setError(await readApiError(response));
      return;
    }

    const data = (await response.json()) as ChatResponse;
    setThreadId(data.thread_id);
    addMessage(
      createMessage(
        "assistant",
        data.final_response,
        data.source_documents,
        data.metadata?.usage,
      ),
    );

    // Update usage from response metadata
    if (data.metadata?.usage) {
      setUsage(data.metadata.usage);
    }

    // Use history.replaceState to avoid Next.js route change re-render
    if (!activeThreadId && data.thread_id) {
      window.history.replaceState(
        null,
        "",
        `/chat/${encodeURIComponent(data.thread_id)}`,
      );
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitMessage(inputRef.current?.value ?? "");
  }

  function startNewChat() {
    reset();
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
    router.push("/chat/new");
  }

  function fillPrompt(prompt: string) {
    if (inputRef.current) {
      inputRef.current.value = prompt;
      inputRef.current.focus();
    }
  }

  const activeThreadId = initialThreadId ?? threadId ?? null;

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col overflow-hidden bg-white lg:h-screen">
      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-slate-100 border-b px-6 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/chat"
            aria-label="Back to conversations"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-950"
          >
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
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <div className="min-w-0">
            <h1 className="truncate font-semibold text-slate-950">Chat</h1>
            <p className="truncate text-slate-400 text-xs">
              {activeThreadId
                ? "Continuing a saved conversation"
                : "Ask questions from your documents"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ConversationSwitcher activeThreadId={activeThreadId} />
          <button
            type="button"
            onClick={startNewChat}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-slate-600 text-sm transition-colors hover:bg-slate-50"
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

      {/* Messages area */}
      <section className="min-h-0 flex-1 overflow-y-auto">
        {loadingHistory ? (
          <div className="mx-auto max-w-2xl space-y-4 px-6 py-6">
            <div className="h-10 animate-pulse rounded-2xl bg-slate-100" />
            <div className="ml-auto h-10 max-w-[60%] animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center px-6 py-12">
            <div className="w-full max-w-sm text-center">
              <p className="font-semibold text-slate-950">How can I help?</p>
              <p className="mt-2 text-slate-400 text-sm">
                Ask anything about your uploaded documents.
              </p>
              <div className="mt-6 flex flex-col gap-2">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-left text-slate-600 text-sm transition-colors hover:bg-slate-50"
                    onClick={() => fillPrompt(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-5 px-6 py-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex flex-col gap-3",
                  message.role === "user" ? "items-end" : "items-start",
                )}
              >
                <div
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-950 font-bold text-[10px] text-white">
                      D
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[78%] whitespace-pre-wrap text-sm leading-7",
                      message.role === "user"
                        ? "rounded-2xl bg-slate-950 px-4 py-3 text-white"
                        : "text-slate-700",
                    )}
                  >
                    {message.content}
                  </div>
                </div>

                {/* Source documents + token usage for assistant messages */}
                {message.role === "assistant" && (
                  <div className="ml-9 space-y-2">
                    {message.sourceDocuments &&
                      message.sourceDocuments.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mr-1">
                            Sources
                          </span>
                          {message.sourceDocuments.map((url, idx) => {
                            const displayName = `Source ${idx + 1}`;
                            return (
                              <a
                                key={`${message.id}-src-${idx}`}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
                                title={url}
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-3.5 w-3.5 shrink-0 text-slate-500"
                                  aria-hidden="true"
                                >
                                  <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                                  <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                                </svg>
                                {displayName}
                              </a>
                            );
                          })}
                        </div>
                      )}

                    {message.usage && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <svg
                          viewBox="0 0 16 16"
                          fill="currentColor"
                          className="h-3 w-3 shrink-0"
                          aria-hidden="true"
                        >
                          <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z" />
                        </svg>
                        <span>
                          {message.usage.total_tokens.toLocaleString()} tokens
                          (prompt:{" "}
                          {message.usage.prompt_tokens.toLocaleString()},
                          completion:{" "}
                          {message.usage.completion_tokens.toLocaleString()})
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Overall Token Usage Display at the end */}
            {!loading && usage && (
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-250 px-4 py-3 text-xs text-slate-500 max-w-fit ml-auto shadow-sm">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 shrink-0 text-slate-400"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>
                  <span className="font-semibold text-slate-700">Overall Usage:</span>{" "}
                  <span className="font-bold text-slate-900">{usage.total_tokens.toLocaleString()}</span> tokens (Prompt: {usage.prompt_tokens.toLocaleString()}, Completion: {usage.completion_tokens.toLocaleString()})
                </span>
              </div>
            )}

            {loading && (
              <div className="flex gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-950 font-bold text-[10px] text-white">
                  D
                </div>
                <div className="flex items-center gap-1.5 py-2">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </section>

      {/* Input footer */}
      <div className="shrink-0 border-slate-100 border-t bg-white px-6 py-4">
        <div className="mx-auto max-w-2xl">
          {error && (
            <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={onSubmit} className="relative">
            <Textarea
              ref={inputRef}
              placeholder="Ask anything about your uploaded documents..."
              className="min-h-[52px] resize-none rounded-2xl border-slate-200 pr-14 text-sm"
              disabled={loading}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
            />
            <button
              type="submit"
              disabled={loading}
              aria-label="Send message"
              className="absolute right-3 bottom-3 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 text-white transition-opacity disabled:opacity-40"
            >
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.154.75.75 0 0 0 0-1.115A28.897 28.897 0 0 0 3.105 2.288Z" />
              </svg>
            </button>
          </form>
          <p className="mt-2 text-center text-slate-400 text-xs">
            Answers are generated from your uploaded documents.
          </p>
        </div>
      </div>
    </div>
  );
}
