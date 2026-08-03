"use client";

import { Button } from "@template/ui";

/**
 * Route-segment error boundary. This renders INSIDE the root layout's
 * <body>, so it must never output its own <html>/<body> tags — doing so
 * produces the "html cannot be a child of body" hydration error. The
 * full-document fallback for failures in the root layout itself lives in
 * app/global-error.tsx.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-red-500"
            aria-hidden="true"
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <h1 className="font-semibold text-2xl text-slate-950">
          Something went wrong
        </h1>
        <p className="mt-3 break-words text-slate-500 text-sm">
          {error.message || "An unexpected error occurred."}
        </p>
        {error.digest ? (
          <p className="mt-2 font-mono text-[11px] text-slate-400">
            Error ID: {error.digest}
          </p>
        ) : null}
        <Button className="mt-6" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}
