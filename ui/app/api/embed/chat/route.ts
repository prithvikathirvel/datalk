import { NextResponse } from "next/server";
import { readBackendError, widgetUrl } from "@/lib/backend";

/**
 * Public: relays a widget message to the embed chat pipeline. Document
 * scoping is resolved server-side from the key, so nothing about the
 * knowledge base is exposed to the browser.
 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const apiKey =
    request.headers.get("x-api-key") ?? url.searchParams.get("apiKey");

  if (!apiKey) {
    return NextResponse.json(
      { detail: "An API key is required." },
      { status: 401 },
    );
  }

  const body = (await request.json()) as {
    message?: string;
    thread_id?: string;
    visitor_email?: string;
    page_url?: string;
  };

  if (!body.message?.trim()) {
    return NextResponse.json(
      { detail: "Message is required." },
      { status: 400 },
    );
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  try {
    const backendResponse = await fetch(widgetUrl("chat"), {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/json",
        ...(origin && { origin }),
        ...(referer && { referer }),
      },
      body: JSON.stringify({
        message: body.message,
        thread_id: body.thread_id ?? null,
        visitor_email: body.visitor_email || null,
        page_url: body.page_url || null,
      }),
    });

    if (!backendResponse.ok) {
      return NextResponse.json(
        { detail: await readBackendError(backendResponse) },
        { status: backendResponse.status },
      );
    }

    return NextResponse.json(await backendResponse.json());
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
