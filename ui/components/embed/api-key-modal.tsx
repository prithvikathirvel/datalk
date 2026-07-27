"use client";

import { Button } from "@template/ui";
import { useEffect, useRef, useState } from "react";

/**
 * One-time reveal of a freshly generated API key. The raw key only exists in
 * this component's props — once dismissed it cannot be recovered, so the
 * dialog blocks accidental dismissal (no backdrop-click close) and nudges the
 * user to copy first.
 */
export function ApiKeyModal({
  apiKey,
  title = "Your API key",
  description = "Copy this key now — for your security it will not be shown again.",
  onClose,
}: {
  apiKey: string;
  title?: string;
  description?: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    closeRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function copyKey() {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setCopyFailed(false);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard is unavailable over plain HTTP or without permission —
      // the key stays selectable so the user can copy it manually.
      setCopyFailed(true);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="api-key-modal-title"
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-amber-500"
            aria-hidden="true"
          >
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
          </svg>
        </div>

        <h3
          id="api-key-modal-title"
          className="font-semibold text-slate-950 text-sm"
        >
          {title}
        </h3>
        <p className="mt-1.5 text-[13px] text-slate-500">{description}</p>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <code className="block break-all font-mono text-[12px] text-slate-800 leading-relaxed">
            {apiKey}
          </code>
        </div>

        {copyFailed && (
          <p className="mt-2 text-amber-700 text-xs">
            Could not access the clipboard — select the key above and copy it
            manually.
          </p>
        )}

        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
            aria-hidden="true"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <p className="text-[13px] text-amber-800 leading-relaxed">
            Store it in a password manager or your deployment secrets. Anyone
            with this key can run your chatbot on their site.
          </p>
        </div>

        <div className="mt-5 flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => void copyKey()}
          >
            {copied ? "Copied!" : "Copy key"}
          </Button>
          <Button
            ref={closeRef}
            type="button"
            className="flex-1"
            onClick={onClose}
          >
            I've saved it
          </Button>
        </div>
      </div>
    </div>
  );
}
