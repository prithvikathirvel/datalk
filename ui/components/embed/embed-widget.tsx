"use client";

import type { ChatResponse, EmbedConfig } from "@template/contracts";
import { Button, Input, Textarea } from "@template/ui";
import { type FormEvent, useEffect, useRef, useState } from "react";

interface WidgetMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sourceDocuments?: string[];
}

function makeMessage(
  role: WidgetMessage["role"],
  content: string,
  sourceDocuments?: string[],
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
  const [feedbackStatus, setFeedbackStatus] = useState<string | null>(null);
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
      makeMessage("assistant", data.final_response, data.source_documents),
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
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5 max-w-[85%]">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400 mr-0.5">
                      Sources
                    </span>
                    {message.sourceDocuments.map((url, idx) => {
                      const displayName = `Source ${idx + 1}`;
                      return (
                        <a
                          key={`src-${message.id}-${idx}`}
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
        {config.suggestedQuestions.length ? (
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

        {config.collectVisitorEmail ? (
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email (optional)"
            className="mb-2 text-sm"
          />
        ) : null}

        <form onSubmit={onSubmit} className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
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
          {config.showPoweredBy === false ? (
            <span />
          ) : (
            <span className="text-slate-400">Powered by Datalk</span>
          )}
          <div className="flex gap-2">
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
