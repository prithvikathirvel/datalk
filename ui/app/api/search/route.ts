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
  const userId = url.searchParams.get("user_id");
  const documentIds = url.searchParams.getAll("document_ids");

  if (!query) {
    return NextResponse.json({ detail: "query is required." }, { status: 400 });
  }

  const backendParams = new URLSearchParams();
  backendParams.set("query", query);
  backendParams.set("top_k", topK);
  if (userId) backendParams.set("user_id", userId);
  for (const docId of documentIds) {
    backendParams.append("document_ids", docId);
  }

  return proxyJson<SearchResponse>(
    joinUrl(
      backendUrls.ingestion,
      `/search/search?${backendParams.toString()}`,
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
