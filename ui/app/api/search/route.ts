import type { SearchResponse } from "@template/contracts";
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
  const query = url.searchParams.get("query");
  const topK = url.searchParams.get("top_k") ?? "5";
  if (!query) {
    return NextResponse.json({ detail: "query is required." }, { status: 400 });
  }

  return proxyJson<SearchResponse>(
    joinUrl(
      backendUrls.ingestion,
      `/search/search?query=${encodeURIComponent(query)}&top_k=${encodeURIComponent(topK)}`,
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
