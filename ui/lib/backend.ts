import { NextResponse } from "next/server";
import { appConfig } from "./env";
import { getAuthToken } from "./session";

export function joinUrl(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export async function getBearerTokenOrResponse() {
  //  const token = await getAuthToken();
  const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJkYXRhbGsiLCJpYXQiOjE3NzQ3ODk1NjUsImV4cCI6MTgwNjMyNTU2NSwiYXVkIjoiZGF0YWxrLWFwaSIsInN1YiI6ImRkMzdmMWMwLTljYzAtNDYxMi1iMTUwLTAzYjE4OWRlNWVhOSIsIm5hbWUiOiJQcml0aHZpIFBLIiwiZW1haWwiOiJwcml0aHZpb2ZmaWNpYWwwMkBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4ifQ.1NzKr7lQ5BdtHBQzyv3QZAVXuycD6zivELEJ0XBbH1w";
  if (!token) {
    return {
      token: null,
      response: NextResponse.json({ detail: "Unauthorized" }, { status: 401 }),
    };
  }
  return { token, response: null };
}

export async function readBackendError(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      const data = (await response.json()) as {
        detail?: string;
        message?: string;
      };
      return (
        data.detail ?? data.message ?? `Backend returned ${response.status}`
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
  try {
    const response = await fetch(url, init);
    const contentType = response.headers.get("content-type") ?? "";
    const data = contentType.includes("application/json")
      ? ((await response.json()) as T)
      : ((await response.text()) as T);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
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
};
