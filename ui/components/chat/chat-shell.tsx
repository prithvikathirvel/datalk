"use client";

import type { ChatResponse, ConversationResponse } from "@template/contracts";
import { Textarea, cn } from "@template/ui";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { type LocalChatMessage, useChatStore } from "@/stores/chat-store";

const storageKey = "rag-saas-thread-id";

function createMessage(
  role: LocalChatMessage["role"],
  content: string,
): LocalChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

async function readError(response: Response) {
  const data = (await response.json().catch(() => null)) as {
    detail?: string;
    message?: string;
  } | null;
  return data?.detail ?? data?.message ?? "Request failed.";
}

const SUGGESTED_PROMPTS = [
  "Summarize my uploaded documents",
  "What are the key obligations?",
  "Find the termination terms",
];

export function ChatShell() {
  const { threadId, messages, setThreadId, addMessage, setMessages, reset } =
    useChatStore();
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedThreadId = window.localStorage.getItem(storageKey);
    if (storedThreadId) {
      setThreadId(storedThreadId);
      void loadConversation(storedThreadId);
    }
  }, [setThreadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function loadConversation(nextThreadId: string) {
    setLoadingHistory(true);
    setError(null);
    const response = await fetch(
      `/api/chat/conversation?thread_id=${encodeURIComponent(nextThreadId)}`,
      { cache: "no-store" },
    );
    setLoadingHistory(false);
    if (!response.ok) {
      window.localStorage.removeItem(storageKey);
      setThreadId(null);
      return;
    }
    const data = (await response.json()) as ConversationResponse;
    setMessages(
      data.conversation
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({
          id: String(m.id),
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
          createdAt: data.created_at ?? new Date().toISOString(),
        })),
    );
  }

  async function submitMessage(messageText: string) {
    const message = messageText.trim();
    if (!message || loading) return;

    if (inputRef.current) inputRef.current.value = "";
    setError(null);
    setLoading(true);
    addMessage(createMessage("user", message));

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, thread_id: threadId ?? undefined }),
    });

    setLoading(false);
    if (!response.ok) {
      setError(await readError(response));
      return;
    }

    const data = (await response.json()) as ChatResponse;
    setThreadId(data.thread_id);
    window.localStorage.setItem(storageKey, data.thread_id);
    addMessage(createMessage("assistant", data.final_response));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitMessage(inputRef.current?.value ?? "");
  }

  function startNewChat() {
    reset();
    window.localStorage.removeItem(storageKey);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function fillPrompt(prompt: string) {
    if (inputRef.current) {
      inputRef.current.value = prompt;
      inputRef.current.focus();
    }
  }

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col overflow-hidden bg-white lg:h-screen">
      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h1 className="font-semibold text-slate-950">Chat</h1>
          <p className="text-slate-400 text-xs">
            Ask questions from your documents
          </p>
        </div>
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
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                {message.role === "assistant" && (
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-950 font-bold text-white text-[10px]">
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
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-950 font-bold text-white text-[10px]">
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
      <div className="shrink-0 border-t border-slate-100 bg-white px-6 py-4">
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
              className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 text-white transition-opacity disabled:opacity-40"
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


