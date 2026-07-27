import type {
  ApiKey,
  EmbedConfigSource,
  RotateApiKeyResponse,
} from "@template/contracts";

/** Client helpers for the embed API-key and source-scoping endpoints. */

export class EmbedApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "EmbedApiError";
    this.status = status;
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

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { cache: "no-store", ...init });
  } catch {
    throw new EmbedApiError("Unable to reach the server.", 0);
  }
  if (!response.ok) {
    throw new EmbedApiError(await readDetail(response), response.status);
  }
  return (await response.json()) as T;
}

// ─── API keys ────────────────────────────────────────────────────────────────

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
 * Replace-all save. The BFF clears existing rows before inserting, since the
 * backend's POST only upserts. An empty list clears scoping entirely,
 * reverting the chatbot to searching all documents.
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

export type { ApiKey };
