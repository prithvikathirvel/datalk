import type { ChatRequest, ChatResponse } from "@template/contracts";
import {
  backendUrls,
  getBearerTokenOrResponse,
  joinUrl,
  proxyJson,
} from "@/lib/backend";

export async function POST(request: Request) {
  const { token, response } = await getBearerTokenOrResponse();
  if (response) {
    return response;
  }

  const body = (await request.json()) as ChatRequest;
  return proxyJson<ChatResponse>(joinUrl(backendUrls.chat, "/chat/chat"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}
