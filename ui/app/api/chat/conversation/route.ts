import type { ConversationResponse } from "@template/contracts";
import { NextResponse } from "next/server";
import {
  backendUrls,
  getBearerTokenOrResponse,
  joinUrl,
  proxyJson,
} from "@/lib/backend";

export async function GET(request: Request) {
  const { token, response } = await getBearerTokenOrResponse();
  if (response) {
    return response;
  }

  const url = new URL(request.url);
  const threadId = url.searchParams.get("thread_id");
  if (!threadId) {
    return NextResponse.json(
      { detail: "thread_id is required." },
      { status: 400 },
    );
  }

  return proxyJson<ConversationResponse>(
    joinUrl(
      backendUrls.chat,
      `/chat/get-conversation?thread_id=${encodeURIComponent(threadId)}`,
    ),
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );
}
