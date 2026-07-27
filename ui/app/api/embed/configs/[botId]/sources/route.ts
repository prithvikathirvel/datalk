import { NextResponse } from "next/server";
import {
  embedUrl,
  getBearerTokenOrResponse,
  readBackendError,
} from "@/lib/backend";
import {
  type BackendEmbedConfigSource,
  toEmbedConfigSource,
} from "@/lib/embed-mappers";

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
      embedUrl(`/configs/${encodeURIComponent(botId)}/sources`),
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

    const data = (await backendResponse.json()) as BackendEmbedConfigSource[];
    return NextResponse.json({ sources: data.map(toEmbedConfigSource) });
  } catch (error) {
    return failure(error);
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ botId: string }> },
) {
  const { token, response } = await getBearerTokenOrResponse();
  if (response) return response;

  const { botId } = await context.params;
  const body = (await request.json()) as {
    documents?: Array<{ documentId?: string; documentFilename?: string }>;
  };

  const documents = (body.documents ?? [])
    .filter((doc) => doc.documentId && doc.documentFilename)
    .map((doc) => ({
      document_id: String(doc.documentId),
      document_filename: String(doc.documentFilename),
    }));

  if (documents.length === 0) {
    return NextResponse.json(
      { detail: "At least one document is required." },
      { status: 400 },
    );
  }

  try {
    // The backend POST only upserts — it never removes. To make the UI's
    // replace-all save behave, clear existing sources first.
    const clearResponse = await fetch(
      embedUrl(`/configs/${encodeURIComponent(botId)}/sources`),
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (!clearResponse.ok) {
      return NextResponse.json(
        { detail: await readBackendError(clearResponse) },
        { status: clearResponse.status },
      );
    }

    const backendResponse = await fetch(
      embedUrl(`/configs/${encodeURIComponent(botId)}/sources`),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ documents }),
      },
    );

    if (!backendResponse.ok) {
      return NextResponse.json(
        { detail: await readBackendError(backendResponse) },
        { status: backendResponse.status },
      );
    }

    const data = (await backendResponse.json()) as BackendEmbedConfigSource[];
    return NextResponse.json({ sources: data.map(toEmbedConfigSource) });
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
      embedUrl(`/configs/${encodeURIComponent(botId)}/sources`),
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
