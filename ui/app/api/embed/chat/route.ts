import { NextResponse } from "next/server";
import { readBackendError, widgetUrl } from "@/lib/backend";
import { corsPreflight, withCors } from "@/lib/cors";

/**
 * Public: relays a widget message to the embed chat pipeline. Document
 * scoping is resolved server-side from the key, so nothing about the
 * knowledge base is exposed to the browser.
 */
export async function OPTIONS(request: Request) {
  return corsPreflight(request.headers.get("origin"));
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const apiKey =
    request.headers.get("x-api-key") ?? url.searchParams.get("apiKey");
  const origin = request.headers.get("origin");

  if (!apiKey) {
    return withCors(
      NextResponse.json({ detail: "An API key is required." }, { status: 401 }),
      origin,
    );
  }

  const body = (await request.json()) as {
    message?: string;
    thread_id?: string;
    visitor_email?: string;
    page_url?: string;
  };

  if (!body.message?.trim()) {
    return withCors(
      NextResponse.json({ detail: "Message is required." }, { status: 400 }),
      origin,
    );
  }

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
      return withCors(
        NextResponse.json(
          { detail: await readBackendError(backendResponse) },
          { status: backendResponse.status },
        ),
        origin,
      );
    }

    return withCors(NextResponse.json(await backendResponse.json()), origin);
  } catch (error) {
    return withCors(
      NextResponse.json(
        {
          detail:
            error instanceof Error
              ? error.message
              : "Unable to reach the embed service.",
        },
        { status: 502 },
      ),
      origin,
    );
  }
}
