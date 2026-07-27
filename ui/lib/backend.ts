import { NextResponse } from "next/server";
import { appConfig } from "./env";
import { getAuthToken } from "./session";

export function joinUrl(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export async function getBearerTokenOrResponse() {
  const token = await getAuthToken();
  if (!token) {
    return {
      token: null,
      response: NextResponse.json({ detail: "Unauthorized" }, { status: 401 }),
    };
  }
  return { token, response: null };
}

/**
 * FastAPI returns `detail` as a string for HTTPException but as an array of
 * `{loc, msg, type}` objects for 422 validation errors. The UI renders
 * `detail` directly, so collapse the array form into a readable sentence.
 */
export function normalizeDetail(detail: unknown): string | undefined {
  if (typeof detail === "string") {
    return detail;
  }
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item === "string") return item;
        const entry = item as { msg?: string; loc?: unknown[] };
        if (!entry?.msg) return null;
        const field = Array.isArray(entry.loc)
          ? entry.loc.filter((part) => part !== "body").join(".")
          : "";
        return field ? `${field}: ${entry.msg}` : entry.msg;
      })
      .filter(Boolean);
    return messages.length ? messages.join(" · ") : undefined;
  }
  return undefined;
}

export async function readBackendError(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      const data = (await response.json()) as {
        detail?: unknown;
        message?: string;
      };
      return (
        normalizeDetail(data.detail) ??
        data.message ??
        `Backend returned ${response.status}`
      );
    } catch {
      return `Backend returned ${response.status}`;
    }
  }
  const text = await response.text();
  return text || `Backend returned ${response.status}`;
}

export async function proxyJson<T>(
  url: string,
  init: RequestInit,
  fallbackStatus = 502,
) {
  console.log(`[backend] fetch → ${init.method ?? "GET"} ${url}`);
  try {
    const response = await fetch(url, init);
    console.log(`[backend] response ← ${response.status} ${url}`);
    const contentType = response.headers.get("content-type") ?? "";
    const data = contentType.includes("application/json")
      ? ((await response.json()) as T)
      : ((await response.text()) as T);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(`[backend] error fetching ${url}:`, error);
    return NextResponse.json(
      {
        detail:
          error instanceof Error
            ? error.message
            : "Unable to reach backend service",
      },
      { status: fallbackStatus },
    );
  }
}

export const backendUrls = {
  ingestion: appConfig.ingestionApiBaseUrl,
  chat: appConfig.chatApiBaseUrl,
  embed: appConfig.embedApiBaseUrl,
};

/** All embed endpoints live under `<EMBED_BASE_URL>/chat/api/v1/embed`. */
export function embedUrl(path: string) {
  return joinUrl(
    backendUrls.embed,
    `/chat/api/v1/embed/${path.replace(/^\//, "")}`,
  );
}

console.log("[backend] ingestion base URL:", backendUrls.ingestion);
console.log("[backend] chat base URL:", backendUrls.chat);
console.log("[backend] embed base URL:", backendUrls.embed);
