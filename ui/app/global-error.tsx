"use client";

/**
 * Root-layout error fallback. This is the ONLY boundary that replaces the
 * root <html> and <body> — it must render the full document shell itself.
 * Keep styles inline: the app's CSS may be the thing that failed to load.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        <main
          style={{
            display: "flex",
            minHeight: "100vh",
            alignItems: "center",
            justifyContent: "center",
            background: "#f8fafc",
            padding: 16,
          }}
        >
          <div
            style={{
              maxWidth: 420,
              borderRadius: 24,
              border: "1px solid #e2e8f0",
              background: "#ffffff",
              padding: 32,
              textAlign: "center",
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 600,
                color: "#0f172a",
              }}
            >
              Something went wrong
            </h1>
            <p style={{ marginTop: 12, fontSize: 14, color: "#64748b" }}>
              {error.message || "An unexpected error occurred."}
            </p>
            {error.digest ? (
              <p
                style={{
                  marginTop: 8,
                  fontSize: 11,
                  fontFamily: "ui-monospace, monospace",
                  color: "#94a3b8",
                }}
              >
                Error ID: {error.digest}
              </p>
            ) : null}
            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: 24,
                border: "none",
                borderRadius: 12,
                background: "#0f172a",
                color: "#ffffff",
                padding: "10px 20px",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
