import { NextResponse } from "next/server";
import { backendUrls, getBearerTokenOrResponse, joinUrl } from "@/lib/backend";

export async function DELETE(request: Request) {
  const { token, response } = await getBearerTokenOrResponse();
  if (response) {
    return response;
  }

  const url = new URL(request.url);
  const filePath = url.searchParams.get("file_path");
  if (!filePath) {
    return NextResponse.json(
      { detail: "file_path is required." },
      { status: 400 },
    );
  }

  try {
    const backendResponse = await fetch(
      joinUrl(
        backendUrls.ingestion,
        `/ingest/delete-file?file_path=${encodeURIComponent(filePath)}`,
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
