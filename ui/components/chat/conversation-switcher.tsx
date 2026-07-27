"use client";

import { cn } from "@template/ui";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useConversations } from "@/components/chat/use-conversations";
import { formatRelativeTime } from "@/lib/format";

/**
 * Compact dropdown that lets the user jump between conversations without
 * leaving the chat screen.
 */
export function ConversationSwitcher({
  activeThreadId,
}: {
  activeThreadId: string | null;
}) {
  const router = useRouter();
  const { conversations, loading, reload } = useConversations({ auto: false });
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    void reload();

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, reload]);

  const recent = useMemo(() => conversations.slice(0, 8), [conversations]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-slate-600 text-sm transition-colors hover:bg-slate-50"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
        <span className="hidden sm:inline">History</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn("h-3 w-3 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-slate-100 border-b px-4 py-2.5">
            <p className="font-medium text-slate-950 text-xs uppercase tracking-wide">
              Recent chats
            </p>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push("/chat");
              }}
              className="text-slate-500 text-xs transition-colors hover:text-slate-950"
            >
              View all
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && recent.length === 0 ? (
              <div className="space-y-2 p-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-10 animate-pulse rounded-lg bg-slate-100"
                  />
                ))}
              </div>
            ) : recent.length === 0 ? (
              <p className="px-4 py-6 text-center text-slate-400 text-xs">
                No conversations yet.
              </p>
            ) : (
              <div className="p-1.5">
                {recent.map((conversation) => {
                  const active = conversation.thread_id === activeThreadId;
                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        router.push(
                          `/chat/${encodeURIComponent(conversation.thread_id)}`,
                        );
                      }}
                      className={cn(
                        "flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
                        active
                          ? "bg-slate-100 text-slate-950"
                          : "text-slate-600 hover:bg-slate-50",
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-sm">
                          {conversation.title || "Untitled conversation"}
                        </span>
                        <span className="block truncate text-slate-400 text-xs">
                          {formatRelativeTime(conversation.created_at)}
                        </span>
                      </span>
                      {active && (
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-950" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-slate-100 border-t p-1.5">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push("/chat/new");
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-slate-600 text-sm transition-colors hover:bg-slate-50"
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
      )}
    </div>
  );
}
