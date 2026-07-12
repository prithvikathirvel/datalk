import { NextResponse } from "next/server";
import { backendUrls, getBearerTokenOrResponse, joinUrl } from "@/lib/backend";

export async function POST(request: Request) {
  const { token, response } = await getBearerTokenOrResponse();
  if (response) {
    return response;
  }

  const incomingUrl = new URL(request.url);
  const uploadType = incomingUrl.searchParams.get("upload_type") ?? "both";
  const formData = await request.formData();

  try {
    const backendResponse = await fetch(
      joinUrl(
        backendUrls.ingestion,
        `/ingest/upload?upload_type=${encodeURIComponent(uploadType)}`,
      ),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
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
          error instanceof Error ? error.message : "Unable to upload document.",
      },
      { status: 502 },
    );
  }
}
