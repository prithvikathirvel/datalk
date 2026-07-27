import type {
  ApiKey,
  EmbedConfigSource,
  RotateApiKeyResponse,
} from "@template/contracts";

/**
 * Client helpers for the API-key and source-scoping endpoints.
 *
 * These routes are delivered by the backend phases of the embed plan
 * (Postgres + real key auth). Until they ship, the calls 404. Rather than
 * surfacing a raw "Request failed" to the user, `PENDING_BACKEND` lets the UI
 * render an explicit "not available yet" state.
 */
export const PENDING_BACKEND = "PENDING_BACKEND" as const;

export class EmbedApiError extends Error {
  readonly status: number;
  /** True when the endpoint itself is missing, not when the request was bad. */
  readonly pending: boolean;

  constructor(message: string, status: number, pending = false) {
    super(message);
    this.name = "EmbedApiError";
    this.status = status;
    this.pending = pending;
  }
}

async function readDetail(response: Response) {
  const data = (await response.json().catch(() => null)) as {
    detail?: string;
    message?: string;
  } | null;
  return (
    data?.detail ?? data?.message ?? `Request failed (${response.status}).`
  );
}

/**
 * A 404 on these routes is ambiguous: either the endpoint does not exist yet,
 * or the chatbot was deleted. The backend returns a `detail` for real
 * not-found cases, so a bodyless 404 is treated as "route not deployed".
 */
async function toError(response: Response) {
  const detail = await readDetail(response);
  const routeMissing =
    response.status === 404 && detail.startsWith("Request failed");
  return new EmbedApiError(detail, response.status, routeMissing);
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { cache: "no-store", ...init });
  } catch {
    throw new EmbedApiError("Unable to reach the server.", 0, false);
  }
  if (!response.ok) {
    throw await toError(response);
  }
  return (await response.json()) as T;
}

// ─── API keys ────────────────────────────────────────────────────────────────

export async function fetchApiKeys(botId: string): Promise<ApiKey[]> {
  const data = await requestJson<{ keys?: ApiKey[] } | ApiKey[]>(
    `/api/embed/configs/${encodeURIComponent(botId)}/keys`,
  );
  return Array.isArray(data) ? data : (data.keys ?? []);
}

export async function rotateApiKey(
  botId: string,
): Promise<RotateApiKeyResponse> {
  return requestJson<RotateApiKeyResponse>(
    `/api/embed/configs/${encodeURIComponent(botId)}/rotate-key`,
    { method: "POST" },
  );
}

// ─── Source documents ────────────────────────────────────────────────────────

export async function fetchSources(
  botId: string,
): Promise<EmbedConfigSource[]> {
  const data = await requestJson<
    { sources?: EmbedConfigSource[] } | EmbedConfigSource[]
  >(`/api/embed/configs/${encodeURIComponent(botId)}/sources`);
  return Array.isArray(data) ? data : (data.sources ?? []);
}

/**
 * Replace-all save: sends the complete checked list and lets the backend diff.
 * An empty list clears every source, reverting the bot to "all documents".
 */
export async function saveSources(
  botId: string,
  documents: Array<{ documentId: string; documentFilename: string }>,
): Promise<EmbedConfigSource[]> {
  if (documents.length === 0) {
    await requestJson<unknown>(
      `/api/embed/configs/${encodeURIComponent(botId)}/sources`,
      { method: "DELETE" },
    );
    return [];
  }

  const data = await requestJson<
    { sources?: EmbedConfigSource[] } | EmbedConfigSource[]
  >(`/api/embed/configs/${encodeURIComponent(botId)}/sources`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ documents }),
  });
  return Array.isArray(data) ? data : (data.sources ?? []);
}

/** Masks a key prefix for display, e.g. "dk_live_a1b2••••••••". */
export function maskKey(prefix: string) {
  return `${prefix}${"•".repeat(20)}`;
}
