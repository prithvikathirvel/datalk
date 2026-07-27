import type { PresignedUrlRequest, PresignedUrlResponse } from "@template/contracts";
import { NextResponse } from "next/server";
import { getBearerTokenOrResponse } from "@/lib/backend";

const INGEST_API_BASE =
  "https://6aab78sbih.execute-api.ap-south-1.amazonaws.com";

export async function POST(request: Request) {
  const { token, response } = await getBearerTokenOrResponse();
  if (response) return response;

  let body: PresignedUrlRequest;
  try {
    body = (await request.json()) as PresignedUrlRequest;
  } catch {
    return NextResponse.json({ detail: "Invalid JSON body." }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${INGEST_API_BASE}/presigned-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const contentType = upstream.headers.get("content-type") ?? "";
    const data = contentType.includes("application/json")
      ? ((await upstream.json()) as PresignedUrlResponse)
      : { detail: await upstream.text() };

    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    return NextResponse.json(
      {
        detail:
          error instanceof Error
            ? error.message
            : "Unable to reach presigned-url service.",
      },
      { status: 502 },
    );
  }
}
