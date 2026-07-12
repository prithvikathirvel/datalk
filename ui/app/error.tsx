"use client";

import { Button } from "@template/ui";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
          <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="font-semibold text-2xl text-slate-950">
              Something went wrong
            </h1>
            <p className="mt-3 text-slate-500 text-sm">
              {error.message || "An unexpected error occurred."}
            </p>
            <Button className="mt-6" onClick={reset}>
              Try again
            </Button>
          </div>
        </main>
      </body>
    </html>
  );
}
