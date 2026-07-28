import type { EmbedFeedback } from "@template/contracts";
import { NextResponse } from "next/server";
import {
  embedUrl,
  getBearerTokenOrResponse,
  readBackendError,
  widgetUrl,
} from "@/lib/backend";
import {
  type BackendEmbedFeedback,
  toEmbedFeedback,
} from "@/lib/embed-mappers";

/** Public: submits widget feedback, authenticated by API key. */
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
    threadId?: string;
    question?: string;
    answer?: string;
    visitorEmail?: string;
    pageUrl?: string;
    parentOrigin?: string;
    reason?: EmbedFeedback["reason"];
  };

  if (!body.question?.trim()) {
    return NextResponse.json(
      { detail: "Question is required." },
      { status: 400 },
    );
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  try {
    const backendResponse = await fetch(widgetUrl("feedback"), {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/json",
        ...(origin && { origin }),
        ...(referer && { referer }),
      },
      body: JSON.stringify({
        thread_id: body.threadId || null,
        question: body.question,
        answer: body.answer || null,
        // Backend validates this as an email — omit rather than send "".
        visitor_email: body.visitorEmail?.trim() || null,
        page_url: body.pageUrl || null,
        parent_origin: body.parentOrigin || null,
        reason: body.reason ?? "not_helpful",
      }),
    });

    if (!backendResponse.ok) {
      return NextResponse.json(
        { detail: await readBackendError(backendResponse) },
        { status: backendResponse.status },
      );
    }

    const data = (await backendResponse.json()) as BackendEmbedFeedback;
    return NextResponse.json(
      { feedback: toEmbedFeedback(data) },
      { status: 201 },
    );
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

export async function GET(request: Request) {
  const { token, response } = await getBearerTokenOrResponse();
  if (response) return response;

  const botId = new URL(request.url).searchParams.get("botId");

  try {
    const backendResponse = await fetch(embedUrl("/feedback"), {
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

    const data = (await backendResponse.json()) as BackendEmbedFeedback[];
    // The backend returns feedback across every chatbot; narrow it here since
    // it exposes no per-bot filter.
    const feedback = data
      .map(toEmbedFeedback)
      .filter((item) => !botId || item.botId === botId);

    return NextResponse.json({ feedback });
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
