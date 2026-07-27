import type { ConversationSummary } from "@template/contracts";
import {
  backendUrls,
  getBearerTokenOrResponse,
  joinUrl,
  proxyJson,
} from "@/lib/backend";

export async function GET() {
  const { token, response } = await getBearerTokenOrResponse();
  if (response) {
    return response;
  }

  return proxyJson<ConversationSummary[]>(
    joinUrl(backendUrls.chat, "/chat/api/v1/conversations"),
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );
}
