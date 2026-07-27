import { NextResponse } from "next/server";
import {
  embedUrl,
  getBearerTokenOrResponse,
  readBackendError,
} from "@/lib/backend";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ botId: string; documentId: string }> },
) {
  const { token, response } = await getBearerTokenOrResponse();
  if (response) return response;

  const { botId, documentId } = await context.params;

  try {
    const backendResponse = await fetch(
      embedUrl(
        `/configs/${encodeURIComponent(botId)}/sources/${encodeURIComponent(documentId)}`,
      ),
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
