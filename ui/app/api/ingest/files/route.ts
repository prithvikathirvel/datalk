import type { DocumentFile } from "@template/contracts";
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

  return proxyJson<DocumentFile[]>(
    joinUrl(backendUrls.ingestion, "/rag/api/v1/documents/get-files"),
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );
}
