/**
 * Client-safe parsing of API error bodies.
 *
 * FastAPI returns `detail` as a plain string for `HTTPException`s but as an
 * array of `{loc, msg, type, input}` objects for 422 validation errors.
 * Components rendered that array directly, which crashes React with
 * "Objects are not valid as a React child". Always run backend error bodies
 * through these helpers before putting them into state.
 */

export function normalizeApiDetail(detail: unknown): string | undefined {
  if (typeof detail === "string") {
    return detail;
  }
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item === "string") return item;
        const entry = item as { msg?: string; loc?: unknown; input?: unknown };
        if (!entry?.msg) return null;
        const field = Array.isArray(entry.loc)
          ? entry.loc
              .filter((part) => part !== "body" && part !== "query")
              .join(".")
          : "";
        return field ? `${field}: ${entry.msg}` : entry.msg;
      })
      .filter(Boolean);
    return messages.length ? messages.join(" · ") : undefined;
  }
  if (detail && typeof detail === "object") {
    const entry = detail as { msg?: string; message?: string };
    return entry.msg ?? entry.message;
  }
  return undefined;
}

/**
 * Reads a failed (or any) response body and always returns a plain,
 * render-safe string. Works for JSON and non-JSON error bodies.
 */
export async function readApiError(
  response: Response,
  fallback = "Request failed.",
): Promise<string> {
  const data = (await response.json().catch(() => null)) as {
    detail?: unknown;
    message?: string;
  } | null;

  if (data) {
    const normalized =
      normalizeApiDetail(data.detail) ??
      (typeof data.message === "string" ? data.message : undefined);
    if (normalized) return normalized;
  }
  return `${fallback} (HTTP ${response.status})`.trim();
}
