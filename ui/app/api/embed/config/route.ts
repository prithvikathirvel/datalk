import { NextResponse } from "next/server";
import { embedUrl, readBackendError } from "@/lib/backend";
import { type BackendEmbedConfig, toEmbedConfig } from "@/lib/embed-mappers";

/**
 * Public: resolves an API key to its chatbot's display configuration.
 * No session — the `X-Api-Key` header (or `?apiKey=`) is the credential.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const apiKey =
    request.headers.get("x-api-key") ?? url.searchParams.get("apiKey");

  if (!apiKey) {
    return NextResponse.json(
      { detail: "An API key is required." },
      { status: 401 },
    );
  }

  try {
    const backendResponse = await fetch(embedUrl("/config"), {
      method: "GET",
      headers: { "X-Api-Key": apiKey },
      cache: "no-store",
    });

    if (!backendResponse.ok) {
      return NextResponse.json(
        { detail: await readBackendError(backendResponse) },
        { status: backendResponse.status },
      );
    }

    const data = (await backendResponse.json()) as BackendEmbedConfig;
    return NextResponse.json({ config: toEmbedConfig(data) });
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
