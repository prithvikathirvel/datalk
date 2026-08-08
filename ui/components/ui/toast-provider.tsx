"use client";

import { cn } from "@template/ui";
import { useEffect, useRef } from "react";
import {
  type Toast,
  toast as toastApi,
  useToastStore,
} from "@/stores/toast-store";

const DURATION_BY_TYPE: Record<Toast["type"], number> = {
  success: 4000,
  error: 7000,
  info: 5000,
};

function ToastIcon({ type }: { type: Toast["type"] }) {
  if (type === "success") {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 text-emerald-600"
          aria-hidden="true"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </span>
    );
  }
  if (type === "error") {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-50 ring-1 ring-red-200">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 text-red-600"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </span>
    );
  }
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-50 ring-1 ring-sky-200">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 text-sky-600"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    </span>
  );
}

function ToastCard({ item }: { item: Toast }) {
  const duration = DURATION_BY_TYPE[item.type];

  // Auto-dismiss after the type-specific duration.
  useEffect(() => {
    const timer = window.setTimeout(() => toastApi.dismiss(item.id), duration);
    return () => window.clearTimeout(timer);
  }, [item.id, duration]);

  const accent =
    item.type === "success"
      ? "border-emerald-200"
      : item.type === "error"
        ? "border-red-200"
        : "border-sky-200";

  return (
    <div
      role={item.type === "error" ? "alert" : "status"}
      aria-live={item.type === "error" ? "assertive" : "polite"}
      className={cn(
        "dk-toast-in pointer-events-auto flex w-[min(92vw,360px)] items-start gap-3 rounded-xl border bg-white p-3.5 shadow-lg shadow-slate-900/5",
        accent,
      )}
    >
      <ToastIcon type={item.type} />
      <div className="min-w-0 flex-1 pt-0.5">
        {item.title && (
          <p className="text-[13px] font-semibold text-slate-950 leading-5">
            {item.title}
          </p>
        )}
        <p className="text-[13px] leading-5 text-slate-600 break-words">
          {item.message}
        </p>
      </div>
      <button
        type="button"
        onClick={() => toastApi.dismiss(item.id)}
        aria-label="Dismiss notification"
        className="shrink-0 rounded-md p-1 text-slate-300 transition-colors hover:bg-slate-50 hover:text-slate-600"
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      </button>
    </div>
  );
}

/**
 * Global toast viewport — fixed to the bottom-right corner of the screen.
 * Mounted once in the root layout so toasts work on every page (auth, app,
 * admin). Stacked newest-last with a subtle slide/fade entrance.
 */
export function ToastProvider() {
  const toasts = useToastStore((state) => state.toasts);
  const ref = useRef<HTMLDivElement>(null);

  // Shift newly-arrived toasts into view even when the container is nested in
  // an overflow-hidden layout — position: fixed inside such a tree would
  // otherwise be clipped by an ancestor.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Re-append to document.body keeps the viewport above app shells.
    if (el.parentElement !== document.body) {
      document.body.appendChild(el);
    }
  }, []);

  return (
    <section
      ref={ref}
      aria-label="Notifications"
      className="pointer-events-none fixed right-4 bottom-4 z-[9999] flex w-auto flex-col items-end gap-2"
    >
      {toasts.map((item) => (
        <ToastCard key={item.id} item={item} />
      ))}
    </section>
  );
}
