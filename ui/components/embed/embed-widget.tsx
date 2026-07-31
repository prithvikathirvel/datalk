"use client";

import type { ChatResponse, EmbedConfig } from "@template/contracts";
import { Button, Textarea } from "@template/ui";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { normalizeSourceDocuments } from "@/lib/source-documents";

interface WidgetMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sourceDocuments?: ReturnType<typeof normalizeSourceDocuments>;
}

function makeMessage(
  role: WidgetMessage["role"],
  content: string,
  sourceDocuments?: WidgetMessage["sourceDocuments"],
): WidgetMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
    sourceDocuments,
  };
}

async function readError(response: Response) {
  const data = (await response.json().catch(() => null)) as {
    detail?: string;
  } | null;
  return data?.detail ?? "Something went wrong.";
}

export function EmbedWidget({
  config,
  apiKey,
  parentOrigin,
  pageUrl,
}: {
  config: EmbedConfig;
  apiKey: string;
  parentOrigin?: string;
  pageUrl?: string;
}) {
  const [messages, setMessages] = useState<WidgetMessage[]>([
    makeMessage("assistant", config.welcomeMessage),
  ]);
  const [input, setInput] = useState("");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [emailOpen, setEmailOpen] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<string | null>(null);
  // Suggested questions are a conversation starter — they disappear the
  // moment the visitor sends their first message.
  const [hasConversation, setHasConversation] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedThreadId = window.localStorage.getItem(
      `datalk-widget-thread-${config.id}`,
    );
    if (storedThreadId) setThreadId(storedThreadId);
  }, [config.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(messageText: string) {
    const message = messageText.trim();
    if (!message || loading) return;

    setInput("");
    setError(null);
    setFeedbackStatus(null);
    setLoading(true);
    setHasConversation(true);
    setMessages((current) => [...current, makeMessage("user", message)]);

    const response = await fetch("/api/embed/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify({
        message,
        thread_id: threadId ?? undefined,
        visitor_email: email || undefined,
        page_url: pageUrl,
      }),
    });

    setLoading(false);
    if (!response.ok) {
      setError(await readError(response));
      setMessages((current) => [
        ...current,
        makeMessage("assistant", config.fallbackMessage),
      ]);
      return;
    }

    const data = (await response.json()) as ChatResponse;
    setThreadId(data.thread_id);
    window.localStorage.setItem(
      `datalk-widget-thread-${config.id}`,
      data.thread_id,
    );
    setMessages((current) => [
      ...current,
      makeMessage(
        "assistant",
        data.final_response,
        normalizeSourceDocuments(data.source_documents),
      ),
    ]);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await sendMessage(input);
  }

  async function submitFeedback(reason: "not_helpful" | "needs_human") {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const lastAssistant = [...messages]
      .reverse()
      .find((m) => m.role === "assistant");
    if (!lastUser) return;

    const response = await fetch("/api/embed/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify({
        threadId,
        question: lastUser.content,
        answer: lastAssistant?.content,
        visitorEmail: email || undefined,
        pageUrl,
        parentOrigin,
        reason,
      }),
    });

    setFeedbackStatus(
      response.ok
        ? "Thanks — this was added to the knowledge gap inbox."
        : await readError(response),
    );
  }

  function closeWidget() {
    window.parent?.postMessage({ type: "datalk-close" }, "*");
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
            style={{ backgroundColor: config.primaryColor }}
          >
            {config.avatarInitials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-950">
              {config.botName}
            </p>
            <p className="text-xs text-slate-400">
              {config.botDescription || "Online · answers from documents"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={closeWidget}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-6 ${
                  message.role === "user"
                    ? "rounded-tr-sm text-white"
                    : "rounded-tl-sm border border-slate-100 bg-slate-50 text-slate-700"
                }`}
                style={
                  message.role === "user"
                    ? { backgroundColor: config.primaryColor }
                    : undefined
                }
              >
                {message.content}
              </div>

              {/* Source documents for assistant messages */}
              {message.role === "assistant" &&
                message.sourceDocuments &&
                message.sourceDocuments.length > 0 && (
                  <div className="mt-2 flex flex-wrap items-center gap-1 max-w-[85%]">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      Sources
                    </span>
                    {message.sourceDocuments.map((source, idx) => (
                      <a
                        key={`src-${message.id}-${idx}`}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
                        title={source.title}
                      >
                        <svg
                          viewBox="0 0 16 16"
                          fill="currentColor"
                          className="h-2.5 w-2.5 shrink-0 text-slate-400"
                          aria-hidden="true"
                        >
                          <path d="M6.354 5.5H4a3 3 0 0 0 0 6h3a3 3 0 0 0 2.83-4H9c-.086 0-.17.01-.25.031A2 2 0 0 1 7 10.5H4a2 2 0 1 1 0-4h1.535c.218-.376.495-.714.82-1z" />
                          <path d="M9 5.5a3 3 0 0 0-2.83 4h1.098A2 2 0 0 1 9 6.5h3a2 2 0 1 1 0 4h-1.535a4.02 4.02 0 0 1-.82 1H12a3 3 0 1 0 0-6H9z" />
                        </svg>
                        {source.label}
                      </a>
                    ))}
                  </div>
                )}
            </div>
          ))}
          {loading ? (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-tl-sm border border-slate-100 bg-slate-50 px-3.5 py-2 text-sm text-slate-500">
                Searching documents...
              </div>
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-slate-100 px-4 py-3">
        {!hasConversation && config.suggestedQuestions.length ? (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {config.suggestedQuestions.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => void sendMessage(question)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 hover:bg-slate-50"
              >
                {question}
              </button>
            ))}
          </div>
        ) : null}

        {error ? <p className="mb-2 text-xs text-red-600">{error}</p> : null}
        {feedbackStatus ? (
          <p className="mb-2 text-xs text-emerald-600">{feedbackStatus}</p>
        ) : null}

        {config.collectVisitorEmail && emailOpen ? (
          <div className="mb-2 flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 transition-colors focus-within:border-slate-300">
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3 w-3 shrink-0 text-slate-400"
              aria-hidden="true"
            >
              <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" />
              <path d="m2.5 5 5.5 3.5L13.5 5" />
            </svg>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email for follow-up (optional)"
              className="h-full min-w-0 flex-1 bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
              aria-label="Your email (optional)"
            />
            <button
              type="button"
              onClick={() => setEmailOpen(false)}
              className="shrink-0 rounded p-0.5 text-slate-400 hover:text-slate-700"
              aria-label="Hide email field"
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="h-3 w-3"
                aria-hidden="true"
              >
                <path d="m4 4 8 8M12 4l-8 8" />
              </svg>
            </button>
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={config.inputPlaceholder || "Ask a question..."}
            className="min-h-12 flex-1 resize-none rounded-2xl text-sm"
            disabled={loading}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            style={{ backgroundColor: config.primaryColor }}
          >
            Send
          </Button>
        </form>

        <div className="mt-2 flex items-center justify-between gap-2 text-xs">
          <span className="flex min-w-0 items-center gap-2">
            {config.showPoweredBy === false ? null : (
              <span className="shrink-0 text-slate-400">Powered by Datalk</span>
            )}
            {config.collectVisitorEmail && !emailOpen ? (
              email ? (
                <button
                  type="button"
                  onClick={() => setEmailOpen(true)}
                  className="flex min-w-0 items-center gap-1 truncate text-emerald-600 hover:text-emerald-700"
                  title={`Email saved: ${email}`}
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-3 w-3 shrink-0"
                    aria-hidden="true"
                  >
                    <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
                  </svg>
                  <span className="truncate">{email}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setEmailOpen(true)}
                  className="shrink-0 text-slate-500 underline decoration-slate-300 underline-offset-2 hover:text-slate-900"
                >
                  Add email for follow-up
                </button>
              )
            ) : null}
          </span>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => void submitFeedback("not_helpful")}
              className="text-slate-500 hover:text-slate-950"
            >
              Not helpful
            </button>
            <button
              type="button"
              onClick={() => void submitFeedback("needs_human")}
              className="text-slate-500 hover:text-slate-950"
            >
              Human help
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
