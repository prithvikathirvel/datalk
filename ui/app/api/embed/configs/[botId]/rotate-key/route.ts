import { NextResponse } from "next/server";
import {
  embedUrl,
  getBearerTokenOrResponse,
  readBackendError,
} from "@/lib/backend";
import { type BackendApiKeyCreated, toApiKey } from "@/lib/embed-mappers";

export async function POST(
  _request: Request,
  context: { params: Promise<{ botId: string }> },
) {
  const { token, response } = await getBearerTokenOrResponse();
  if (response) return response;

  const { botId } = await context.params;

  try {
    const backendResponse = await fetch(
      embedUrl(`/configs/${encodeURIComponent(botId)}/rotate-key`),
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (!backendResponse.ok) {
      return NextResponse.json(
        { detail: await readBackendError(backendResponse) },
        { status: backendResponse.status },
      );
    }

    const data = (await backendResponse.json()) as BackendApiKeyCreated;
    // The raw key is only ever available here — the UI shows it once.
    return NextResponse.json({ apiKey: data.api_key, key: toApiKey(data) });
  } catch (error) {
    return NextResponse.json(
      {
        detail:
          error instanceof Error
            ? error.message
            : "Unable to reach the embed service.",
      },
      { status: 502 },
    );
  }
}
