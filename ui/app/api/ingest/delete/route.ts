import { NextResponse } from "next/server";
import { backendUrls, getBearerTokenOrResponse, joinUrl } from "@/lib/backend";

export async function DELETE(request: Request) {
  const { token, response } = await getBearerTokenOrResponse();
  if (response) {
    return response;
  }

  const url = new URL(request.url);
  const filename = url.searchParams.get("filename");
  const type = url.searchParams.get("type");
  if (!filename || !type) {
    return NextResponse.json(
      { detail: "filename and type are required." },
      { status: 400 },
    );
  }

  try {
    const backendResponse = await fetch(
      joinUrl(
        backendUrls.ingestion,
        `/rag/api/v1/documents/delete-file?document_id=${encodeURIComponent(filename)}&type=${encodeURIComponent(type)}`,
      ),
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const contentType = backendResponse.headers.get("content-type") ?? "";
    const data = contentType.includes("application/json")
      ? await backendResponse.json()
      : { message: await backendResponse.text() };
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    return NextResponse.json(
      {
        detail:
          error instanceof Error ? error.message : "Unable to delete document.",
      },
      { status: 502 },
    );
  }
}
