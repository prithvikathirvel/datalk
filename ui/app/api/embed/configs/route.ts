import { NextResponse } from "next/server";
import {
  embedUrl,
  getBearerTokenOrResponse,
  readBackendError,
} from "@/lib/backend";
import {
  type BackendApiKeyCreated,
  type BackendEmbedConfig,
  type EmbedConfigFormInput,
  toApiKey,
  toBackendConfigPayload,
  toEmbedConfig,
} from "@/lib/embed-mappers";

export async function GET() {
  const { token, response } = await getBearerTokenOrResponse();
  if (response) return response;

  try {
    const backendResponse = await fetch(embedUrl("/configs"), {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!backendResponse.ok) {
      return NextResponse.json(
        { detail: await readBackendError(backendResponse) },
        { status: backendResponse.status },
      );
    }

    const data = (await backendResponse.json()) as BackendEmbedConfig[];
    // Map through toEmbedConfig so the UI always receives the full contract
    // shape (defaults filled, optional widget dimensions normalised).
    return NextResponse.json({ configs: data.map(toEmbedConfig) });
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

export async function POST(request: Request) {
  const { token, response } = await getBearerTokenOrResponse();
  if (response) return response;

  const body = (await request.json()) as EmbedConfigFormInput & { id?: string };

  // The backend splits create (POST, issues a key) from update (PUT). The
  // presence of an id decides which one this save maps to.
  const isUpdate = Boolean(body.id);
  const url = isUpdate
    ? embedUrl(`/configs/${encodeURIComponent(String(body.id))}`)
    : embedUrl("/configs");

  try {
    const backendResponse = await fetch(url, {
      method: isUpdate ? "PUT" : "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(toBackendConfigPayload(body)),
    });

    if (!backendResponse.ok) {
      return NextResponse.json(
        { detail: await readBackendError(backendResponse) },
        { status: backendResponse.status },
      );
    }

    const data = (await backendResponse.json()) as
      | BackendEmbedConfig
      | { config: BackendEmbedConfig; api_key: BackendApiKeyCreated };

    if ("config" in data && data.config) {
      return NextResponse.json({
        config: toEmbedConfig(data.config),
        // Raw key — forwarded once so the UI can show the one-time modal.
        apiKey: data.api_key?.api_key,
        key: data.api_key ? toApiKey(data.api_key) : undefined,
      });
    }

    return NextResponse.json({
      config: toEmbedConfig(data as BackendEmbedConfig),
    });
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
