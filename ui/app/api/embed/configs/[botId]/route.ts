import { NextResponse } from "next/server";
import {
  embedUrl,
  getBearerTokenOrResponse,
  readBackendError,
} from "@/lib/backend";
import { type BackendEmbedConfig, toEmbedConfig } from "@/lib/embed-mappers";

function failure(error: unknown) {
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

export async function GET(
  _request: Request,
  context: { params: Promise<{ botId: string }> },
) {
  const { token, response } = await getBearerTokenOrResponse();
  if (response) return response;

  const { botId } = await context.params;

  try {
    const backendResponse = await fetch(
      embedUrl(`/configs/${encodeURIComponent(botId)}`),
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      },
    );

    if (!backendResponse.ok) {
      return NextResponse.json(
        { detail: await readBackendError(backendResponse) },
        { status: backendResponse.status },
      );
    }

    const data = (await backendResponse.json()) as BackendEmbedConfig;
    return NextResponse.json({ config: toEmbedConfig(data) });
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ botId: string }> },
) {
  const { token, response } = await getBearerTokenOrResponse();
  if (response) return response;

  const { botId } = await context.params;

  try {
    const backendResponse = await fetch(
      embedUrl(`/configs/${encodeURIComponent(botId)}`),
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (!backendResponse.ok) {
      return NextResponse.json(
        { detail: await readBackendError(backendResponse) },
        { status: backendResponse.status },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return failure(error);
  }
}
